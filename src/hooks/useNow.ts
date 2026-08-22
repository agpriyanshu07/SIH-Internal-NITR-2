import { useEffect, useState } from 'react';
import { SNAPSHOT_EPOCH } from '../data/engine/catalogue';

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

/** Console time in ms, re-rendering on an interval. Drives every countdown. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now() + EPOCH_OFFSET);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now() + EPOCH_OFFSET), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** Real wall-clock time, for anything describing the session rather than the run. */
export const wallClock = () => Date.now();
