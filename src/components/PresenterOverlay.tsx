import { useEffect, useRef, useState } from 'react';
import { usePresenter } from '../state/presenter';
import { DURATION, EASE, reducedMotion } from '../lib/motion';
import { ChevronRight, CloseIcon } from './Icon';

/**
 * Presenter Mode's overlay: the spotlight ring, the caption, and Next/Prev/
 * Exit.
 *
 * Mounted once, at the top of `App`, above `<Routes>` rather than inside any
 * one of them — a route change unmounts everything below `<Routes>`, and the
 * whole point of this component is to survive exactly that, since walking
 * DEMO.md's path means navigating between six routes without losing the
 * caption or the step count.
 *
 * The spotlight is a single element with a 9999px `box-shadow` cut to the
 * target's bounding rect — the classic CSS spotlight trick — rather than four
 * dimming rectangles. That has one deliberate consequence: the ring has
 * `pointer-events: none`, so nothing it draws can block a click. DEMO.md's
 * script is not narration over a slideshow, it is "hit ISRO assets · 72",
 * "drag delta-v", "drag the target mass slider" — the presenter is meant to
 * actually touch the console while this is open, and the overlay would be
 * working against the feature it exists to support if it ate the click first.
 */

const MARGIN = 10;

function useTargetRect(target: string | null, active: boolean): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const frame = useRef<number>();

  useEffect(() => {
    setRect(null);
    if (!active || !target) return;

    let cancelled = false;
    let scrolled = false;
    const start = performance.now();

    const tick = () => {
      if (cancelled) return;
      const el = document.querySelector<HTMLElement>(`[data-presenter="${target}"]`);
      if (el) {
        if (!scrolled) {
          scrolled = true;
          el.scrollIntoView({
            behavior: reducedMotion() ? 'auto' : 'smooth',
            block: 'center',
            inline: 'nearest',
          });
        }
        setRect(el.getBoundingClientRect());
      } else if (performance.now() - start > 4000) {
        // Route chunk never mounted the target in time — show the caption
        // without a spotlight rather than spin forever.
        setRect(null);
        return;
      } else {
        setRect(null);
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [target, active]);

  return rect;
}

export function PresenterOverlay() {
  const { active, step, index, steps, next, prev, exit } = usePresenter();
  const rect = useTargetRect(step?.target ?? null, active);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); exit(); }
      else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, next, prev, exit]);

  if (!active || !step) return null;

  const progress = (index + 1) / steps.length;
  const transition = `top ${DURATION.medium}s ${EASE.emphasized}, left ${DURATION.medium}s ${EASE.emphasized}, width ${DURATION.medium}s ${EASE.emphasized}, height ${DURATION.medium}s ${EASE.emphasized}, opacity ${DURATION.micro}s ${EASE.out}`;

  return (
    <div className="pointer-events-none fixed inset-0 z-[1000]" aria-hidden={false}>
      {/* Spotlight ring. Dimming is the box-shadow itself, so it never blocks
          a click — see the file header. */}
      <div
        style={
          rect
            ? {
                top: rect.top - MARGIN,
                left: rect.left - MARGIN,
                width: rect.width + MARGIN * 2,
                height: rect.height + MARGIN * 2,
                opacity: 1,
                transition,
              }
            : {
                top: '50%',
                left: '50%',
                width: 0,
                height: 0,
                opacity: 0,
                transition,
              }
        }
        className="absolute rounded-lg border border-accent-border shadow-[0_0_0_9999px_rgba(4,8,14,0.74)]"
      />

      {/* Live region so a screen reader hears the caption change without the
          overlay stealing focus off whatever the presenter is demonstrating. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto glass-panel fixed inset-x-3 bottom-3 z-[1001] mx-auto flex max-w-[720px] flex-col gap-3 rounded-lg border border-hairline bg-panel p-4 sm:inset-x-auto sm:bottom-6 sm:left-1/2 sm:w-[min(92vw,680px)] sm:-translate-x-1/2"
      >
        <div className="h-[2px] w-full overflow-hidden rounded-full bg-panel-high">
          <div
            className="h-full rounded-full bg-accent"
            style={{ width: `${progress * 100}%`, transition: `width ${DURATION.medium}s ${EASE.emphasized}` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-2xs uppercase tracking-label text-accent">
            {step.eyebrow}
          </span>
          <span className="num flex-none text-xs- text-tertiary">
            {index + 1} / {steps.length}
          </span>
        </div>

        <p className="text-base leading-[1.6] text-primary [text-wrap:pretty]">{step.caption}</p>

        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={exit}
            className="lift flex items-center gap-[6px] rounded border border-hairline bg-panel px-[11px] py-[6px] font-mono text-2xs uppercase tracking-label text-tertiary transition-colors hover:border-[color:var(--t3)] hover:text-primary"
          >
            <CloseIcon size={10} />
            Exit
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={prev}
              disabled={index === 0}
              className="lift flex items-center gap-[4px] rounded border border-hairline bg-panel px-[11px] py-[6px] font-mono text-2xs uppercase tracking-label text-secondary transition-colors hover:border-[color:var(--t3)] hover:text-primary disabled:opacity-35 disabled:hover:border-hairline disabled:hover:text-secondary"
            >
              <ChevronRight size={9} className="rotate-180" />
              Prev
            </button>
            <button
              type="button"
              onClick={next}
              className="lift flex items-center gap-[4px] rounded border border-accent-border bg-accent px-[13px] py-[6px] font-mono text-2xs uppercase tracking-label text-[color:var(--accent-ink)] transition-colors hover:bg-accent-hover"
            >
              {index === steps.length - 1 ? 'Finish' : 'Next'}
              <ChevronRight size={9} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
