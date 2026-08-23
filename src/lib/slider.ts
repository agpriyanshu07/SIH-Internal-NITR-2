import type { CSSProperties } from 'react';

/**
 * Fill position for a range input, as the `--k-fill` custom property the
 * `.k-slider` class reads (see index.css).
 *
 * A styled range input loses the browser's own filled track, so the portion
 * left of the thumb has to be drawn as a gradient stop. Only the stop position
 * travels through here — the gradient itself lives in CSS, so the colours stay
 * with the rest of the design tokens rather than being rebuilt in thirteen
 * separate TSX files.
 *
 * Works unchanged for a value in real units (kilometres, hours, mm/s) and for
 * an index into a discrete scale such as the Pc slider's log stops: both read
 * their own min, max and value, and the proportion between them is the same
 * question either way.
 */
export function sliderFill(
  value: number,
  min: number,
  max: number,
): CSSProperties {
  const span = max - min;
  // A zero span would divide by zero; a single-valued slider reads as full.
  const fraction = span === 0 ? 1 : (value - min) / span;
  const pct = Math.max(0, Math.min(1, fraction)) * 100;
  return { '--k-fill': `${pct.toFixed(2)}%` } as CSSProperties;
}
