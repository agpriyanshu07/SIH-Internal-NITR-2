import { SCREENING_THRESHOLD_KM, SEPARATION_SPAN_MIN } from '../data/conjunctions';
import type { ResolvedConjunction } from '../data/types';

/**
 * Separation versus time about TCA.
 *
 * One deliberate departure from the artboard: the y-axis is logarithmic.
 * Separation runs from a few hundred metres at TCA to roughly 30,000 km forty
 * minutes either side, so on a linear axis the entire interesting region — the
 * miss distance, the 1 km screening threshold, the shape of the dip — collapses
 * onto the baseline and the chart says nothing. A log axis keeps the design's
 * exact chrome (dashed threshold, dashed TCA rule, annotated minimum) while
 * making the numbers legible.
 */

const W = 980;
const H = 300;
const PAD = { l: 62, r: 20, t: 18, b: 34 };

export function SeparationChart({ event }: { event: ResolvedConjunction }) {
  const seps = event.separation.map((p) => p.sep);
  const lo = Math.min(...seps, SCREENING_THRESHOLD_KM) * 0.45;
  const hi = Math.max(...seps) * 1.3;

  const l10 = Math.log10;
  const sx = (t: number) =>
    PAD.l + ((t + SEPARATION_SPAN_MIN) / (SEPARATION_SPAN_MIN * 2)) * (W - PAD.l - PAD.r);
  const sy = (v: number) =>
    H - PAD.b - ((l10(Math.max(v, lo)) - l10(lo)) / (l10(hi) - l10(lo))) * (H - PAD.t - PAD.b);

  const path = event.separation
    .map((p, i) => `${i ? 'L' : 'M'}${sx(p.t).toFixed(1)} ${sy(p.sep).toFixed(1)}`)
    .join(' ');

  // One tick per decade inside the domain.
  const decades: number[] = [];
  for (let e = Math.floor(l10(lo)); e <= Math.ceil(l10(hi)); e++) {
    const v = 10 ** e;
    if (v >= lo && v <= hi) decades.push(v);
  }

  const tickLabel = (v: number) =>
    v >= 1000 ? `${v / 1000}k` : v >= 1 ? String(v) : v.toFixed(v < 0.1 ? 2 : 1);

  const xTicks = [-40, -20, 0, 20, 40];
  const tcaX = sx(0);
  const tcaY = sy(event.miss);
  const threshY = sy(SCREENING_THRESHOLD_KM);
  const breached = event.miss < SCREENING_THRESHOLD_KM;

  return (
    <div className="px-4 pb-[10px] pt-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img"
           aria-label={`Separation falls to a minimum of ${event.miss.toFixed(3)} kilometres at time of closest approach.`}>
        <g stroke="var(--grid)" strokeWidth={1}>
          {decades.map((v) => (
            <line key={v} x1={PAD.l} y1={sy(v)} x2={W - PAD.r} y2={sy(v)} />
          ))}
          <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H - PAD.b} />
        </g>

        <g fontFamily="IBM Plex Mono, monospace" fontSize={10} fill="var(--t3)">
          {decades.map((v) => (
            <text key={v} x={PAD.l - 10} y={sy(v)} dy={3} textAnchor="end">{tickLabel(v)}</text>
          ))}
          {xTicks.map((t) => (
            <text key={t} x={sx(t)} y={H - 14} textAnchor="middle">{t > 0 ? `+${t}` : t}</text>
          ))}
          {/* Both axis captions sit on the top rule, clear of the tick labels. */}
          <text x={PAD.l} y={12} fontSize={9} letterSpacing={1}>KM — LOG</text>
          <text x={W - PAD.r} y={12} textAnchor="end" fontSize={9} letterSpacing={1}>
            MINUTES FROM TCA
          </text>
        </g>

        {/* Screening threshold */}
        <line x1={PAD.l} y1={threshY} x2={W - PAD.r} y2={threshY}
              stroke="var(--risk-high)" strokeWidth={1} strokeDasharray="4 4" />

        {/* Separation curve */}
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth={1.6}
              strokeLinejoin="round" />

        {/* TCA */}
        <line x1={tcaX} y1={PAD.t} x2={tcaX} y2={H - PAD.b}
              stroke="var(--t3)" strokeWidth={1} strokeDasharray="2 3" />
        <circle cx={tcaX} cy={tcaY} r={3.5} fill="var(--accent)" />
        <text x={tcaX} y={tcaY} dx={12} dy={-9}
              fontFamily="IBM Plex Mono, monospace" fontSize={10} fill="var(--t1)">
          TCA — {event.miss.toFixed(3)} km
        </text>
        {breached && (
          <text x={tcaX} y={tcaY} dx={12} dy={5}
                fontFamily="IBM Plex Mono, monospace" fontSize={9}
                fill="var(--risk-high)" letterSpacing={0.6}>
            BELOW THRESHOLD
          </text>
        )}
      </svg>
    </div>
  );
}
