/**
 * Gabbard diagram — the canonical way a breakup cloud is shown.
 *
 * Each fragment contributes TWO points at the same x: its apogee altitude and
 * its perigee altitude, plotted against its orbital period. A collision
 * produces the characteristic X — apogees rising to the right, perigees
 * falling to the left — crossing at the parent's own orbit, because a fragment
 * ejected forward raises its apogee while keeping perigee near the burn point,
 * and one ejected backward does the reverse.
 *
 * Reading it: the vertical spread at any period is the eccentricity spread; the
 * horizontal spread is the energy imparted. Fragments whose perigee has been
 * pushed into the atmosphere sit on the floor of the plot and are the ones
 * already on their way down — they are drawn in the critical colour, which ties
 * this plot directly to the lifetime bands beside it.
 *
 * Period is derived, not stored: a = (perigee + apogee)/2 + R_E, and
 * T = 2*pi*sqrt(a^3/mu). Nothing here re-propagates anything.
 */
import { EARTH_RADIUS_KM } from '../data/orbital';
import type { FragmentOrbit } from '../data/consequence';

const MU = 398600.4418; // km³/s²

/** Orbital period in minutes from perigee and apogee ALTITUDES, km. */
export function periodMinutes(perigeeAltKm: number, apogeeAltKm: number): number {
  const a = (perigeeAltKm + apogeeAltKm) / 2 + EARTH_RADIUS_KM;
  return (2 * Math.PI * Math.sqrt((a * a * a) / MU)) / 60;
}

const W = 660;
const H = 340;
const PAD = { l: 46, r: 12, t: 12, b: 30 };

function ticks(lo: number, hi: number, count: number): number[] {
  const raw = (hi - lo) / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? mag * 10;
  const out: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) out.push(v);
  return out;
}

export function GabbardPlot({
  fragments,
  parentAltKm,
  maxPoints = 1200,
}: {
  fragments: FragmentOrbit[];
  parentAltKm: number;
  /** Cap on drawn fragments — an SVG with 4000 nodes janks on a projector. */
  maxPoints?: number;
}) {
  if (!fragments.length) return null;

  // Even stride rather than head-slice, so a sampled plot still spans the cloud.
  const stride = Math.max(1, Math.ceil(fragments.length / maxPoints));
  const shown = fragments.filter((_, i) => i % stride === 0);

  const pts = shown.map((f) => ({
    period: periodMinutes(f.perigee, f.apogee),
    apogee: f.apogee,
    // Perigees driven below the surface are physically re-entry trajectories;
    // clamp them to the floor rather than letting one fragment set the scale.
    perigee: Math.max(f.perigee, 0),
    immediate: f.immediate,
  }));

  const periods = pts.map((p) => p.period);
  const alts = pts.flatMap((p) => [p.apogee, p.perigee]);
  const xLo = Math.min(...periods, periodMinutes(parentAltKm, parentAltKm)) * 0.995;
  const xHi = Math.max(...periods, periodMinutes(parentAltKm, parentAltKm)) * 1.005;
  const yLo = 0;
  const yHi = Math.max(...alts, parentAltKm) * 1.05;

  const px = (v: number) => PAD.l + ((v - xLo) / (xHi - xLo || 1)) * (W - PAD.l - PAD.r);
  const py = (v: number) => H - PAD.b - ((v - yLo) / (yHi - yLo || 1)) * (H - PAD.t - PAD.b);

  const parentPeriod = periodMinutes(parentAltKm, parentAltKm);
  const immediate = pts.filter((p) => p.immediate).length;

  return (
    <figure className="m-0 flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={
          `Gabbard diagram of ${fragments.length} fragments. Periods span ` +
          `${Math.min(...periods).toFixed(0)} to ${Math.max(...periods).toFixed(0)} minutes, ` +
          `altitudes ${Math.min(...alts).toFixed(0)} to ${Math.max(...alts).toFixed(0)} kilometres. ` +
          `${immediate} fragments have perigee inside the atmosphere.`
        }
      >
        {/* horizontal gridlines + altitude axis */}
        {ticks(yLo, yHi, 5).map((t) => (
          <g key={`y${t}`}>
            <line
              x1={PAD.l} x2={W - PAD.r} y1={py(t)} y2={py(t)}
              style={{ stroke: 'var(--grid)' }} strokeWidth={1}
            />
            <text
              x={PAD.l - 6} y={py(t) + 3} textAnchor="end"
              className="num" style={{ fill: 'var(--t3)', fontSize: 9 }}
            >
              {t.toFixed(0)}
            </text>
          </g>
        ))}

        {/* period axis */}
        {ticks(xLo, xHi, 6).map((t) => (
          <text
            key={`x${t}`} x={px(t)} y={H - PAD.b + 14} textAnchor="middle"
            className="num" style={{ fill: 'var(--t3)', fontSize: 9 }}
          >
            {t.toFixed(0)}
          </text>
        ))}

        {/* the parent orbit — the crossing point of the X */}
        <line
          x1={px(parentPeriod)} x2={px(parentPeriod)} y1={PAD.t} y2={H - PAD.b}
          style={{ stroke: 'var(--accent)' }} strokeWidth={1} strokeDasharray="3 3" opacity={0.55}
        />
        <line
          x1={PAD.l} x2={W - PAD.r} y1={py(parentAltKm)} y2={py(parentAltKm)}
          style={{ stroke: 'var(--accent)' }} strokeWidth={1} strokeDasharray="3 3" opacity={0.55}
        />

        {/* apogees above, perigees below — drawn after the grid so they sit on top */}
        {pts.map((p, i) => (
          <circle
            key={`a${i}`} cx={px(p.period)} cy={py(p.apogee)} r={1.6}
            style={{ fill: 'var(--risk-medium)' }} opacity={0.75}
          />
        ))}
        {pts.map((p, i) => (
          <circle
            key={`p${i}`} cx={px(p.period)} cy={py(p.perigee)} r={1.6}
            style={{ fill: p.immediate ? 'var(--risk-critical)' : 'var(--risk-low)' }}
            opacity={p.immediate ? 0.9 : 0.75}
          />
        ))}

        {/* axis frame last, so points never overdraw it */}
        <line x1={PAD.l} x2={PAD.l} y1={PAD.t} y2={H - PAD.b} style={{ stroke: 'var(--hairline)' }} />
        <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} style={{ stroke: 'var(--hairline)' }} />
      </svg>

      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs text-tertiary">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--risk-medium)' }} />
          apogee
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--risk-low)' }} />
          perigee
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: 'var(--risk-critical)' }} />
          perigee inside the atmosphere ({immediate})
        </span>
        <span className="ml-auto">
          period (min) → · altitude (km) ↑
          {stride > 1 && ` · 1 in ${stride} shown`}
        </span>
      </figcaption>
    </figure>
  );
}
