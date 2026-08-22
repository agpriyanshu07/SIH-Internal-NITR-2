import { useMemo } from 'react';
import { OBJECTS } from '../data/objects';
import type { ResolvedConjunction } from '../data/types';
import { SEVERITY_RANK } from '../data/riskScore';

/**
 * Where the flagged events sit in orbital phase space.
 *
 * A world map would show ground tracks, which for a conjunction is close to
 * meaningless — the event happens at an altitude and in a plane, and a ground
 * position at TCA tells an operator nothing actionable. The design plots
 * altitude against inclination instead, which is where the congested regimes
 * actually show up: the sun-synchronous wall near 98°, the Starlink shells
 * around 53°, the Iridium plane at 86°.
 */

const W = 420;
const H = 210;
const PAD = { l: 28, r: 20, t: 14, b: 26 };
const MAX_ALT = 1300;
const MAX_INCL = 110;

const px = (incl: number) => PAD.l + (incl / MAX_INCL) * (W - PAD.l - PAD.r);
const py = (alt: number) => H - PAD.b - (alt / MAX_ALT) * (H - PAD.t - PAD.b);

export function RegimePlot({ events }: { events: ResolvedConjunction[] }) {
  const points = useMemo(() => {
    // Worst severity each object is currently involved in, if any.
    const flagged = new Map<number, ResolvedConjunction['sev']>();
    for (const e of events) {
      for (const norad of [e.a, e.b]) {
        const prev = flagged.get(norad);
        if (!prev || SEVERITY_RANK[e.sev] > SEVERITY_RANK[prev]) flagged.set(norad, e.sev);
      }
    }

    return OBJECTS.map((o) => {
      const sev = flagged.get(o.norad);
      const hot = sev === 'CRITICAL' || sev === 'HIGH';
      return {
        norad: o.norad,
        name: o.name,
        cx: px(o.incl),
        cy: py(Math.min(o.alt, MAX_ALT)),
        r: hot ? 4 : sev ? 3 : 1.9,
        sev: sev ?? 'NOMINAL',
        hot,
      };
    });
  }, [events]);

  const yTicks = [0, 325, 650, 975];
  const xTicks = [30, 55, 80, 105];
  const hotCount = points.filter((p) => p.hot).length;

  return (
    <div className="p-3">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img"
           aria-label={`Altitude against inclination for ${points.length} catalogued objects; ${hotCount} involved in high-risk events.`}>
        <g stroke="var(--grid)" strokeWidth={1}>
          <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r + 16} y2={H - PAD.b} />
          <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H - PAD.b} />
          {yTicks.slice(1).map((t) => (
            <line key={t} x1={PAD.l} y1={py(t)} x2={W - PAD.r + 16} y2={py(t)} />
          ))}
          {xTicks.map((t) => (
            <line key={t} x1={px(t)} y1={PAD.t} x2={px(t)} y2={H - PAD.b} />
          ))}
        </g>

        <g fontFamily="IBM Plex Mono, monospace" fontSize={8} fill="var(--t3)">
          {yTicks.map((t) => (
            <text key={t} x={PAD.l - 6} y={py(t)} dy={3} textAnchor="end">{t}</text>
          ))}
          {xTicks.map((t) => (
            <text key={t} x={px(t)} y={H - 11} textAnchor="middle">{t}°</text>
          ))}
        </g>

        {/* Unflagged background population first, so flagged points sit on top. */}
        {points.filter((p) => !p.hot).map((p) => (
          <circle key={p.norad} cx={p.cx} cy={p.cy} r={p.r} data-sev={p.sev}
                  fill="var(--sev)" opacity={p.sev === 'NOMINAL' ? 0.5 : 0.9} />
        ))}
        {points.filter((p) => p.hot).map((p) => (
          <circle key={p.norad} cx={p.cx} cy={p.cy} r={p.r} data-sev={p.sev} fill="var(--sev)">
            <title>{`${p.name} — ${Math.round((H - PAD.b - p.cy) / (H - PAD.t - PAD.b) * MAX_ALT)} km`}</title>
          </circle>
        ))}
      </svg>
    </div>
  );
}
