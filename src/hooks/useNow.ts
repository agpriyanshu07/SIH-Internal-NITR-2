import { useCallback, useSyncExternalStore } from 'react';
/*
 * The epoch from the manifest directly, not via engine/catalogue.
 *
 * engine/catalogue parses every TLE in the snapshot at import time and pulls
 * satellite.js with it. The clock needs one timestamp. Reaching it through the
 * engine meant any component wanting a countdown dragged the whole parser in —
 * which is exactly the cost the landing page was just freed from, so the
 * landing countdown would have quietly undone it.
 */
import manifest from '../data/snapshot/manifest.json';

const SNAPSHOT_EPOCH = Date.parse(manifest.capturedAtUtc);

/**
 * The console clock.
 *
 * Not the wall clock. Every element set in the committed snapshot was captured
 * at one instant, and SGP4 only tells the truth near that instant — propagating
 * these elements from today would be arithmetic, not prediction. So the console
 * runs on a clock anchored to the snapshot epoch and advancing in real time
 * from it: countdowns to TCA tick live and are correct relative to the run,
 * while the absolute timestamps stay honest about when the data is from.
 *
 * The provenance footer states the epoch, so nothing here is hidden.
 */
const PAGE_LOAD = Date.now();

/** How far the console clock is displaced from the wall clock, ms. */
export const EPOCH_OFFSET = SNAPSHOT_EPOCH - PAGE_LOAD;

/*
 * One timer for the whole app, not one per caller.
 *
 * Isolating the countdowns into small components is the right fix for the
 * re-render cost, but done naively it trades one problem for another: the
 * dashboard renders every screened event, so a row-level countdown would mean
 * a couple of thousand independent setIntervals. A single module-level ticker
 * with useSyncExternalStore gives every subscriber the same value from the same
 * timer, and the timer only exists while something is subscribed.
 */
const listeners = new Set<() => void>();
let ticker: ReturnType<typeof setInterval> | undefined;
let snapshot = Date.now() + EPOCH_OFFSET;

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  if (!ticker) {
    ticker = setInterval(() => {
      const next = Date.now() + EPOCH_OFFSET;
      if (Math.floor(next / 1000) === Math.floor(snapshot / 1000)) return;
      snapshot = next;
      for (const l of listeners) l();
    }, 250);
  }
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0 && ticker) {
      clearInterval(ticker);
      ticker = undefined;
    }
  };
}

/**
 * Console time in ms, quantised to `quantumMs`.
 *
 * Call it as close to the text that displays it as possible. Calling it at a
 * route's top level re-renders that whole route every second — table, plots,
 * panels and all — to move a few digits. See components/Countdown.
 *
 * The quantum is what a caller actually needs, not how often the timer runs:
 * every caller shares the one ticker above, and useSyncExternalStore skips the
 * re-render when the quantised value has not moved. So a component that only
 * needs five-second resolution costs nothing in the four seconds between —
 * which matters for the burn advisor, where a changed `now` re-propagates a
 * state vector.
 */
export function useNow(quantumMs = 1000): number {
  const read = useCallback(() => Math.floor(snapshot / quantumMs) * quantumMs, [quantumMs]);
  return useSyncExternalStore(subscribe, read, read);
}

/** Real wall-clock time, for anything describing the session rather than the run. */
export const wallClock = () => Date.now();
