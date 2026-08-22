import * as satellite from 'satellite.js';

/**
 * Exact time of closest approach.
 *
 * The coarse screen only knows the smallest separation it happened to *sample*.
 * The true closest approach sits somewhere inside that sample's neighbouring
 * step, and at 15 km/s the difference between the two is the difference between
 * "500 m" and "we missed it".
 *
 * Range rate — the component of relative velocity along the line joining the
 * two objects — is negative while they close and positive once they recede, so
 * the true TCA is exactly its zero crossing. Bisecting on that sign change
 * converges on the instant itself, and the miss distance then falls out of a
 * single propagation rather than an approximation.
 */

export interface RefinedEvent {
  /** True time of closest approach, epoch ms. */
  tca: number;
  /** Miss distance at TCA, km. */
  missKm: number;
  /** Relative speed at TCA, km/s. */
  relvKms: number;
}

interface Rv {
  /** Range rate, km/s. */
  rate: number;
  /** Range, km. */
  range: number;
}

function rangeRate(
  a: satellite.SatRec,
  b: satellite.SatRec,
  t: Date,
): Rv | null {
  const pa = satellite.propagate(a, t);
  const pb = satellite.propagate(b, t);
  if (!pa?.position || !pa.velocity || !pb?.position || !pb.velocity) return null;

  const rx = pa.position.x - pb.position.x;
  const ry = pa.position.y - pb.position.y;
  const rz = pa.position.z - pb.position.z;
  const vx = pa.velocity.x - pb.velocity.x;
  const vy = pa.velocity.y - pb.velocity.y;
  const vz = pa.velocity.z - pb.velocity.z;

  const range = Math.sqrt(rx * rx + ry * ry + rz * rz);
  if (range === 0) return { rate: 0, range: 0 };
  return { rate: (rx * vx + ry * vy + rz * vz) / range, range };
}

/**
 * Bisect for the TCA bracketing `tGuess`.
 *
 * `windowS` should be at least the screen's step size: the true minimum can lie
 * up to one full step either side of the sample that flagged it. Returns null
 * when the window does not bracket a closing-to-receding transition, which
 * means the coarse sample was not near a minimum at all.
 */
export function refine(
  a: satellite.SatRec,
  b: satellite.SatRec,
  tGuess: number,
  windowS = 90,
): RefinedEvent | null {
  const at = (dt: number) => new Date(tGuess + dt * 1000);

  let lo = -windowS;
  let hi = windowS;
  const rLo = rangeRate(a, b, at(lo));
  const rHi = rangeRate(a, b, at(hi));
  if (!rLo || !rHi) return null;
  // Closing at the start, receding at the end — a minimum sits between them.
  if (!(rLo.rate < 0 && rHi.rate > 0)) return null;

  // 24 halvings of a 180 s bracket resolve the TCA to ~10 microseconds, which at
  // 15 km/s is 0.15 mm of separation — orders of magnitude below anything that
  // could change a miss distance, and 40% cheaper than bisecting to the last bit.
  for (let k = 0; k < 24; k++) {
    const mid = (lo + hi) / 2;
    const r = rangeRate(a, b, at(mid));
    if (!r) return null;
    if (r.rate < 0) lo = mid;
    else hi = mid;
  }

  const tcaMs = tGuess + ((lo + hi) / 2) * 1000;
  const tca = new Date(tcaMs);
  const pa = satellite.propagate(a, tca);
  const pb = satellite.propagate(b, tca);
  if (!pa?.position || !pa.velocity || !pb?.position || !pb.velocity) return null;

  return {
    tca: tcaMs,
    missKm: Math.hypot(
      pa.position.x - pb.position.x,
      pa.position.y - pb.position.y,
      pa.position.z - pb.position.z,
    ),
    relvKms: Math.hypot(
      pa.velocity.x - pb.velocity.x,
      pa.velocity.y - pb.velocity.y,
      pa.velocity.z - pb.velocity.z,
    ),
  };
}

/**
 * Separation either side of TCA, from real propagated states.
 *
 * Deliberately not the closed-form hyperbola sqrt(miss² + (v·t)²): that curve is
 * exactly symmetric and perfectly smooth because it assumes straight-line
 * relative motion. Propagating the real states instead shows the curvature of
 * both orbits, so the arms are not quite symmetric — which is itself the
 * evidence that the number came out of a propagator rather than a formula.
 */
export function separationCurve(
  a: satellite.SatRec,
  b: satellite.SatRec,
  tcaMs: number,
  spanMinutes: number,
  points: number,
): { t: number; sep: number }[] {
  const out: { t: number; sep: number }[] = [];
  for (let k = 0; k < points; k++) {
    const t = -spanMinutes + (k / (points - 1)) * spanMinutes * 2;
    const at = new Date(tcaMs + t * 60000);
    const pa = satellite.propagate(a, at);
    const pb = satellite.propagate(b, at);
    if (!pa?.position || !pb?.position) continue;
    out.push({
      t,
      sep: Math.hypot(
        pa.position.x - pb.position.x,
        pa.position.y - pb.position.y,
        pa.position.z - pb.position.z,
      ),
    });
  }
  return out;
}
