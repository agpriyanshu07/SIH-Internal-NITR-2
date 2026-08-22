import type { SpaceObject } from '../types';

/**
 * Probability of collision.
 *
 * Unchanged from the prototype's original model — only its inputs changed. It
 * used to be fed miss distances and element-set ages drawn from a seeded
 * generator; it is now fed a miss distance measured by SGP4 and an element-set
 * age read off the object's own TLE epoch. The arithmetic below is the same.
 */

/** Combined hard-body radius contribution by RCS class, km. */
export const HBR: Record<SpaceObject['rcs'], number> = {
  LARGE: 0.05,
  MEDIUM: 0.034,
  SMALL: 0.02,
};

/**
 * How badly each size class is tracked, as an additive 1-sigma penalty in km.
 * A 10 cm fragment returns far less radar energy than a bus-sized spacecraft,
 * so its state is known far less precisely.
 */
const RCS_SIGMA: Record<SpaceObject['rcs'], number> = {
  LARGE: 0.05,
  MEDIUM: 0.15,
  SMALL: 0.35,
};

/**
 * Combined positional uncertainty for a pair, km.
 *
 * TLEs carry no covariance, so a 1-sigma value has to be assumed — this is the
 * assumption the detail page's data-quality panel discloses. Two things drive
 * it, and both are honest: element sets go stale, and small objects are tracked
 * worse than large ones. The consequence is the one that makes the ranking
 * interesting — a close approach between two well-tracked large objects scores
 * far above an equally close approach involving an elderly fragment, because in
 * the second case we mostly do not know where anything is.
 *
 * `a.age` and `b.age` are now real: the gap between each object's own TLE epoch
 * and the screening instant.
 */
export function sigmaFor(a: SpaceObject, b: SpaceObject): number {
  return 0.9 + 0.055 * (a.age + b.age) + RCS_SIGMA[a.rcs] + RCS_SIGMA[b.rcs];
}

/**
 * Sigma with an operator-supplied scale applied.
 *
 * The Thresholds screen exposes this: the covariance is an assumption, so an
 * operator should be able to see what a more or less pessimistic one does to
 * the severity banding.
 */
export const scaledSigma = (base: number, scale: number) => base * scale;

/**
 * Foster-style circular Pc: a 2D Gaussian miss distribution integrated over the
 * combined hard-body disc. Reduces to a clean closed form when the hard body is
 * small relative to sigma, which it always is here.
 */
export function pcFoster(missKm: number, hbrKm: number, sigmaKm: number): number {
  const twoSigmaSq = 2 * sigmaKm * sigmaKm;
  return ((hbrKm * hbrKm) / twoSigmaSq) * Math.exp(-(missKm * missKm) / twoSigmaSq);
}
