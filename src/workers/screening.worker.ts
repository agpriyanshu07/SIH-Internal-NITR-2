import { CATALOGUE, SNAPSHOT_EPOCH } from '../data/engine/catalogue';
import { runScreening, type RunCascade, type RunProgress } from '../data/engine/run';
import type { Conjunction } from '../data/types';

/**
 * The screening engine, off the main thread.
 *
 * A 24-hour screen of the whole snapshot is 1.2 million SGP4 evaluations. On
 * the main thread that is a frozen tab for ten seconds with no way to show
 * progress; in a worker it is a progress bar. This runs the identical
 * `runScreening` the build-time precompute runs — the button does not simulate
 * a screening run, it performs one.
 *
 * The boot sequence in `RunConsole` (see `components/BootSequence.tsx`) turns
 * these messages into the phase list a viewer watches while a run is live.
 * Every count below is read off the run actually in progress — nothing here
 * is a fake timer or an interpolated bar. The five phases the enhancement
 * plan names ("parse -> propagate -> coarse filter -> refine -> risk score")
 * map onto four wire messages because that is the true shape of the pipeline:
 * propagation and the coarse distance gate happen inside the same sweep loop
 * (`sweep`, one SGP4 call per object per step, immediately distance-checked
 * against every surviving pair), and risk scoring happens inline per
 * candidate inside refinement rather than as a separate pass (`refine`). See
 * `RunProgress` in `engine/run.ts` for the phase union this forwards.
 */

export interface ScreenRequest {
  hours: number;
}

/**
 * `parse` is synthesized here (see below) rather than reported by the engine,
 * since parsing already finished at module import time — it is not a phase
 * `runScreening` itself performs or knows about.
 */
export type WorkerProgress = { phase: 'parse'; fraction: number; objects: number } | RunProgress;

export type ScreenResponse =
  | ({ kind: 'progress' } & WorkerProgress)
  | { kind: 'done'; conjunctions: Conjunction[]; cascade: RunCascade }
  | { kind: 'error'; message: string };

self.onmessage = (e: MessageEvent<ScreenRequest>) => {
  const post = (m: ScreenResponse) => self.postMessage(m);
  try {
    // Parsing already happened at module import — CATALOGUE is a parsed
    // array by the time this handler runs, not a promise of one. This
    // message reports that real, already-known count rather than pretending
    // to watch parsing happen.
    post({ kind: 'progress', phase: 'parse', fraction: 1, objects: CATALOGUE.length });

    const { conjunctions, cascade } = runScreening(CATALOGUE, {
      start: new Date(SNAPSHOT_EPOCH),
      hours: e.data.hours,
      // The detail view propagates its own curve on demand; sending a thousand
      // 121-point curves back across the worker boundary would cost more than
      // the screen itself.
      includeSeparation: false,
      onProgress: (info) => post({ kind: 'progress', ...info }),
    });
    post({ kind: 'done', conjunctions, cascade });
  } catch (err) {
    post({ kind: 'error', message: err instanceof Error ? err.message : String(err) });
  }
};
