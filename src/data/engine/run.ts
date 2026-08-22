import type { CatalogueEntry } from './parse';
import { HBR, pcFoster, sigmaFor } from './pc';
import { refine, separationCurve } from './refine';
import { screen, type ScreenCascade } from './screen';
import { riskScore, severityFor } from '../riskScore';
import type { Conjunction } from '../types';

/**
 * The screening run: coarse sweep, exact refinement, then risk.
 *
 * This is the whole pipeline in one place so that the build-time precompute and
 * the in-browser worker run identical code — a precomputed dashboard that
 * disagreed with a live re-run would be worse than having neither.
 */

/** Miss distance above which a refined pass is not reported as an event, km. */
export const EVENT_GATE_KM = 25;

/**
 * Default screening horizon, hours.
 *
 * Declared here rather than in each caller because it has to agree in three
 * places at once: the committed precompute, the console's default screening
 * window, and the horizon a live worker run uses. When they disagreed, running
 * `npm run screen` quietly rebuilt the dashboard at 24 h while the window
 * filter still said 72 h — two thirds of the events vanished and nothing in
 * the UI indicated why.
 */
export const DEFAULT_HORIZON_HOURS = 72;

/** Window of the separation curve on the detail chart, minutes either side. */
export const SEPARATION_SPAN_MIN = 40;
export const SEPARATION_POINTS = 121;

/** Screening threshold drawn on the detail chart, km. */
export const SCREENING_THRESHOLD_KM = 1.0;

export interface RunOptions {
  start: Date;
  hours: number;
  onProgress?: (fraction: number, stage: 'screen' | 'refine') => void;
  /**
   * Precompute the detail chart's separation curve for every event.
   *
   * Off for the committed build-time result: 121 propagated points per event
   * is 5 MB of JSON for a chart only ever seen one event at a time. The detail
   * view computes the curve on demand instead, which is 242 SGP4 calls and
   * imperceptible.
   */
  includeSeparation?: boolean;
}

export interface RunCascade extends ScreenCascade {
  /** Candidates that refined to a true local minimum inside the gate. */
  events: number;
  /** Candidates whose bracket held no closing-to-receding transition. */
  unbracketed: number;
  /** Refined passes rejected for missing by more than EVENT_GATE_KM. */
  beyondGate: number;
  gateKm: number;
  horizonHours: number;
  startUtc: string;
}

export interface RunResult {
  conjunctions: Conjunction[];
  cascade: RunCascade;
}

/** Stable id for a pair, so the same event keeps its id across re-runs. */
const eventId = (a: number, b: number) =>
  `CJ-${String(Math.min(a, b)).padStart(5, '0')}-${String(Math.max(a, b)).padStart(5, '0')}`;

export function runScreening(
  catalogue: CatalogueEntry[],
  { start, hours, onProgress, includeSeparation = true }: RunOptions,
): RunResult {
  const recs = catalogue.map((e) => e.rec);

  const { candidates, cascade } = screen(recs, {
    start,
    hours,
    onProgress: (f) => onProgress?.(f, 'screen'),
  });

  const conjunctions: Conjunction[] = [];
  let unbracketed = 0;
  let beyondGate = 0;

  for (let k = 0; k < candidates.length; k++) {
    const c = candidates[k];
    const A = catalogue[c.i].object;
    const B = catalogue[c.j].object;

    // The true minimum can lie up to a full step either side of the sample that
    // flagged it, so the bracket has to be at least that wide.
    const ev = refine(recs[c.i], recs[c.j], c.t, 90);
    if (!ev) {
      unbracketed++;
      continue;
    }
    if (ev.missKm > EVENT_GATE_KM) {
      beyondGate++;
      continue;
    }

    const maxAge = Math.max(A.age, B.age);
    const sigma = sigmaFor(A, B);
    const hbr = HBR[A.rcs] + HBR[B.rcs];
    const pc = pcFoster(ev.missKm, hbr, sigma);
    const miss = +ev.missKm.toFixed(3);
    const relv = +ev.relvKms.toFixed(3);

    conjunctions.push({
      id: eventId(A.norad, B.norad),
      a: A.norad,
      b: B.norad,
      tca: ev.tca,
      tcaMin: +((ev.tca - start.getTime()) / 60000).toFixed(2),
      miss,
      relv,
      pc,
      sev: severityFor(pc),
      score: riskScore({ pc, miss, relv, maxAge }),
      maxAge: +maxAge.toFixed(2),
      sigma: +sigma.toFixed(2),
      separation: includeSeparation
        ? separationCurve(
            recs[c.i],
            recs[c.j],
            ev.tca,
            SEPARATION_SPAN_MIN,
            SEPARATION_POINTS,
          )
        : [],
    });

    if ((k & 63) === 0) onProgress?.(k / candidates.length, 'refine');
  }
  onProgress?.(1, 'refine');

  conjunctions.sort((x, y) => x.tca - y.tca);

  return {
    conjunctions,
    cascade: {
      ...cascade,
      events: conjunctions.length,
      unbracketed,
      beyondGate,
      gateKm: EVENT_GATE_KM,
      horizonHours: hours,
      startUtc: start.toISOString(),
    },
  };
}
