import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRESENTER_SCRIPT, type PresenterStep } from '../data/presenterScript';

/**
 * Presenter Mode's step-state manager.
 *
 * The steps themselves are data (`data/presenterScript.ts`, itself a direct
 * transcription of DEMO.md §2) — this file only owns *which step is current*
 * and the two things that follow from that: navigating the router there, and
 * exposing Next/Prev/Exit to whatever renders the overlay.
 *
 * Deliberately not persisted to localStorage. A rehearsal that resumed at
 * step 9 after a reload would be confusing, not convenient — every start is a
 * start from the top of the DEMO.md path.
 */

interface Ctx {
  active: boolean;
  index: number;
  step: PresenterStep | null;
  steps: PresenterStep[];
  start: () => void;
  exit: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
}

const PresenterContext = createContext<Ctx | null>(null);

export function PresenterProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  const goToIndex = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(PRESENTER_SCRIPT.length - 1, i));
      setIndex(clamped);
      navigate(PRESENTER_SCRIPT[clamped].route);
    },
    [navigate],
  );

  const start = useCallback(() => {
    setActive(true);
    goToIndex(0);
  }, [goToIndex]);

  const exit = useCallback(() => setActive(false), []);

  const next = useCallback(() => {
    if (index >= PRESENTER_SCRIPT.length - 1) {
      setActive(false);
      return;
    }
    goToIndex(index + 1);
  }, [index, goToIndex]);

  const prev = useCallback(() => {
    if (index === 0) return;
    goToIndex(index - 1);
  }, [index, goToIndex]);

  const value = useMemo<Ctx>(
    () => ({
      active,
      index,
      step: active ? PRESENTER_SCRIPT[index] : null,
      steps: PRESENTER_SCRIPT,
      start,
      exit,
      next,
      prev,
      goTo: goToIndex,
    }),
    [active, index, start, exit, next, prev, goToIndex],
  );

  return <PresenterContext.Provider value={value}>{children}</PresenterContext.Provider>;
}

export function usePresenter(): Ctx {
  const ctx = useContext(PresenterContext);
  if (!ctx) throw new Error('usePresenter must be used inside PresenterProvider');
  return ctx;
}
