import {
  CATALOGUE,
  entryById,
  objectById,
  SNAPSHOT_EPOCH,
} from './engine/catalogue';
import { separationCurve } from './engine/refine';
import {
  EVENT_GATE_KM,
  SCREENING_THRESHOLD_KM,
  SEPARATION_POINTS,
  SEPARATION_SPAN_MIN,
  type RunCascade,
} from './engine/run';
import { HBR, pcFoster, scaledSigma, sigmaFor } from './engine/pc';
import { riskScore, severityFor, SEVERITY_RANK } from './riskScore';
import precomputed from './precomputed.json';
import type { Conjunction, ResolvedConjunction } from './types';

/**
 * The conjunction set.
 *
 * Every event here came out of an SGP4 screening run over the committed
 * CelesTrak snapshot: a coarse 60-second sweep of all pairs, then bisection on
 * range rate for the exact time of closest approach. Nothing is drawn from a
 * generator and nothing is scripted — the urgent events on the dashboard are
 * urgent because two real tracked objects really do pass that close.
 *
 * The set is computed at build time (`npm run screen`) so first paint is
 * instant. The dashboard's "Run screening" button re-runs the identical engine
 * live in a Web Worker; see engine/run.ts.
 */

export { SCREENING_THRESHOLD_KM, SEPARATION_SPAN_MIN, EVENT_GATE_KM };
export { pcFoster, sigmaFor, scaledSigma, HBR };
export { SEVERITY_RANK };

/**
 * The instant the console is screening from.
 *
 * Every element set in the snapshot was captured at this moment, so this — not
 * the wall clock — is the epoch the run is anchored to. Screening from "now"
 * instead would mean propagating these element sets far past their epoch, where
 * SGP4 is no longer telling the truth. The console clock advances in real time
 * from here, and the UI says so.
 */
export const SESSION_START = SNAPSHOT_EPOCH;

/** Measured pair-reduction cascade from the committed run. */
export const CASCADE: RunCascade = precomputed.cascade as RunCascade;

export const HORIZON_MINUTES = CASCADE.horizonHours * 60;

export const CONJUNCTIONS: Conjunction[] = (
  precomputed.conjunctions as Conjunction[]
).map((c) => ({ ...c, separation: c.separation ?? [] }));

const BY_ID = new Map(CONJUNCTIONS.map((c) => [c.id, c]));

/**
 * Separation either side of TCA, propagated on demand.
 *
 * Not precomputed: 121 points per event for a thousand events is megabytes of
 * JSON for a chart that is only ever shown one event at a time. Computing it
 * here is 242 SGP4 evaluations and takes about a millisecond.
 */
function withSeparation(c: Conjunction): Conjunction {
  if (c.separation.length > 0) return c;
  const A = entryById(c.a);
  const B = entryById(c.b);
  if (!A || !B) return c;
  return {
    ...c,
    separation: separationCurve(
      A.rec,
      B.rec,
      c.tca,
      SEPARATION_SPAN_MIN,
      SEPARATION_POINTS,
    ),
  };
}

export const resolve = (c: Conjunction): ResolvedConjunction => ({
  ...c,
  A: objectById(c.a),
  B: objectById(c.b),
});

/** The list view never needs a separation curve, so it does not pay for one. */
export const RESOLVED: ResolvedConjunction[] = CONJUNCTIONS.map(resolve);

export const conjunctionById = (id: string): ResolvedConjunction | undefined => {
  const c = BY_ID.get(id);
  return c ? resolve(withSeparation(c)) : undefined;
};

export const SEVERITY_COUNTS = RESOLVED.reduce(
  (acc, c) => ({ ...acc, [c.sev]: acc[c.sev] + 1 }),
  { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, NOMINAL: 0 },
);

/**
 * Re-derive an event under a different covariance assumption.
 *
 * Sigma is the one number in the Pc chain that is assumed rather than measured
 * (a TLE carries no covariance), so the Thresholds screen lets an operator
 * scale it and watch the severity banding move. Miss distance and relative
 * velocity are untouched — those were measured.
 */
export function reband(
  c: ResolvedConjunction,
  sigmaScale: number,
): ResolvedConjunction {
  if (sigmaScale === 1) return c;
  const sigma = scaledSigma(sigmaFor(c.A, c.B), sigmaScale);
  const pc = pcFoster(c.miss, HBR[c.A.rcs] + HBR[c.B.rcs], sigma);
  return {
    ...c,
    sigma: +sigma.toFixed(2),
    pc,
    sev: severityFor(pc),
    score: riskScore({ pc, miss: c.miss, relv: c.relv, maxAge: c.maxAge }),
  };
}

export { CATALOGUE };
