import { useCallback, useEffect, useRef, useState } from 'react';
import { CASCADE, RESOLVED, resolve } from '../data/conjunctions';
import type { RunCascade } from '../data/engine/run';
import type { ResolvedConjunction } from '../data/types';
import ScreeningWorker from '../workers/screening.worker?worker&inline';
import type { ScreenRequest, ScreenResponse, WorkerProgress } from '../workers/screening.worker';

/**
 * The four wire phases, in the order they actually fire — the boot sequence
 * (`components/BootSequence.tsx`) walks this list rather than inventing its
 * own. See `screening.worker.ts` for why there are four, not five: propagation
 * and the coarse distance gate share a loop (`sweep`), and risk scoring is
 * computed inline inside refinement rather than as its own pass.
 */
export const RUN_PHASES = ['parse', 'radial', 'sweep', 'refine'] as const;
export type RunPhase = (typeof RUN_PHASES)[number];

/** The latest message seen for each phase, so the UI can show every phase's
 *  real last-known counts at once rather than only the current one. */
export type PhaseLog = Partial<Record<RunPhase, WorkerProgress>>;

/**
 * The current screening run.
 *
 * Starts as the committed build-time result so the dashboard paints instantly,
 * and is replaced wholesale by a live worker run when the operator asks for
 * one. Both come out of the same engine, so a live re-run over the same horizon
 * reproduces the committed numbers exactly — which is the point of having both.
 */

export interface ScreeningState {
  events: ResolvedConjunction[];
  cascade: RunCascade;
  /** null when idle; 0–1 while a live run is in flight. */
  progress: number | null;
  /** Current phase, or null when idle. */
  phase: RunPhase | null;
  /** Every phase's latest known message, for the boot sequence display. */
  phaseLog: PhaseLog;
  /** True once a live run has replaced the committed result. */
  live: boolean;
  /**
   * What the last live run produced, for the completion notice.
   *
   * A run that finishes and changes nothing on screen looks exactly like a
   * button that does nothing — which is what it looked like. The interesting
   * fact is precisely that nothing changed: the live worker and the committed
   * precompute are the same engine over the same horizon, so reproducing the
   * number to the event is the claim, not a coincidence.
   */
  lastRun: { events: number; elapsedMs: number; matchedCommitted: boolean } | null;
  error: string | null;
}

export function useScreening() {
  const [state, setState] = useState<ScreeningState>({
    events: RESOLVED,
    cascade: CASCADE,
    progress: null,
    phase: null,
    phaseLog: {},
    live: false,
    lastRun: null,
    error: null,
  });

  const workerRef = useRef<Worker | null>(null);

  useEffect(
    () => () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    },
    [],
  );

  const run = useCallback((hours: number) => {
    // Ignore a second click while a run is in flight rather than racing two.
    if (workerRef.current) return;

    /*
     * Inlined rather than emitted as a separate chunk, so the whole console can
     * be built as one self-contained file that runs from `file://` with no
     * server and no network. Costs a copy of the engine in the bundle; buys a
     * demo that cannot fail to load.
     */
    let worker: Worker;
    try {
      worker = new ScreeningWorker();
    } catch {
      /*
       * Opening the single-file build straight off the disk puts the page on a
       * null origin, where Chrome refuses to start a worker from a blob URL.
       * Everything else still works — the dashboard is showing a real screening
       * run either way — so say precisely what is unavailable and why rather
       * than leaving a button that does nothing.
       */
      setState((s) => ({
        ...s,
        progress: null,
        phase: null,
        error:
          'A live re-run needs a Web Worker, which the browser blocks for a page ' +
          'opened directly from disk (file://). The events on screen are still a ' +
          'real screening run — they were computed at build time by the same ' +
          'engine. Serve this file over http to re-run it live.',
      }));
      return;
    }
    workerRef.current = worker;
    setState((s) => ({
      ...s,
      progress: 0,
      phase: 'parse',
      phaseLog: {},
      error: null,
      lastRun: null,
    }));

    worker.onmessage = (e: MessageEvent<ScreenResponse>) => {
      const msg = e.data;
      if (msg.kind === 'progress') {
        setState((s) => ({
          ...s,
          progress: msg.fraction,
          phase: msg.phase,
          phaseLog: { ...s.phaseLog, [msg.phase]: msg },
        }));
        return;
      }
      worker.terminate();
      workerRef.current = null;
      if (msg.kind === 'error') {
        setState((s) => ({ ...s, progress: null, phase: null, error: msg.message }));
        return;
      }
      setState((s) => ({
        events: msg.conjunctions.map(resolve),
        cascade: msg.cascade,
        progress: null,
        phase: null,
        phaseLog: s.phaseLog,
        live: true,
        lastRun: {
          events: msg.conjunctions.length,
          elapsedMs: msg.cascade.elapsedMs,
          // Same horizon, same engine — so the event count has to match, and
          // saying whether it did is more useful than assuming it will.
          matchedCommitted:
            msg.cascade.horizonHours === CASCADE.horizonHours &&
            msg.conjunctions.length === CASCADE.events,
        },
        error: null,
      }));
    };

    worker.onerror = (e) => {
      worker.terminate();
      workerRef.current = null;
      setState((s) => ({ ...s, progress: null, phase: null, error: e.message }));
    };

    worker.postMessage({ hours } satisfies ScreenRequest);
  }, []);

  const dismissLastRun = useCallback(
    () => setState((s) => ({ ...s, lastRun: null })),
    [],
  );

  return { ...state, run, dismissLastRun, running: state.progress !== null };
}
