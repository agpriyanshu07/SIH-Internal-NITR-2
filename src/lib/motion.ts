/**
 * Shared motion vocabulary.
 *
 * This is the one place JS-driven motion (Motion, GSAP) looks up a duration or
 * an easing curve, so a "hover" everywhere in the console feels like the same
 * hover. CSS-driven motion already has its own vocabulary in `index.css`
 * (`krise`, `krowin`, `kslidein`, the 0.26s/0.34s transition block on
 * `div, button, input, a, svg circle`) — this file does not replace that, it
 * gives the same three tiers to code that cannot express itself in a
 * `@keyframes` block: canvas drawing (the orbital viewer), imperative
 * timelines (GSAP), and anything that needs to read "how long should this
 * take" as a number rather than a class name.
 *
 * Three tiers, matching the CSS tiers:
 *
 *   MICRO   120-180ms ease-out   hover, press, toggle — anything that answers
 *                                a single pointer or key event
 *   MEDIUM  250-350ms            route/panel/list transitions — anything that
 *                                changes what's on screen
 *   AMBIENT 4-8s, low amplitude  background motion nobody is meant to track
 *                                with their eyes — the hero canvas drift, a
 *                                slow pulse
 *
 * `prefers-reduced-motion` is read once at import time via `matchMedia` and
 * exposed as `reducedMotion()`. It updates live (the listener is registered
 * once, module-scope) because a user can flip the OS setting without
 * reloading the tab and devtools' emulation panel does that constantly while
 * this gets tested. Every helper below collapses to an instant, no-animation
 * form when it's true — the same contract the CSS block at the bottom of
 * `index.css` already keeps, extended into code.
 */

export const DURATION = {
  /** Hover, press, toggle. */
  micro: 0.15,
  /** Route change, panel open/close, list enter/exit. */
  medium: 0.3,
  /** Ambient background drift — seconds, not the fraction the other two are. */
  ambient: 6,
} as const;

/**
 * Cubic-bezier equivalents of the CSS eases already in use, expressed as GSAP/
 * Motion-compatible easing strings so a JS timeline and a CSS transition
 * finishing at the same time actually look like the same motion. `emphasized`
 * matches the transform easing already declared globally in index.css
 * (`cubic-bezier(0.22, 1, 0.36, 1)`) — reuse it rather than inventing a second
 * curve for the same kind of movement.
 */
export const EASE = {
  /** Micro-interactions: quick out, no overshoot. */
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** Route/panel/list transitions — the curve index.css already uses for transform. */
  emphasized: 'cubic-bezier(0.22, 1, 0.36, 1)',
  /** Ambient motion: slow in and out, nothing that reads as arriving or leaving. */
  ambient: 'sine.inOut',
} as const;

/**
 * Live-updating reduced-motion flag. A function, not a constant, because the
 * media query can flip after this module has already been imported —
 * devtools' "Emulate CSS prefers-reduced-motion" toggle changes it without a
 * reload, and this is what every animation helper below has to see happen.
 */
let _reduced = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
  : false;

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onChange = () => { _reduced = mq.matches; };
  // addEventListener over the deprecated addListener; both exist on the type
  // in modern lib.dom, so this is safe without a feature check.
  mq.addEventListener('change', onChange);
}

export function reducedMotion(): boolean {
  return _reduced;
}

/**
 * A duration in seconds, collapsed to near-zero under reduced motion. Pass one
 * of the DURATION tiers, or a custom number for a one-off. GSAP and Motion
 * both accept 0 as "no animation, jump to end state" — but a hard 0 sometimes
 * skips onComplete callbacks that a caller relies on to flip state after the
 * tween, so this returns a single frame (1/60s) instead of a literal zero.
 */
export function motionDuration(seconds: number): number {
  return _reduced ? 1 / 60 : seconds;
}
