import { useEffect, useRef, useState } from 'react';

/**
 * Adds `.rise` to a section the first time it scrolls into view.
 *
 * The animation already exists in index.css — the selected-row rise uses it —
 * and it is under-used. No library: an IntersectionObserver and a boolean.
 *
 * Under prefers-reduced-motion the element is simply marked revealed at once,
 * so nothing animates and nothing is hidden waiting for an animation that will
 * never run. That second half matters more than the first: a reveal that gates
 * visibility on motion is a blank page for anyone who has motion turned off.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(
    () =>
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    if (shown) return;
    const el = ref.current;
    if (!el) return;
    // Also covers the case where the section is already on screen at load.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return { ref, className: shown ? 'rise' : 'opacity-0' };
}
