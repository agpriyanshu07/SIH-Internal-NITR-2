import { useEffect, useRef, useState } from 'react';

/**
 * True once the element has been scrolled into view, and true forever after.
 *
 * An IntersectionObserver and a boolean — no animation library for an effect
 * at this tier. The observer disconnects on the first intersection, because a
 * reveal that re-runs when you scroll back up is a page that will not settle.
 *
 * The trigger is 12% up from the bottom edge: the section starts moving as it
 * comes in rather than after it has arrived, which is what separates a reveal
 * from a thing that pops.
 *
 * Under prefers-reduced-motion it starts true. That half matters more than the
 * animation: a reveal that gates visibility on motion leaves a blank page for
 * anyone who has motion turned off, and an observer that never fires would be
 * exactly that.
 */
export function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(
    () =>
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    if (inView) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView]);

  return { ref, inView };
}

/**
 * The classes and inline delay for one revealed thing.
 *
 * A transition rather than the `.rise` keyframe, because a keyframe cannot be
 * staggered per child — `transition-delay` can, and staggering is most of what
 * makes a group of cards read as arriving rather than blinking on.
 *
 * Tuned up from the first pass, which was too quiet to notice: 300ms and 12px
 * of travel is the "subtle" tier, appropriate for a control changing state and
 * invisible on a section arriving. This is 560ms over 24px on an expo-style
 * curve — most of the distance covered early, then a long settle, which is what
 * reads as weight rather than as a slide. The 1.5% scale is below the threshold
 * of noticing on its own and is doing the work of making the section feel like
 * it comes forward rather than up.
 *
 * 70 ms per index, capped at six: past that the last card is waiting long
 * enough to feel broken rather than choreographed.
 */
export function revealProps(inView: boolean, index = 0) {
  return {
    className: `transition-[opacity,transform] duration-[560ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
      inView ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-6 scale-[0.985] opacity-0'
    }`,
    style: { transitionDelay: inView ? `${Math.min(index, 6) * 70}ms` : '0ms' },
  };
}
