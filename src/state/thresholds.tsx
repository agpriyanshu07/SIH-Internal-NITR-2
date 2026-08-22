import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { ResolvedConjunction, Severity } from '../data/types';
import { SEVERITY_RANK } from '../data/riskScore';
import { DEFAULT_HORIZON_HOURS } from '../data/engine/run';

/**
 * Screening thresholds.
 *
 * These are the operator's floor: anything below them never reaches the
 * dashboard at all. The dashboard's own filters then work *within* whatever
 * this admits, which is why changing a threshold visibly changes the event
 * count on the console.
 */

export interface Thresholds {
  /** Lowest severity band that is allowed through at all. */
  minSeverity: Severity | 'ALL';
  /** Events with a miss distance above this are not screened in, km. */
  maxMissKm: number;
  /** Events with a probability of collision below this are dropped. */
  minPc: number;
  /** Screening horizon, hours. */
  horizonHours: number;
  /** Element sets older than this are excluded as untrustworthy, days. */
  maxElementAgeDays: number;
  /**
   * Multiplier on the assumed 1-sigma positional uncertainty.
   *
   * Not a floor like the others — a modelling assumption. A TLE carries no
   * covariance, so the sigma behind every Pc on this console is inferred from
   * element-set age and tracking quality. This lets an operator ask what the
   * board looks like under a more or less pessimistic assumption. 1 is the
   * console's own estimate.
   */
  sigmaScale: number;
}

/**
 * Defaults admit everything the screening run produced — the floor is opt-in,
 * so a fresh console shows the full screened set rather than silently hiding a
 * tail, and sigma sits at the console's own estimate rather than a hedge.
 */
export const DEFAULT_THRESHOLDS: Thresholds = {
  minSeverity: 'ALL',
  maxMissKm: 25,
  minPc: 0,
  horizonHours: DEFAULT_HORIZON_HOURS,
  maxElementAgeDays: 10,
  sigmaScale: 1,
};

const KEY = 'kessler.thresholds';

interface Ctx {
  thresholds: Thresholds;
  set: <K extends keyof Thresholds>(key: K, value: Thresholds[K]) => void;
  reset: () => void;
  /** True when the operator has moved anything off the defaults. */
  modified: boolean;
}

const ThresholdsContext = createContext<Ctx | null>(null);

export function ThresholdsProvider({ children }: { children: ReactNode }) {
  const [thresholds, setThresholds] = useState<Thresholds>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULT_THRESHOLDS, ...JSON.parse(raw) } : DEFAULT_THRESHOLDS;
    } catch {
      return DEFAULT_THRESHOLDS;
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(thresholds));
  }, [thresholds]);

  const set = useCallback<Ctx['set']>((key, value) => {
    setThresholds((t) => ({ ...t, [key]: value }));
  }, []);

  const reset = useCallback(() => setThresholds(DEFAULT_THRESHOLDS), []);

  const modified = useMemo(
    () =>
      (Object.keys(DEFAULT_THRESHOLDS) as (keyof Thresholds)[]).some(
        (k) => thresholds[k] !== DEFAULT_THRESHOLDS[k],
      ),
    [thresholds],
  );

  const value = useMemo(
    () => ({ thresholds, set, reset, modified }),
    [thresholds, set, reset, modified],
  );

  return <ThresholdsContext.Provider value={value}>{children}</ThresholdsContext.Provider>;
}

export function useThresholds(): Ctx {
  const ctx = useContext(ThresholdsContext);
  if (!ctx) throw new Error('useThresholds must be used inside ThresholdsProvider');
  return ctx;
}

/** Does this event clear the operator's screening floor? */
export function passesThresholds(e: ResolvedConjunction, t: Thresholds): boolean {
  return (
    (t.minSeverity === 'ALL' || SEVERITY_RANK[e.sev] >= SEVERITY_RANK[t.minSeverity]) &&
    e.miss <= t.maxMissKm &&
    e.pc >= t.minPc &&
    e.tcaMin <= t.horizonHours * 60 &&
    e.maxAge <= t.maxElementAgeDays
  );
}
