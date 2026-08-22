import * as satellite from 'satellite.js';
import { HBR, pcFoster, scaledSigma, sigmaFor } from './engine/pc';
import { applyAlongTrackDeltaV, propagateState, type Vec3 } from './engine/twobody';
import type { CatalogueEntry } from './engine/parse';
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

// ── Re-propagated burn ──────────────────────────────────────────────────────

/**
 * The same question, answered properly.
 *
 * `evaluateBurn` above applies the closed-form along-track result and has to
 * report a range, because Δs is a scalar: it knows how far the asset moves but
 * not in which direction relative to the miss vector.
 *
 * This does not have that problem. It applies the delta-v to the asset's actual
 * state vector, propagates the burned and unburned states with the same
 * integrator, and takes the difference as a genuine 3-D displacement. Added to
 * the SGP4 trajectory it gives a real post-burn miss vector — so there is one
 * answer, not a range, and the geometry caveat disappears.
 *
 * The burn also moves the time of closest approach, so the TCA is searched for
 * again rather than assumed unchanged.
 */

export interface PropagatedBurn {
  /** Post-burn miss distance, km. One number, not a range. */
  missKm: number;
  /** Post-burn time of closest approach, epoch ms. */
  tca: number;
  /** How far the burn moved the asset by TCA, km. */
  displacementKm: number;
  /** How far the burn moved the TCA itself, seconds. */
  tcaShiftSeconds: number;
  pc: number;
  sev: Severity;
  /** What the closed-form along-track estimate predicted, for comparison. */
  closedFormDisplacementKm: number;
}

const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const norm = (a: Vec3) => Math.hypot(a.x, a.y, a.z);

/**
 * Separation at time t with the burn applied to `primary`.
 *
 * The absolute positions stay SGP4's; only the burn-induced displacement comes
 * from the two-body arms, where the model error cancels between them.
 */
function separationAfterBurn(
  primary: satellite.SatRec,
  secondary: satellite.SatRec,
  burnMs: number,
  dvKmS: number,
  tMs: number,
): { sep: number; displacement: number } | null {
  const at = new Date(tMs);
  const pa = satellite.propagate(primary, at);
  const pb = satellite.propagate(secondary, at);
  if (!pa?.position || !pb?.position) return null;

  const burnState = satellite.propagate(primary, new Date(burnMs));
  if (!burnState?.position || !burnState.velocity) return null;

  const dt = (tMs - burnMs) / 1000;
  const base = propagateState(
    { r: burnState.position, v: burnState.velocity },
    dt,
  );
  const burned = propagateState(
    applyAlongTrackDeltaV({ r: burnState.position, v: burnState.velocity }, dvKmS),
    dt,
  );
  if (!base || !burned) return null;

  const delta = sub(burned.r, base.r);
  const missVec = sub(
    {
      x: pa.position.x + delta.x,
      y: pa.position.y + delta.y,
      z: pa.position.z + delta.z,
    },
    pb.position,
  );
  return { sep: norm(missVec), displacement: norm(delta) };
}

export function evaluateBurnPropagated(
  event: ResolvedConjunction,
  primary: CatalogueEntry,
  secondary: CatalogueEntry,
  { deltaVmmS, leadSeconds }: BurnProposal,
  sigmaScale = 1,
): PropagatedBurn | null {
  const dvKmS = deltaVmmS * 1e-6;
  const burnMs = event.tca - leadSeconds * 1000;
  if (leadSeconds <= 0) return null;

  const at = (tMs: number) =>
    separationAfterBurn(primary.rec, secondary.rec, burnMs, dvKmS, tMs);

  // The burn shifts the TCA, so scan a window around the original before
  // refining — assuming the TCA is unchanged is how a burn appears to help
  // more than it does.
  let bestT = event.tca;
  let best = at(event.tca);
  if (!best) return null;
  for (let dt = -240; dt <= 240; dt += 4) {
    const s = at(event.tca + dt * 1000);
    if (s && s.sep < best.sep) {
      best = s;
      bestT = event.tca + dt * 1000;
    }
  }
  // Golden-section refine on the sampled minimum.
  let lo = bestT - 4000;
  let hi = bestT + 4000;
  for (let k = 0; k < 40 && hi - lo > 1; k++) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;
    const s1 = at(m1);
    const s2 = at(m2);
    if (!s1 || !s2) break;
    if (s1.sep < s2.sep) hi = m2;
    else lo = m1;
  }
  const tca = (lo + hi) / 2;
  const final = at(tca) ?? best;

  const sigma = scaledSigma(sigmaFor(event.A, event.B), sigmaScale);
  const pc = pcFoster(final.sep, HBR[event.A.rcs] + HBR[event.B.rcs], sigma);

  return {
    missKm: final.sep,
    tca,
    displacementKm: final.displacement,
    tcaShiftSeconds: (tca - event.tca) / 1000,
    pc,
    sev: severityFor(pc),
    closedFormDisplacementKm: 3 * dvKmS * leadSeconds,
  };
}

/**
 * Smallest delta-v that drops the event below a target severity, mm/s —
 * against the re-propagated miss distance.
 *
 * Unlike the closed-form `minimumDeltaV`, this is not a lower bound with a
 * geometry caveat attached: the displacement is a real 3-D vector, so the
 * answer is the answer. Bisected rather than stepped, because each evaluation
 * costs a TCA search.
 *
 * Returns null when no burn within `maxMmS` achieves it — which is itself the
 * useful result, and the UI says so rather than showing a number that would not
 * work.
 */
export function minimumDeltaVPropagated(
  event: ResolvedConjunction,
  primary: CatalogueEntry,
  secondary: CatalogueEntry,
  leadSeconds: number,
  target: Severity,
  sigmaScale = 1,
  maxMmS = 200,
): number | null {
  if (leadSeconds <= 0) return null;
  const rank: Record<Severity, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
    NOMINAL: 0,
  };
  const clears = (dv: number) => {
    const out = evaluateBurnPropagated(
      event,
      primary,
      secondary,
      { deltaVmmS: dv, leadSeconds },
      sigmaScale,
    );
    return out ? rank[out.sev] <= rank[target] : false;
  };

  if (!clears(maxMmS)) return null;
  if (clears(0)) return 0;

  let lo = 0;
  let hi = maxMmS;
  // 12 halvings of a 200 mm/s range resolve to under 0.05 mm/s, far finer than
  // any thruster is commanded.
  for (let k = 0; k < 12; k++) {
    const mid = (lo + hi) / 2;
    if (clears(mid)) hi = mid;
    else lo = mid;
  }
  return hi;
}
