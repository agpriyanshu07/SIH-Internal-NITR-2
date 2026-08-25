import * as satellite from 'satellite.js';

/**
 * Positional uncertainty measured from the element sets themselves.
 *
 * This is the answer to the sharpest question this project faces: the 1-sigma
 * feeding Pc is assumed, so the severity banding and the whole triage argument
 * rest on a number nobody measured. `pc.ts` models it from element-set age and
 * radar cross-section class, discloses it wherever it appears, and lets you
 * scale it on the thresholds screen — which is honest, and is not a defence.
 *
 * ── Successive TLE differencing ─────────────────────────────────────────────
 *
 * There is a published method that needs nothing but public data. Take two
 * consecutive element sets for the same object. Each one is a fit to
 * observations around its own epoch, so each is the catalogue's best estimate
 * of where the object was at a time the other one has to be propagated to
 * reach. Propagate both to a common instant and difference the states: the
 * residual is the disagreement between two independent fits, which is a sample
 * of the error the propagation carries. Do it over a run of element sets and
 * the standard deviation of those residuals — decomposed radial, along-track
 * and cross-track — is a measured uncertainty for that specific object.
 *
 * Flohrer et al. (AMOS 2008) categorised the whole US catalogue this way, and
 * ESA has used the technique in routine conjunction work since. Its known limit
 * is stated where it belongs, in `estimateUncertainty`'s return: it measures
 * the CONSISTENCY of successive fits, so an error that biases the whole series
 * the same way — a shared theory error, an object whose drag model is simply
 * wrong — is invisible to it. It is a floor on the uncertainty, not a ceiling.
 *
 * ── What this module is, and is not ─────────────────────────────────────────
 *
 * It is the estimator, and it is tested. What it needs is several element sets
 * per object at different epochs, and the committed snapshot is deliberately a
 * SINGLE instant — every TLE captured together so their epochs are mutually
 * consistent, which is what makes the screening run meaningful. One epoch per
 * object is exactly the input this method cannot use.
 *
 * `scripts/fetch-history.sh` collects the history; `npm run uncertainty` runs
 * this over it and writes the result. Until that has been run, the console uses
 * the modelled sigma and says so — `features.ts` carries the distinction and
 * `MEASURED_SIGMA` below is empty. Nothing in the UI claims a measured
 * covariance on the strength of a method that has not been fed.
 */

/** Radial / along-track / cross-track, km. The frame conjunction work uses. */
export interface RicSigma {
  radial: number;
  alongTrack: number;
  crossTrack: number;
  /** Root-sum-square of the three, km — what a circular Pc model wants. */
  total: number;
}

export interface UncertaintyEstimate extends RicSigma {
  norad: number;
  /** How many successive pairs the standard deviations were taken over. */
  samples: number;
  /** Mean gap between the differenced epochs, days. */
  meanSpanDays: number;
  /**
   * Always true, and present so a consumer has to acknowledge it. Successive
   * differencing measures agreement between fits, so a bias common to the whole
   * series does not appear. Treat the result as a lower bound.
   */
  consistencyOnly: true;
}

type Vec3 = { x: number; y: number; z: number };

const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
const norm = (a: Vec3) => Math.sqrt(dot(a, a));
const scale = (a: Vec3, k: number): Vec3 => ({ x: a.x * k, y: a.y * k, z: a.z * k });
const cross = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});
const unit = (a: Vec3): Vec3 => {
  const n = norm(a);
  return n > 0 ? scale(a, 1 / n) : { x: 0, y: 0, z: 0 };
};

/**
 * Project a difference vector into the RIC frame of a reference state.
 *
 * Radial is along the position vector. Cross-track is along the orbit normal,
 * r x v. Along-track completes the right-handed set — and note that it is
 * `cross(crossTrack, radial)`, NOT the velocity direction: the two coincide
 * only for a circular orbit, and half this catalogue is debris on eccentric
 * orbits where using velocity would leak radial error into the along-track
 * figure. That leak is silent, and along-track is the component that matters
 * most, so it is worth the extra line.
 */
export function toRic(diff: Vec3, refPos: Vec3, refVel: Vec3): RicSigma {
  const radial = unit(refPos);
  const crossTrack = unit(cross(refPos, refVel));
  const alongTrack = cross(crossTrack, radial);
  const r = dot(diff, radial);
  const i = dot(diff, alongTrack);
  const c = dot(diff, crossTrack);
  return {
    radial: r,
    alongTrack: i,
    crossTrack: c,
    total: Math.sqrt(r * r + i * i + c * c),
  };
}

/** A TLE plus the epoch its own line 1 declares, in epoch milliseconds. */
export interface DatedTle {
  line1: string;
  line2: string;
  epochMs: number;
}

/** Propagate one element set to an absolute instant. Null if SGP4 refuses. */
function stateAt(
  tle: DatedTle,
  atMs: number,
): { pos: Vec3; vel: Vec3 } | null {
  const rec = satellite.twoline2satrec(tle.line1, tle.line2);
  if (rec.error) return null;
  const out = satellite.propagate(rec, new Date(atMs));
  const pos = out?.position;
  const vel = out?.velocity;
  if (!pos || !vel || typeof pos === 'boolean' || typeof vel === 'boolean') return null;
  if (!Number.isFinite(pos.x) || !Number.isFinite(vel.x)) return null;
  return { pos: pos as Vec3, vel: vel as Vec3 };
}

/**
 * Measure an object's positional uncertainty from a run of its element sets.
 *
 * Each consecutive pair is compared at the MIDPOINT of their two epochs, not at
 * one epoch or the other. Comparing at one of them would ask a single element
 * set to propagate the whole span while the other propagates nothing, which
 * measures one fit's extrapolation rather than the disagreement between two.
 * The midpoint splits the span, so both are extrapolating equally and the
 * residual is symmetric in the two fits.
 *
 * Returns null rather than a fabricated number when there is nothing to measure
 * — fewer than two usable element sets, or SGP4 declining every pair.
 */
export function estimateUncertainty(
  norad: number,
  history: DatedTle[],
): UncertaintyEstimate | null {
  const sorted = [...history].sort((a, b) => a.epochMs - b.epochMs);
  const residuals: RicSigma[] = [];
  const spans: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const older = sorted[i - 1];
    const newer = sorted[i];
    const spanMs = newer.epochMs - older.epochMs;
    // Two element sets at the same epoch are the same fit reissued; they carry
    // no information about disagreement and would pull every sigma toward zero.
    if (spanMs <= 0) continue;

    const mid = older.epochMs + spanMs / 2;
    const a = stateAt(older, mid);
    const b = stateAt(newer, mid);
    if (!a || !b) continue;

    // The newer fit is the reference: it is the one closer to the observations
    // that produced it, so its frame is the better one to resolve the error in.
    residuals.push(toRic(sub(a.pos, b.pos), b.pos, b.vel));
    spans.push(spanMs / 86400000);
  }

  if (residuals.length < 1) return null;

  /*
   * RMS about zero, not standard deviation about the sample mean.
   *
   * The quantity wanted is the typical MAGNITUDE of the disagreement, and zero
   * disagreement is the meaningful origin — two fits that agree should give
   * zero, and subtracting a sample mean would hide a consistent bias by
   * declaring it the centre. With few samples that difference is large.
   */
  const rms = (pick: (r: RicSigma) => number) =>
    Math.sqrt(residuals.reduce((s, r) => s + pick(r) ** 2, 0) / residuals.length);

  const radial = rms((r) => r.radial);
  const alongTrack = rms((r) => r.alongTrack);
  const crossTrack = rms((r) => r.crossTrack);

  return {
    norad,
    radial,
    alongTrack,
    crossTrack,
    total: Math.sqrt(radial ** 2 + alongTrack ** 2 + crossTrack ** 2),
    samples: residuals.length,
    meanSpanDays: spans.reduce((s, v) => s + v, 0) / spans.length,
    consistencyOnly: true,
  };
}

/**
 * Measured sigmas, by NORAD id, if any have been produced.
 *
 * Empty in the committed repository, and that is the honest state: the snapshot
 * is one instant per object, which is the one input this method cannot use.
 * Populate it by running `scripts/fetch-history.sh` and then `npm run
 * uncertainty`, which writes `src/data/measuredSigma.json`.
 *
 * `sigmaFor` in `pc.ts` is unchanged and remains the source of the sigma the
 * console actually uses. Wiring measured values in is a deliberate, separate
 * step, because the moment the console starts ranking on measured sigma the
 * feature registry, the data-quality panel on every event, and every CDM's
 * COVARIANCE_METHOD all have to change in the same commit — and doing that on
 * an empty table would be exactly the overstatement this project exists to
 * avoid.
 */
export const MEASURED_SIGMA: Record<number, UncertaintyEstimate> = {};

/** Whether any measured value exists — what the UI must check before claiming one. */
export const hasMeasuredSigma = (norad: number): boolean => norad in MEASURED_SIGMA;
