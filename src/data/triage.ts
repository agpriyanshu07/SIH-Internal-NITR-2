import { HBR, pcFoster } from './engine/pc';
import { severityFor, scoreTerms, SCORE_MODEL, SEVERITY_RANK } from './riskScore';
import type { ResolvedConjunction, Severity } from './types';

/**
 * What would have to be true for this event to stop mattering.
 *
 * The pitch is triage. The dashboard is a sorted table. A sorted table is a
 * ranking, and a ranking is not yet a decision — an operator looking at the top
 * row still has to work out, in their head, whether it is there because the
 * geometry is genuinely bad or because we do not know where a fragment is.
 * ISRO's own numbers are the reason this matters: 53,000 close-approach alerts
 * in 2024 against 10 manoeuvres flown. The scarce thing is not detection.
 *
 * So this module answers the counterfactual directly. For one event: how far it
 * sits from the next band down, expressed in each of the quantities that put it
 * where it is, and which of them is doing the most work.
 *
 * Everything here is derived from the same Foster model the ranking uses. No
 * new physics, no new assumption — it is the existing model read backwards.
 */

/** Severity bands in descending order, so "the next band down" is well defined. */
const DESCENDING: Severity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NOMINAL'];

export interface TriageMargin {
  /** Null when already at the bottom band — there is nothing to drop to. */
  nextBand: Severity | null;

  /**
   * Miss distance at which this event leaves its band, holding sigma fixed, km.
   * Closed form: Pc falls monotonically in miss, so this inverts exactly.
   */
  missToDropKm: number | null;
  /** How much further apart they would have to pass, km. */
  missHeadroomKm: number | null;

  /**
   * Multiplier on the assumed sigma at which the band changes, or null if it
   * does not change anywhere in the searched range.
   *
   * This is the number that says how much of the verdict is measurement and how
   * much is assumption. A band that survives sigma being halved and doubled is
   * a geometric fact; one that flips at 1.1x is an artefact of a covariance
   * nobody measured.
   */
  sigmaScaleToDrop: number | null;

  /** Which score term contributes most, and its share of the within-band score. */
  dominantTerm: { key: string; label: string; share: number };

  /**
   * True when the band is unchanged across the whole 0.25x-4x sigma sweep. The
   * strongest statement this console can make about a single event.
   */
  robustToSigma: boolean;
}

/**
 * Pc as a function of sigma for this event, with everything else held fixed.
 *
 * Note it is NOT monotonic: Foster's Pc rises as sigma shrinks toward the miss
 * distance, peaks near sigma = miss/sqrt(2), then collapses as sigma shrinks
 * further and the Gaussian pulls away from the hard body entirely. That is why
 * the sigma search below is a sweep rather than a bisection — bisecting a
 * non-monotonic function finds one root and silently ignores the other.
 */
function pcAtSigma(event: ResolvedConjunction, sigmaKm: number): number {
  const hbr = HBR[event.A.rcs] + HBR[event.B.rcs];
  return pcFoster(event.miss, hbr, sigmaKm);
}

const SIGMA_SWEEP_MIN = 0.25;
const SIGMA_SWEEP_MAX = 4;
const SIGMA_STEPS = 240;

export function triageMargin(event: ResolvedConjunction): TriageMargin {
  const idx = DESCENDING.indexOf(event.sev);
  const nextBand = idx >= 0 && idx < DESCENDING.length - 1 ? DESCENDING[idx + 1] : null;

  // ── Miss distance ────────────────────────────────────────────────────────
  //
  // Pc = (hbr^2 / 2s^2) * exp(-d^2 / 2s^2). Solving Pc(d) = target for d:
  //
  //     d = s * sqrt(2 * ln( hbr^2 / (2 s^2 * target) ))
  //
  // The logarithm's argument is Pc at zero miss divided by the target, so it is
  // below 1 exactly when even a head-on geometry could not reach the target —
  // in which case there is no such distance and this reports null rather than
  // NaN.
  let missToDropKm: number | null = null;
  if (nextBand) {
    const hbr = HBR[event.A.rcs] + HBR[event.B.rcs];
    const s = event.sigma;
    // The Pc at which this event would fall into the next band down: the
    // smallest Pc still inside the current band.
    const target = bandFloorPc(event.sev);
    if (target !== null) {
      const ratio = (hbr * hbr) / (2 * s * s * target);
      if (ratio > 1) missToDropKm = s * Math.sqrt(2 * Math.log(ratio));
    }
  }
  const missHeadroomKm =
    missToDropKm === null ? null : Math.max(0, missToDropKm - event.miss);

  // ── Sigma ────────────────────────────────────────────────────────────────
  //
  // Swept rather than solved, for the non-monotonicity noted above. The value
  // reported is the multiplier CLOSEST TO 1 at which the band changes, because
  // that is the one an operator cares about: the smallest revision to our
  // assumption that would change the answer.
  let sigmaScaleToDrop: number | null = null;
  let bandChangesAnywhere = false;
  let bestDistanceFromOne = Infinity;
  for (let i = 0; i <= SIGMA_STEPS; i++) {
    const scale =
      SIGMA_SWEEP_MIN + (i / SIGMA_STEPS) * (SIGMA_SWEEP_MAX - SIGMA_SWEEP_MIN);
    const sev = severityFor(pcAtSigma(event, event.sigma * scale));
    if (sev === event.sev) continue;
    bandChangesAnywhere = true;
    // Only a change to a LOWER band answers "what would make this stop
    // mattering"; a scale that makes it worse is a different question.
    if (SEVERITY_RANK[sev] >= SEVERITY_RANK[event.sev]) continue;
    const d = Math.abs(scale - 1);
    if (d < bestDistanceFromOne) {
      bestDistanceFromOne = d;
      sigmaScaleToDrop = scale;
    }
  }

  // ── Which term is carrying the score ─────────────────────────────────────
  const terms = scoreTerms({
    pc: event.pc,
    miss: event.miss,
    relv: event.relv,
    maxAge: event.maxAge,
  });
  const contributions = SCORE_MODEL.weights.map((w) => ({
    key: w.key,
    label: w.label,
    value: w.weight * (terms as unknown as Record<string, number>)[w.key],
  }));
  const total = contributions.reduce((s, c) => s + c.value, 0);
  const top = contributions.reduce((a, b) => (b.value > a.value ? b : a));

  return {
    nextBand,
    missToDropKm,
    missHeadroomKm,
    sigmaScaleToDrop,
    dominantTerm: {
      key: top.key,
      label: top.label,
      // Share of the within-band score, not of 100 — the band itself is most of
      // the number, and calling a term "62% of the score" when the band floor
      // already fixed 60 points of it would be misleading.
      share: total > 0 ? top.value / total : 0,
    },
    robustToSigma: !bandChangesAnywhere,
  };
}

/**
 * The lowest Pc still inside a band.
 *
 * Read from `severityFor` by bisection rather than by importing the band table,
 * so that changing the thresholds cannot leave this module quoting the old ones.
 * Null for the bottom band, which has no floor to fall through.
 */
function bandFloorPc(sev: Severity): number | null {
  if (sev === 'NOMINAL') return null;
  let lo = 1e-30;
  let hi = 1;
  // 200 iterations of bisection on a quantity spanning 30 decades is far more
  // than needed; it costs nothing and removes any question of convergence.
  for (let i = 0; i < 200; i++) {
    const mid = Math.sqrt(lo * hi); // geometric midpoint: the bands are decades
    if (SEVERITY_RANK[severityFor(mid)] >= SEVERITY_RANK[sev]) hi = mid;
    else lo = mid;
  }
  return hi;
}
