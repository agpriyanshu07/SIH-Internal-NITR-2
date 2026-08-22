import { CATALOGUE, SNAPSHOT_EPOCH } from '../data/engine/catalogue';
import { runScreening, type RunCascade } from '../data/engine/run';
import type { Conjunction } from '../data/types';

/**
 * The screening engine, off the main thread.
 *
 * A 24-hour screen of the whole snapshot is 1.2 million SGP4 evaluations. On
 * the main thread that is a frozen tab for ten seconds with no way to show
 * progress; in a worker it is a progress bar. This runs the identical
 * `runScreening` the build-time precompute runs — the button does not simulate
 * a screening run, it performs one.
 */

export interface ScreenRequest {
  hours: number;
}

export type ScreenResponse =
  | { kind: 'progress'; stage: 'screen' | 'refine'; fraction: number }
  | { kind: 'done'; conjunctions: Conjunction[]; cascade: RunCascade }
  | { kind: 'error'; message: string };

self.onmessage = (e: MessageEvent<ScreenRequest>) => {
  const post = (m: ScreenResponse) => self.postMessage(m);
  try {
    const { conjunctions, cascade } = runScreening(CATALOGUE, {
      start: new Date(SNAPSHOT_EPOCH),
      hours: e.data.hours,
      // The detail view propagates its own curve on demand; sending a thousand
      // 121-point curves back across the worker boundary would cost more than
      // the screen itself.
      includeSeparation: false,
      onProgress: (fraction, stage) => post({ kind: 'progress', stage, fraction }),
    });
    post({ kind: 'done', conjunctions, cascade });
  } catch (err) {
    post({ kind: 'error', message: err instanceof Error ? err.message : String(err) });
  }
};
