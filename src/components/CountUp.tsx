import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { DURATION, reducedMotion } from '../lib/motion';

/**
 * A number that eases toward a new value instead of snapping to it.
 *
 * Used on the dashboard's metric tiles — the objects/pairs/latency figures
 * that already change for a real reason (a live re-screen replacing the
 * committed result) rather than as decoration. Formats every intermediate
 * frame with the same `format` function the final value uses, so a
 * comma-grouped integer never flashes an unformatted number mid-count.
 */
export function CountUp({
  value,
  format,
  duration = DURATION.medium,
}: {
  value: number;
  format: (n: number) => string;
  /** Seconds. Longer counts (latency, which moves less often and matters
   *  more when it does) can pass a bigger number than the default. */
  duration?: number;
}) {
  const [display, setDisplay] = useState(value);
  // Mirrors `display` synchronously, so a tween interrupted mid-flight by a
  // second value change starts from where the number actually is on screen
  // rather than snapping back to wherever the first tween started.
  const current = useRef(value);

  useEffect(() => {
    if (current.current === value) return;
    if (reducedMotion()) {
      current.current = value;
      setDisplay(value);
      return;
    }
    const state = { v: current.current };
    const tween = gsap.to(state, {
      v: value,
      duration,
      ease: 'power2.out',
      onUpdate: () => { current.current = state.v; setDisplay(state.v); },
    });
    return () => { tween.kill(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{format(display)}</>;
}
