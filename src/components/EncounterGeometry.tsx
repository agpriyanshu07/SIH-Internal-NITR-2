import type { ResolvedConjunction } from '../data/types';

/**
 * A sketch of the two orbit planes meeting at TCA.
 *
 * Not a projection of anything — the ellipse tilts are driven by each object's
 * inclination so the picture changes sensibly from event to event, but the
 * caption says plainly that it is not to scale.
 */
export function EncounterGeometry({ event }: { event: ResolvedConjunction }) {
  const cx = 200;
  const cy = 118;

  // Map inclination onto a plausible on-screen tilt for each orbit.
  const tiltA = (event.A.incl % 180) - 90;
  const tiltB = (event.B.incl % 180) - 90 + 82;

  return (
    <div className="p-[14px]">
      <svg viewBox="0 0 400 230" className="block h-auto w-full" role="img"
           aria-label="Sketch of the two orbit planes crossing at the time of closest approach.">
        {/* Earth */}
        <circle cx={cx} cy={cy} r={46} fill="none" stroke="var(--hairline)" strokeWidth={1} />
        <ellipse cx={cx} cy={cy} rx={46} ry={14} fill="none" stroke="var(--hairline-soft)" strokeWidth={1} />
        <ellipse cx={cx} cy={cy} rx={14} ry={46} fill="none" stroke="var(--hairline-soft)" strokeWidth={1} />

        {/* Orbit planes */}
        <ellipse cx={cx} cy={cy} rx={150} ry={52} fill="none" stroke="var(--accent)"
                 strokeWidth={1.3} transform={`rotate(${tiltA * 0.35 - 18} ${cx} ${cy})`} />
        <ellipse cx={cx} cy={cy} rx={146} ry={58} fill="none" stroke="var(--t3)"
                 strokeWidth={1.1} transform={`rotate(${tiltB * 0.35 + 40} ${cx} ${cy})`} />

        {/* Encounter */}
        <circle cx={303} cy={76} r={3.4} fill="var(--accent)" />
        <circle cx={296} cy={83} r={3} fill="var(--t2)" />
        <circle cx={299.5} cy={79.5} r={12} fill="none" stroke="var(--risk-high)"
                strokeWidth={1} strokeDasharray="3 3" />
        <line x1={299.5} y1={91.5} x2={299.5} y2={126} stroke="var(--hairline-soft)" strokeWidth={1} />
        <text x={299.5} y={140} textAnchor="middle"
              fontFamily="IBM Plex Mono, monospace" fontSize={10} fill="var(--t2)">
          TCA
        </text>

        <g fontFamily="IBM Plex Mono, monospace" fontSize={9} fill="var(--t3)">
          <text x={14} y={24}>ORBIT PLANES AT CLOSEST APPROACH</text>
          <text x={14} y={216}>PROJECTION — INERTIAL FRAME, NOT TO SCALE</text>
        </g>
      </svg>
    </div>
  );
}
