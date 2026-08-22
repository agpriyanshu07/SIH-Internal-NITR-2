import type { Severity } from './types';

/**
 * Severity banding.
 *
 * These thresholds are stated verbatim on the design's component-library
 * artboard ("CRITICAL — Pc ≥ 1e-3", and so on), so severity is derived from
 * probability of collision rather than from the composite score below. Keeping
 * them apart matters: Pc is the quantity an operator can compare against
 * published action thresholds, while the score is only a ranking aid.
 */
export function severityFor(pc: number): Severity {
  if (pc >= 1e-3) return 'CRITICAL';
  if (pc >= 1e-4) return 'HIGH';
  if (pc >= 1e-5) return 'MEDIUM';
  if (pc >= 1e-7) return 'LOW';
  return 'NOMINAL';
}

export interface RiskInputs {
  /** Probability of collision, e.g. 4.7e-4. */
  pc: number;
  /** Miss distance, km. */
  miss: number;
  /** Relative velocity, km/s. */
  relv: number;
  /** Age of the older element set in the pair, days. */
  maxAge: number;
}

/**
 * Composite 0–100 risk score used to rank the conjunction table.
 *
 * Pc is what an operator compares against published action thresholds, and
 * severity is banded from Pc alone (above). The score is a *triage* aid: given
 * two events in the same band, which one should a human look at first?
 *
 * The obvious implementation — a weighted blend of Pc with the other inputs —
 * does not work, and it is worth saying why rather than shipping it. Severity
 * bands are decades of Pc, so two events either side of a boundary differ
 * infinitesimally in the Pc term. Any non-zero weight on anything else lets the
 * lower-severity one outrank the higher, and the table's default sort starts
 * contradicting the severity chip printed next to it. Measured on the real
 * event set, a 90/7/3 blend produced six such inversions and left the LOW and
 * MEDIUM score ranges overlapping.
 *
 * So the score is banded by construction: severity picks the interval, and the
 * other factors only order events inside it. Sorting by score can therefore
 * never disagree with the chips, and the column still says something the Pc
 * column does not.
 *
 * Within a band:
 *
 *   `pc`     — position across the band's own decade(s), and still the
 *              dominant term.
 *
 *   `relv`   — how much energy a hit releases and how little warning there is.
 *              A 1 km miss at 14 km/s is categorically worse than the same miss
 *              at 7 km/s: a bigger debris field, and less time to act.
 *
 *   `maxAge` — a CONFIDENCE penalty, not a hazard, and the judgement call worth
 *              stating outright: a stale pair ranks HIGHER, not lower. The
 *              argument for lower is "don't cry wolf on bad data". We take the
 *              other side — a 6-day-old element set means the 2 km miss we just
 *              computed could really be 200 m, and soft numbers are a reason to
 *              look sooner, not later. Because it can only move an event inside
 *              its band, it never promotes a badly-measured harmless pass over
 *              a well-measured dangerous one.
 *
 * `miss` is deliberately unused: Pc already folds in both the miss distance and
 * the sigma it has to be judged against, so using it again would double-count
 * the one and ignore the other.
 */

/** Score interval per severity band. Contiguous, so the sort is total. */
const BAND_SCORE: Record<Severity, [number, number]> = {
  NOMINAL: [2, 24],
  LOW: [25, 49],
  MEDIUM: [50, 69],
  HIGH: [70, 89],
  CRITICAL: [90, 99],
};

/** Pc interval per severity band, matching severityFor() exactly. */
const BAND_PC: Record<Severity, [number, number]> = {
  NOMINAL: [1e-12, 1e-7],
  LOW: [1e-7, 1e-5],
  MEDIUM: [1e-5, 1e-4],
  HIGH: [1e-4, 1e-3],
  CRITICAL: [1e-3, 1e-1],
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Weights within a band. Pc leads; the other two break ties meaningfully. */
const W_PC = 0.7;
const W_RELV = 0.2;
const W_AGE = 0.1;

export function riskScore({ pc, relv, maxAge }: RiskInputs): number {
  const sev = severityFor(pc);
  const [scoreLo, scoreHi] = BAND_SCORE[sev];
  const [pcLo, pcHi] = BAND_PC[sev];

  // Where this Pc sits across its own band, on a log scale like the bands.
  const pcTerm = clamp01(
    (Math.log10(Math.max(pc, pcLo)) - Math.log10(pcLo)) /
      (Math.log10(pcHi) - Math.log10(pcLo)),
  );

  // Closing speed across the range LEO geometry actually produces.
  const relvTerm = clamp01((relv - 1.5) / (15 - 1.5));

  // Element-set age, saturating at a week — past that it is all equally bad.
  const ageTerm = clamp01(maxAge / 7);

  const within = W_PC * pcTerm + W_RELV * relvTerm + W_AGE * ageTerm;
  return Math.round(scoreLo + within * (scoreHi - scoreLo));
}

/** Rank order for severity, so filters can express "this band or worse". */
export const SEVERITY_RANK: Record<Severity, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
  NOMINAL: 0,
};
