import { useCallback, useEffect, useState } from 'react';
import type { Severity } from '../data/types';

/**
 * Standing rules that pick events out of a screening run.
 *
 * This is the buildable half of "alert routing". Matching a rule against a
 * result is arithmetic and happens here, in the browser, against the same
 * committed run the dashboard shows. DELIVERY is the half that cannot exist —
 * there is no server to send an email or POST a webhook from, and a form that
 * pretended otherwise would be the one dishonest thing in the app.
 *
 * So the rules are real and the matches are real, and the screen says plainly
 * that nothing leaves the browser. Persisted under the same `kessler.*` key
 * convention as the thresholds and the acknowledgements.
 */

export interface AlertRule {
  id: string;
  name: string;
  /** Fire at or above this severity. */
  minSeverity: Severity;
  /** Only events involving an ISRO-operated asset. */
  isroOnly: boolean;
  /** Ignore anything missing by more than this, km. */
  maxMissKm: number;
  /** Ignore anything further out than this, hours. */
  withinHours: number;
  enabled: boolean;
}

const KEY = 'kessler.alertRules';

/*
 * Two rules to start with, because an empty rule list teaches nobody what a
 * rule is. Both are ones an operator of this catalogue would plausibly write:
 * the ISRO fleet at any severity worth a look, and anything critical at all.
 */
export const DEFAULT_RULES: AlertRule[] = [
  {
    id: 'isro-high',
    name: 'ISRO fleet — HIGH and above',
    minSeverity: 'HIGH',
    isroOnly: true,
    maxMissKm: 5,
    withinHours: 72,
    enabled: true,
  },
  {
    id: 'any-critical',
    name: 'Anything CRITICAL, whoever owns it',
    minSeverity: 'CRITICAL',
    isroOnly: false,
    maxMissKm: 25,
    withinHours: 72,
    enabled: true,
  },
];

function load(): AlertRule[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_RULES;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_RULES;
    // Merge onto a default so a rule written by an older build cannot arrive
    // missing a field the UI now reads.
    return parsed.map((r) => ({ ...DEFAULT_RULES[0], ...(r as object) }) as AlertRule);
  } catch {
    return DEFAULT_RULES;
  }
}

export function useAlertRules() {
  const [rules, setRules] = useState<AlertRule[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(rules));
    } catch {
      // Private browsing or disabled storage. The session stays correct.
    }
  }, [rules]);

  const update = useCallback(
    (id: string, patch: Partial<AlertRule>) =>
      setRules((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r))),
    [],
  );

  const add = useCallback(
    () =>
      setRules((rs) => [
        ...rs,
        {
          ...DEFAULT_RULES[0],
          id: `rule-${Date.now().toString(36)}`,
          name: `Rule ${rs.length + 1}`,
          isroOnly: false,
        },
      ]),
    [],
  );

  const remove = useCallback((id: string) => setRules((rs) => rs.filter((r) => r.id !== id)), []);
  const reset = useCallback(() => setRules(DEFAULT_RULES), []);

  return { rules, update, add, remove, reset };
}
