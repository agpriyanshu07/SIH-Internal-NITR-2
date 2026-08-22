import { useCallback, useEffect, useState } from 'react';

/**
 * Acknowledged events.
 *
 * Persisted in localStorage under the same `kessler.*` key convention as the
 * screening thresholds and the operator name. There is no backend, so an
 * acknowledgement is local to this browser and this browser only — the status
 * screen says exactly that rather than implying it reached anyone.
 */
const KEY = 'kessler.acknowledged';

function load(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((v) => typeof v === 'string')) : new Set();
  } catch {
    // Private browsing, disabled storage, or a value someone else wrote.
    return new Set();
  }
}

export function useAcknowledged() {
  const [ids, setIds] = useState<Set<string>>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify([...ids]));
    } catch {
      // Nothing to do — the UI stays correct for this session either way.
    }
  }, [ids]);

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isAcknowledged = useCallback((id: string) => ids.has(id), [ids]);

  return { acknowledged: ids, toggle, isAcknowledged };
}
