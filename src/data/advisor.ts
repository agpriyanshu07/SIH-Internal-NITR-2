import { HBR, pcFoster, scaledSigma, sigmaFor } from './engine/pc';
import { severityFor } from './riskScore';
import type { ResolvedConjunction, Severity } from './types';

/**
 * Manoeuvre advisor.
 *
 * Answers one question: if this asset burns Δv now, how much further away does
 * the conjunction pass? It is a planning aid against a REAL screened event —
 * the miss distance it improves on was propagated by SGP4, not assumed.
 *
 * The physics is the standard first-order result for an along-track burn. A Δv
 * along the velocity vector raises or lowers the semi-major axis, which changes
 * the orbital period, and the along-track displacement that accumulates from a
 * period change grows as:
 *
 *     Δs ≈ 3 · Δv · t
 *
 * with Δv in km/s and t the seconds of lead time before TCA. Three things
 * follow from that formula that an operator should read off this panel:
 *
 *   - Lead time is worth far more than propellant. Doubling Δv doubles Δs;
 *     doubling the warning time also doubles it, and warning time is free.
 *   - The displacement is *along-track*, and along-track is not necessarily
 *     across the miss vector. If the displacement happens to lie along the
 *     relative velocity, it moves the time of closest approach and buys almost
 *     no distance at all. So the result below is reported as a range between
 *     those two geometries rather than as a single flattering number.
 *   - It is secular. It does not converge for tiny lead times, and it is not a
 *     substitute for re-screening.
 *
 * WHAT THIS DOES NOT DO: it does not re-propagate. There is no post-burn state
 * vector, no re-run of the screen against a modified orbit, and therefore no
 * check that the burn does not simply create a different conjunction with a
 * third object — which is a real operational failure mode. The UI says so.
 */

export interface BurnProposal {
  /** Along-track delta-v, mm/s. Collision-avoidance burns are small. */
  deltaVmmS: number;
  /** Lead time before TCA, seconds. */
  leadSeconds: number;
}

export interface BurnOutcome {
  /** Along-track displacement the burn accumulates by TCA, km. */
  displacementKm: number;
  /** Miss distance if the displacement lies fully across the miss vector, km. */
  bestMissKm: number;
  /**
   * Miss distance if the displacement lies along the relative velocity, km.
   * Equal to the original miss: the pass happens at a different moment, not at
   * a greater distance.
   */
  worstMissKm: number;
  /** Pc at the best-case geometry. */
  bestPc: number;
  bestSev: Severity;
  /** Pc unchanged, for the worst-case geometry. */
  worstPc: number;
  worstSev: Severity;
  /** True when even the best case leaves the event in its original band. */
  bandUnchanged: boolean;
}

/** Seconds of lead time available for an event, from the console clock. */
export const leadTimeSeconds = (event: ResolvedConjunction, nowMs: number) =>
  Math.max(0, (event.tca - nowMs) / 1000);

export function evaluateBurn(
  event: ResolvedConjunction,
  { deltaVmmS, leadSeconds }: BurnProposal,
  sigmaScale = 1,
): BurnOutcome {
  // mm/s -> km/s
  const deltaVkmS = deltaVmmS * 1e-6;
  const displacementKm = 3 * deltaVkmS * leadSeconds;

  const sigma = scaledSigma(sigmaFor(event.A, event.B), sigmaScale);
  const hbr = HBR[event.A.rcs] + HBR[event.B.rcs];

  // Best case: the displacement is perpendicular to the relative velocity, so
  // it adds in quadrature to the existing miss vector.
  const bestMissKm = Math.hypot(event.miss, displacementKm);
  const worstMissKm = event.miss;

  const bestPc = pcFoster(bestMissKm, hbr, sigma);
  const worstPc = pcFoster(worstMissKm, hbr, sigma);
  const bestSev = severityFor(bestPc);
  const worstSev = severityFor(worstPc);

  return {
    displacementKm,
    bestMissKm,
    worstMissKm,
    bestPc,
    bestSev,
    worstPc,
    worstSev,
    bandUnchanged: bestSev === worstSev,
  };
}

/**
 * Smallest delta-v that drops the event below a target severity, mm/s.
 *
 * Best-case geometry, so it is a lower bound on what a burn would actually
 * need — presented as "at least this much", never as "this much is enough".
 * Returns null when no burn inside the search range achieves it.
 */
export function minimumDeltaV(
  event: ResolvedConjunction,
  leadSeconds: number,
  target: Severity,
  sigmaScale = 1,
  maxMmS = 200,
): number | null {
  const rank: Record<Severity, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
    NOMINAL: 0,
  };
  if (leadSeconds <= 0) return null;
  for (let v = 0.5; v <= maxMmS; v += 0.5) {
    const out = evaluateBurn(event, { deltaVmmS: v, leadSeconds }, sigmaScale);
    if (rank[out.bestSev] <= rank[target]) return v;
  }
  return null;
}
