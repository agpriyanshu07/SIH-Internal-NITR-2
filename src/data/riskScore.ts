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
 * The current implementation is a straight map of log10(Pc) onto 0–100, which
 * is what the design's reference logic does. It means the Score column is a
 * monotone restatement of the Pc column — informative, but it adds nothing the
 * operator could not already read off Pc.
 *
 * TODO(you): blend in the other three inputs. Things worth weighing:
 *   - `relv` decides how much energy a hit releases, and how little warning
 *     there is; 14 km/s is a categorically worse 1 km miss than 7 km/s.
 *   - `maxAge` is a confidence penalty, not a hazard: a 6-day-old element set
 *     means the miss distance itself is soft. Should a stale pair score higher
 *     (screen it, we don't know enough) or lower (don't cry wolf on bad data)?
 *   - `miss` correlates with Pc but is not redundant — Pc also folds in sigma.
 *
 * Keep the return clamped to 0–100 and keep it monotone in Pc, or the table's
 * default sort stops agreeing with the severity chips.
 */
export function riskScore({ pc }: RiskInputs): number {
  const normalised = (Math.log10(pc) + 9) / 6.5;
  return Math.round(Math.max(0.02, Math.min(0.99, normalised)) * 100);
}

/** Rank order for severity, so filters can express "this band or worse". */
export const SEVERITY_RANK: Record<Severity, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
  NOMINAL: 0,
};
