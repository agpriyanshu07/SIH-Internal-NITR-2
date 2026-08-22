/**
 * Deterministic pseudo-random source.
 *
 * The whole catalogue is generated from one fixed seed so that every reload —
 * and every machine running the demo — produces byte-identical data. Nothing
 * here calls Math.random().
 */

/** mulberry32: small, fast, good enough for fabricated data. */
export function makeRng(seed: number) {
  let a = seed >>> 0;
  return function next(): number {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = ReturnType<typeof makeRng>;

/** Uniform float in [lo, hi). */
export const uniform = (rng: Rng, lo: number, hi: number) => lo + rng() * (hi - lo);

/** Uniform integer in [lo, hi]. */
export const int = (rng: Rng, lo: number, hi: number) => Math.floor(uniform(rng, lo, hi + 1));

/** Pick one element. */
export const pick = <T,>(rng: Rng, xs: readonly T[]): T => xs[int(rng, 0, xs.length - 1)];

/**
 * Pick with integer weights — used to skew the object mix towards debris and
 * the miss-distance distribution towards the unremarkable 2–15 km band.
 */
export function weighted<T>(rng: Rng, entries: readonly (readonly [T, number])[]): T {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let r = rng() * total;
  for (const [value, w] of entries) {
    r -= w;
    if (r <= 0) return value;
  }
  return entries[entries.length - 1][0];
}

/** Approximately normal, via the sum of three uniforms. Clamped to ±1. */
export const gauss = (rng: Rng) => ((rng() + rng() + rng()) / 1.5 - 1);
