import { useEffect, useRef, useState } from 'react';

/**
 * Counts a real number up from zero on mount.
 *
 * The figures are measured and the animation does not change them — it only
 * delays showing the last one by a few hundred milliseconds. The final frame
 * always sets the exact target rather than whatever the easing lands on, so
 * what a visitor reads is the number, not a rounding of it.
 *
 * Returns the target immediately under prefers-reduced-motion.
 */
export function useCountUp(target: number, durationMs = 900): number {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [value, setValue] = useState(reduced ? target : 0);
  const raf = useRef(0);

  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / durationMs);
      // Ease-out cubic: fast at first, settling rather than stopping.
      setValue(k === 1 ? target : target * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, durationMs, reduced]);

  return value;
}
