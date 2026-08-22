import { useCallback, useEffect, useRef, useState } from 'react';
import { CASCADE, RESOLVED, resolve } from '../data/conjunctions';
import type { RunCascade } from '../data/engine/run';
import type { ResolvedConjunction } from '../data/types';
import ScreeningWorker from '../workers/screening.worker?worker&inline';
import type { ScreenRequest, ScreenResponse } from '../workers/screening.worker';

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
  stage: 'screen' | 'refine' | null;
  /** True once a live run has replaced the committed result. */
  live: boolean;
  error: string | null;
}

export function useScreening() {
  const [state, setState] = useState<ScreeningState>({
    events: RESOLVED,
    cascade: CASCADE,
    progress: null,
    stage: null,
    live: false,
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
        stage: null,
        error:
          'A live re-run needs a Web Worker, which the browser blocks for a page ' +
          'opened directly from disk (file://). The events on screen are still a ' +
          'real screening run — they were computed at build time by the same ' +
          'engine. Serve this file over http to re-run it live.',
      }));
      return;
    }
    workerRef.current = worker;
    setState((s) => ({ ...s, progress: 0, stage: 'screen', error: null }));

    worker.onmessage = (e: MessageEvent<ScreenResponse>) => {
      const msg = e.data;
      if (msg.kind === 'progress') {
        setState((s) => ({ ...s, progress: msg.fraction, stage: msg.stage }));
        return;
      }
      worker.terminate();
      workerRef.current = null;
      if (msg.kind === 'error') {
        setState((s) => ({ ...s, progress: null, stage: null, error: msg.message }));
        return;
      }
      setState({
        events: msg.conjunctions.map(resolve),
        cascade: msg.cascade,
        progress: null,
        stage: null,
        live: true,
        error: null,
      });
    };

    worker.onerror = (e) => {
      worker.terminate();
      workerRef.current = null;
      setState((s) => ({ ...s, progress: null, stage: null, error: e.message }));
    };

    worker.postMessage({ hours } satisfies ScreenRequest);
  }, []);

  return { ...state, run, running: state.progress !== null };
}
