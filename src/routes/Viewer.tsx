import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { OBJECTS } from '../data/objects';
import { RESOLVED } from '../data/conjunctions';
import { fmtNorad, fmtUTC } from '../data/format';
import { angularRate, palette, projectGlobe, projectOrbitPoint } from '../lib/projection';
import { Panel, Segmented } from '../components/primitives';
import { PauseIcon, PlayIcon } from '../components/Icon';
import { EPOCH_OFFSET } from '../hooks/useNow';
import type { SpaceObject } from '../data/types';
import { sliderFill } from '../lib/slider';

/**
 * 2D orbital viewer.
 *
 * Deliberately cheap: one canvas, no WebGL, no three.js, no Cesium. Orbits are
 * drawn as projected circles and objects as small squares moving along them.
 */

const RATES = [
  { label: '1×', value: '1' as const },
  { label: '60×', value: '60' as const },
  { label: '600×', value: '600' as const },
];

/** How far the scrubber can travel, in simulated seconds. */
/** Idle drift rate: a full turn in about 2.5 minutes. */
const AUTO_ROTATE_RAD_S = 0.042;

const SPAN_SECONDS = 6 * 3600;

interface Layers {
  payload: boolean;
  rocket: boolean;
  debris: boolean;
  flagged: boolean;
}

const LAYER_LABELS: { key: keyof Layers; label: string }[] = [
  { key: 'payload', label: 'Active satellites' },
  { key: 'rocket', label: 'Rocket bodies' },
  { key: 'debris', label: 'Debris' },
  { key: 'flagged', label: 'Flagged conjunctions' },
];

function LayerToggle({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    /*
     * The one control in the app with no hover state at all. Every other toggle
     * — the catalogue's ISRO filter, the log's prompted-by chip, Segmented —
     * lightens its text on hover; this row gave no feedback that it was a
     * control until you clicked it. `group` so the switch responds with the
     * label rather than only under the pointer.
     */
    <button type="button" role="switch" aria-checked={on} onClick={onToggle}
            className="group -mx-2 flex w-full items-center justify-between rounded px-2 py-[6px] text-left transition-colors hover:bg-panel-raised">
      <span className="text-sm+ text-secondary transition-colors group-hover:text-primary">{label}</span>
      <span className={`relative h-[14px] w-[26px] flex-none rounded-sm border transition-colors ${
        on ? 'border-accent-border bg-panel' : 'border-hairline bg-panel group-hover:border-[color:var(--t3)]'}`}>
        <span className={`absolute top-[2px] h-2 w-2 transition-all ${
          on ? 'right-[2px] bg-accent' : 'left-[2px] bg-[color:var(--t3)]'}`} />
      </span>
    </button>
  );
}

export function Viewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [layers, setLayers] = useState<Layers>({
    payload: true, rocket: true, debris: true, flagged: true,
  });
  const [playing, setPlaying] = useState(true);
  const [rate, setRate] = useState<'1' | '60' | '600'>('60');
  /*
   * Simulated seconds. The ref is the truth and the rAF loop owns it;
   * displayOffset is a 5 Hz copy that only the text and the scrubber read.
   */
  const offsetRef = useRef(0);
  const [displayOffset, setDisplayOffset] = useState(0);
  const [selected, setSelected] = useState<number>(25544);
  /*
   * Where the camera is, as an angle about the polar axis.
   *
   * projectOrbitPoint and projectGlobe already take a `spin` that rotates the
   * ascending node about that axis, so this is added to it — the same maths in
   * lib/projection, one more term. No second renderer, no 3D engine.
   */
  const azimuthRef = useRef(0);
  const [dragging, setDragging] = useState(false);

  const drawRef = useRef<() => void>(() => {});
  const needsDraw = useRef(true);
  const playingRef = useRef(playing);
  const rateRef = useRef(rate);
  const draggingRef = useRef(false);
  playingRef.current = playing;
  rateRef.current = rate;


  /** NORADs involved in a CRITICAL or HIGH event — marked with a dot ring. */
  const flagged = useMemo(() => {
    const s = new Set<number>();
    for (const e of RESOLVED) {
      if (e.sev === 'CRITICAL' || e.sev === 'HIGH') { s.add(e.a); s.add(e.b); }
    }
    return s;
  }, []);

  /** CRITICAL only — these are the few that also get their orbit path drawn. */
  const critical = useMemo(() => {
    const s = new Set<number>();
    for (const e of RESOLVED) {
      if (e.sev === 'CRITICAL') { s.add(e.a); s.add(e.b); }
    }
    return s;
  }, []);

  /** Objects drawn as moving dots. */
  const tracked = useMemo(
    () => OBJECTS.filter((_, i) => i % 6 === 0).slice(0, 64),
    [],
  );

  /**
   * Orbit paths are drawn for only a handful of objects. Every path at once
   * turns into an opaque shell in a flat projection and hides the Earth — the
   * arcs only read as arcs when there are few enough to follow individually.
   */
  const pathFor = useMemo(() => {
    const s = new Set<number>(tracked.filter((_, i) => i % 6 === 0).map((o) => o.norad));
    return s;
  }, [tracked]);

  const visible = useMemo(
    () => tracked.filter((o) =>
      (o.type === 'PAYLOAD' && layers.payload) ||
      (o.type === 'ROCKET BODY' && layers.rocket) ||
      (o.type === 'DEBRIS' && layers.debris)),
    [tracked, layers],
  );

  const selectedObject = OBJECTS.find((o) => o.norad === selected) ?? OBJECTS[0];

  /** Everything the traced set does not cover, drawn as points. Real objects. */
  const haze = useMemo(() => {
    const traced = new Set(tracked.map((o) => o.norad));
    return OBJECTS.filter((o) => !traced.has(o.norad));
  }, [tracked]);

  // Screen positions from the last frame, for click hit-testing.
  const hits = useRef<{ norad: number; x: number; y: number }[]>([]);


  /*
   * Drag to rotate. Pointer events rather than mouse events so a touchscreen
   * works, and pointer capture so a drag that leaves the canvas still tracks.
   *
   * `moved` is what separates a drag from a click: the canvas has always
   * selected the object under the cursor, and releasing after a three-pixel
   * wobble should still count as a click on it.
   */
  const drag = useRef({ x: 0, moved: 0 });

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, moved: 0 };
    draggingRef.current = true;
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // The ref, not the state: setDragging is asynchronous, so the first move
    // after a press can still see the old value. `dragging` state exists only
    // to swap the cursor.
    if (!draggingRef.current) return;
    const dx = e.clientX - drag.current.x;
    drag.current.x = e.clientX;
    drag.current.moved += Math.abs(dx);
    /*
     * Width read here, not inside the updater. React clears currentTarget when
     * the handler returns, and a functional setState runs after that — so
     * `e.currentTarget.clientWidth` in there is a read of null, which threw on
     * the first pointermove and took the whole route down with it. The canvas
     * vanished mid-drag. Found by counting canvases across a scripted drag.
     */
    const width = e.currentTarget.clientWidth || 1;
    // A drag across the full width of the canvas is one turn. Straight into
    // the ref: the loop paints it on the next frame, React is not involved.
    azimuthRef.current -= (dx / width) * Math.PI * 2;
    needsDraw.current = true;
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    /*
     * Guarded, because releasePointerCapture throws NotFoundError if the
     * element does not currently have capture — and the browser releases it
     * implicitly on pointerup, so the unguarded call threw on every single
     * release. Inside a React handler that unmounts the route: the canvas
     * disappeared the moment you let go of a drag. Caught by a probe reading
     * the canvas after mouse-up, not by looking at the code.
     */
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    draggingRef.current = false;
    setDragging(false);
    if (drag.current.moved < 4) selectAt(e);
  };

  /*
   * One render loop, outside React.
   *
   * Both the playback clock and the camera azimuth used to be React state
   * advanced inside their own requestAnimationFrame callbacks, so every frame
   * re-rendered the whole route and re-ran a 165-line effect in order to redraw
   * a canvas. React was being asked to reconcile a component tree sixty times a
   * second to move a dot. That is what the choppiness was: not the projection
   * maths, not the frame budget, the reconciliation between frames.
   *
   * Now the two values live in refs, one rAF loop mutates them and calls the
   * draw function directly, and React never sees a frame. `needsDraw` lets a
   * genuine state change — a layer toggled, a different object selected — ask
   * for a repaint without the loop having to redraw a still scene forever.
   */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const p = palette();
    const cx = w / 2;
    const cy = h / 2;
    const scale = Math.min(w, h) * 0.21;
    // Earth's actual rotation rate, plus wherever the camera has been dragged
    // or drifted to. The scene's own motion and the viewer's are the same term.
    const spin = offsetRef.current * 7.292e-5 + azimuthRef.current;

    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1;

    /**
     * Everything is drawn in three depth passes — orbit arcs behind the Earth,
     * then the Earth itself as an opaque disc, then the arcs in front. That one
     * ordering is what makes a flat projection read as a sphere; without it the
     * orbits pile into a transparent ball and the Earth disappears.
     */
    type Path = { pts: { x: number; y: number; z: number }[]; stroke: string; alpha: number };
    const paths: Path[] = [];
    const nextHits: { norad: number; x: number; y: number }[] = [];
    const marks: { x: number; y: number; z: number; size: number; fill: string; ring?: string }[] = [];

    for (const o of visible) {
      const params = { alt: o.alt, incl: o.incl, raan: o.raan, phase: (o.ma * Math.PI) / 180 };
      const isSel = o.norad === selected;
      const isCritical = layers.flagged && critical.has(o.norad);
      const isFlagged = layers.flagged && flagged.has(o.norad);

      if (isSel || isCritical || pathFor.has(o.norad)) {
        const pts = [];
        for (let i = 0; i <= 128; i++) {
          pts.push(projectOrbitPoint(params, (i / 128) * Math.PI * 2, cx, cy, scale, spin));
        }
        paths.push({
          pts,
          stroke: isSel ? p.accent : isCritical ? p.critical : p.soft,
          alpha: isSel ? 1 : isCritical ? 0.75 : 0.55,
        });
      }

      const pt = projectOrbitPoint(params, params.phase + angularRate(o.period) * offsetRef.current, cx, cy, scale, spin);
      nextHits.push({ norad: o.norad, x: pt.x, y: pt.y });
      marks.push({
        ...pt,
        size: isSel ? 7 : isFlagged ? 5 : 3,
        fill: isSel ? p.accent : isFlagged ? p.critical : o.type === 'DEBRIS' ? p.t3 : p.t2,
        ring: isSel ? p.accent : isCritical ? p.critical : undefined,
      });
    }
    hits.current = nextHits;

    /*
     * The rest of the catalogue, behind the 64 objects that get traced orbits.
     *
     * This was 260 points invented from modular arithmetic on the loop index —
     * `alt: 300 + ((i * 137) % 1500)`, inclination `(i * 47) % 100` — drawn
     * under a layer toggle labelled "Debris". The same fabrication that was
     * removed from the landing hero, still here, in the console. Real objects
     * now, with their real altitude, inclination, RAAN and mean anomaly, moving
     * at their own rates. It reads better too: a real catalogue clusters into
     * shells and planes where the generated one smeared evenly.
     */
    if (layers.debris) {
      for (const o of haze) {
        const params = { alt: o.alt, incl: o.incl, raan: o.raan, phase: (o.ma * Math.PI) / 180 };
        const pt = projectOrbitPoint(params, params.phase + angularRate(o.period) * offsetRef.current, cx, cy, scale, spin);
        marks.push({ ...pt, size: 1.6, fill: p.nominal });
      }
    }

    /** Stroke only the runs of a path on the requested side of the globe. */
    const strokeSide = (path: Path, front: boolean) => {
      ctx.strokeStyle = path.stroke;
      ctx.globalAlpha = path.alpha * (front ? 1 : 0.4);
      let open = false;
      for (const pt of path.pts) {
        const onSide = front ? pt.z >= 0 : pt.z < 0;
        // A point in front of the globe is always visible; one behind is hidden
        // only where it actually falls within the Earth's silhouette.
        const hidden = !front && Math.hypot(pt.x - cx, pt.y - cy) < scale;
        if (!onSide || hidden) { open = false; continue; }
        if (!open) { ctx.beginPath(); ctx.moveTo(pt.x, pt.y); open = true; }
        else ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    const drawMark = (m: (typeof marks)[number]) => {
      ctx.fillStyle = m.fill;
      ctx.fillRect(m.x - m.size / 2, m.y - m.size / 2, m.size, m.size);
      if (m.ring) {
        ctx.beginPath();
        ctx.strokeStyle = m.ring;
        ctx.globalAlpha = 0.8;
        ctx.arc(m.x, m.y, m.size + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    };

    // 1 — behind the Earth
    for (const path of paths) strokeSide(path, false);
    for (const m of marks) {
      if (m.z < 0 && Math.hypot(m.x - cx, m.y - cy) > scale) {
        ctx.globalAlpha = 0.45;
        drawMark(m);
        ctx.globalAlpha = 1;
      }
    }

    // 2 — the Earth: an opaque disc with a front-facing graticule
    ctx.beginPath();
    ctx.fillStyle = p.globe;
    ctx.arc(cx, cy, scale, 0, Math.PI * 2);
    ctx.fill();

    const graticule = (points: { x: number; y: number; z: number }[], stroke: string) => {
      ctx.strokeStyle = stroke;
      let open = false;
      for (const pt of points) {
        if (pt.z < 0) { open = false; continue; }
        if (!open) { ctx.beginPath(); ctx.moveTo(pt.x, pt.y); open = true; }
        else ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      }
    };

    for (let k = -4; k <= 4; k++) {
      const pts = [];
      for (let i = 0; i <= 128; i++) {
        pts.push(projectGlobe((k * Math.PI) / 10, (i / 128) * Math.PI * 2, cx, cy, scale, spin));
      }
      graticule(pts, k === 0 ? p.line : p.soft);
    }
    for (let k = 0; k < 12; k++) {
      const pts = [];
      for (let i = 0; i <= 80; i++) {
        pts.push(projectGlobe(-Math.PI / 2 + (i / 80) * Math.PI, (k * Math.PI) / 6, cx, cy, scale, spin));
      }
      graticule(pts, p.soft);
    }

    ctx.beginPath();
    ctx.strokeStyle = p.line;
    ctx.arc(cx, cy, scale, 0, Math.PI * 2);
    ctx.stroke();

    // 3 — in front of the Earth
    for (const path of paths) strokeSide(path, true);
    for (const m of marks) {
      if (m.z >= 0 || Math.hypot(m.x - cx, m.y - cy) > scale) drawMark(m);
    }
  }, [visible, selected, layers, flagged, critical, pathFor, haze]);

  // Latest closure, and a repaint for whatever changed it.
  useEffect(() => {
    drawRef.current = draw;
    needsDraw.current = true;
  }, [draw]);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let last = performance.now();
    let lastText = 0;
    const loop = (t: number) => {
      const dt = Math.min(0.1, (t - last) / 1000);
      last = t;

      if (playingRef.current) {
        offsetRef.current = (offsetRef.current + dt * +rateRef.current) % SPAN_SECONDS;
        needsDraw.current = true;
      }
      // Idle drift, and only when idle — same guard as before.
      if (!draggingRef.current && !reduced) {
        azimuthRef.current += dt * AUTO_ROTATE_RAD_S;
        needsDraw.current = true;
      }

      if (needsDraw.current) {
        needsDraw.current = false;
        drawRef.current();
      }

      /*
       * The text readouts run at 5 Hz on their own budget. A timestamp and a
       * scrubber position do not need sixty updates a second, and putting them
       * on the frame clock is what forced the re-render in the first place.
       */
      if (t - lastText > 200) {
        lastText = t;
        setDisplayOffset(offsetRef.current);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);


  const selectAt = (e: { clientX: number; clientY: number; currentTarget: HTMLCanvasElement }) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    let best: { norad: number; d: number } | null = null;
    for (const hit of hits.current) {
      const d = Math.hypot(hit.x - x, hit.y - y);
      if (d < 14 && (!best || d < best.d)) best = { norad: hit.norad, d };
    }
    if (best) setSelected(best.norad);
  };

  /*
   * The viewer runs on the console clock, not the wall clock. Everything else
   * on the console is anchored to the snapshot capture instant; a scrubber
   * reading today's date beside a top bar reading the capture date would be a
   * contradiction the operator has to resolve themselves.
   */
  const simTime = new Date(Date.now() + EPOCH_OFFSET + displayOffset * 1000);

  return (
    <div className="relative h-full min-h-[640px]">
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-label="Orbital viewer. Drag to rotate the view."
        className={`absolute inset-0 h-full w-full touch-none ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      />

      <div className="pointer-events-none absolute left-6 top-6 flex flex-col gap-[6px]">
        <div className="text-base font-semibold tracking-[0.06em] text-primary">KESSLER</div>
        <div className="label">Orbital viewer — inertial frame · schematic projection</div>
      </div>

      {/* Layers + object list */}
      <div className="glass lift absolute right-6 top-6 w-[296px] overflow-hidden rounded-md border border-hairline bg-panel">
        <div className="flex h-[34px] items-center border-b border-hairline px-[13px]">
          <div className="label">Layers</div>
        </div>
        <div className="flex flex-col px-[13px] py-[11px]">
          {LAYER_LABELS.map((l) => (
            <LayerToggle
              key={l.key}
              label={l.label}
              on={layers[l.key]}
              onToggle={() => setLayers((s) => ({ ...s, [l.key]: !s[l.key] }))}
            />
          ))}
        </div>
        <div className="flex h-[34px] items-center justify-between border-y border-hairline px-[13px]">
          <div className="label">Tracked objects</div>
          <div className="num text-2xs text-tertiary">{visible.length}</div>
        </div>
        <div className="max-h-[240px] overflow-auto">
          {visible.slice(0, 40).map((o: SpaceObject) => (
            <button
              key={o.norad}
              type="button"
              onClick={() => setSelected(o.norad)}
              className={`flex w-full items-center justify-between gap-2 border-b border-hairline-soft px-[13px] py-[9px] text-left ${
                o.norad === selected
                  ? 'rise bg-panel-raised shadow-[inset_2px_0_0_0_var(--accent)]'
                  : 'hover:bg-panel-raised'
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm text-primary">{o.name}</span>
                <span className="block font-mono text-[9.5px] tracking-data text-tertiary">{o.type}</span>
              </span>
              <span className="num flex-none text-xs text-secondary">{fmtNorad(o.norad)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected object card */}
      <div className="absolute bottom-6 left-6 w-[308px]">
        <Panel
          title="Selected"
          aside={<span className="num text-xs- text-tertiary">{fmtNorad(selectedObject.norad)}</span>}
          
        >
          <div className="p-[13px]">
            <div className="mb-[2px] text-lg font-medium text-primary">{selectedObject.name}</div>
            <div className="mb-[14px] font-mono text-[9.5px] tracking-[0.08em] text-tertiary">
              {selectedObject.type} · {selectedObject.op}
            </div>
            <div className="grid grid-cols-3 gap-[10px]">
              {[
                ['Alt', selectedObject.alt, 'km'],
                ['Incl', selectedObject.incl.toFixed(2), '°'],
                ['Period', selectedObject.period.toFixed(1), 'min'],
              ].map(([k, v, u]) => (
                <div key={k as string}>
                  <div className="mb-[3px] font-mono text-2xs uppercase tracking-[0.08em] text-tertiary">{k}</div>
                  <div className="num text-base text-primary">
                    {v}<span className="text-2xs text-tertiary"> {u}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* Time scrubber */}
      <div className="glass lift absolute bottom-6 left-1/2 w-[min(640px,calc(100%-3rem))] -translate-x-1/2 rounded-md border border-hairline bg-panel px-4 py-[13px]">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause' : 'Play'}
            className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded border border-hairline text-accent transition-colors hover:border-accent-border"
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <div className="flex min-w-0 flex-1 flex-col gap-[7px]">
            <div className="flex items-baseline justify-between gap-3">
              <span className="num text-xs text-primary">{fmtUTC(simTime)}</span>
              {/* "Schematic", not "propagated". The screening engine runs SGP4;
                  this canvas draws circular two-body orbits from each object's
                  real elements, which reads correctly at a glance but is not the
                  same computation. Calling it propagated would borrow the
                  engine's credibility for a picture. */}
              <span
                className="label"
                title="Orbits are drawn as circles from each object's real inclination, RAAN and mean motion. Conjunction geometry comes from the SGP4 screening run, not from this canvas."
              >
                Schematic · {rate === '1' ? 'real time' : `${rate}×`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={SPAN_SECONDS}
              step={60}
              value={displayOffset}
              onChange={(e) => {
                // Scrubbing writes the ref the loop reads, and the display copy
                // so the input stays controlled between 5 Hz ticks.
                offsetRef.current = +e.target.value;
                needsDraw.current = true;
                setDisplayOffset(+e.target.value);
              }}
              aria-label="Simulated time"
              style={sliderFill(displayOffset, 0, SPAN_SECONDS)}
              className="k-slider"
            />
          </div>

          <Segmented segments={RATES} value={rate} onChange={setRate} />
        </div>
      </div>
    </div>
  );
}
