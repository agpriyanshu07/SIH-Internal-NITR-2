/**
 * Two-body propagation from a state vector, by universal variables.
 *
 * SGP4 propagates a TLE's *mean* elements. It cannot propagate an arbitrary
 * state vector, which is exactly what you have the moment an operator applies a
 * delta-v — and SGP4 is not invertible, so there is no honest way to turn a
 * burned state back into a TLE.
 *
 * The way out is differential: propagate BOTH the burned and the unburned state
 * with the same two-body integrator from the burn epoch, and take the
 * difference. What that difference contains is the effect of the burn; the
 * two-body model error, drag and J2 are common to both arms and very largely
 * cancel. The absolute trajectory still comes from SGP4 — only the displacement
 * comes from here.
 *
 * Universal variables rather than classical elements because the formulation is
 * free of the singularities at zero eccentricity and zero inclination, and LEO
 * orbits sit close enough to circular that a classical propagator would be
 * fighting them constantly.
 *
 * Reference: Vallado, Fundamentals of Astrodynamics and Applications, the
 * KEPLER algorithm.
 */

const MU = 398600.4418; // km³/s²

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface State {
  r: Vec3;
  v: Vec3;
}

const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;
const mag = (a: Vec3) => Math.sqrt(dot(a, a));

/**
 * Stumpff functions c2 and c3.
 *
 * The series expansions near psi = 0 are not an optimisation — evaluating the
 * closed forms there divides by a vanishing psi and loses all precision.
 */
function stumpff(psi: number): [number, number] {
  if (psi > 1e-6) {
    const s = Math.sqrt(psi);
    return [(1 - Math.cos(s)) / psi, (s - Math.sin(s)) / Math.sqrt(psi * psi * psi)];
  }
  if (psi < -1e-6) {
    const s = Math.sqrt(-psi);
    return [
      (1 - Math.cosh(s)) / psi,
      (Math.sinh(s) - s) / Math.sqrt(-psi * -psi * -psi),
    ];
  }
  return [0.5, 1 / 6];
}

/**
 * Propagate a state vector by `dtSeconds`. Returns null if the universal
 * variable iteration fails to converge, rather than returning a plausible
 * wrong answer.
 */
export function propagateState(state: State, dtSeconds: number): State | null {
  const { r: r0v, v: v0v } = state;
  if (dtSeconds === 0) return state;

  const r0 = mag(r0v);
  const v0 = mag(v0v);
  if (!(r0 > 0) || !Number.isFinite(v0)) return null;

  const sqrtMu = Math.sqrt(MU);
  const rdotv = dot(r0v, v0v);
  // Reciprocal semi-major axis. Positive for a bound orbit.
  const alpha = 2 / r0 - (v0 * v0) / MU;

  let chi: number;
  if (alpha > 1e-9) {
    chi = sqrtMu * dtSeconds * alpha;
  } else if (Math.abs(alpha) <= 1e-9) {
    // Effectively parabolic — not a LEO case, but do not silently mishandle it.
    return null;
  } else {
    const a = 1 / alpha;
    chi =
      Math.sign(dtSeconds) *
      Math.sqrt(-a) *
      Math.log(
        (-2 * MU * alpha * dtSeconds) /
          (rdotv + Math.sign(dtSeconds) * Math.sqrt(-MU * a) * (1 - r0 * alpha)),
      );
  }

  let psi = 0;
  let c2 = 0.5;
  let c3 = 1 / 6;
  let r = r0;
  let converged = false;

  for (let i = 0; i < 60; i++) {
    psi = chi * chi * alpha;
    [c2, c3] = stumpff(psi);
    r =
      chi * chi * c2 +
      (rdotv / sqrtMu) * chi * (1 - psi * c3) +
      r0 * (1 - psi * c2);
    if (!(r > 0)) return null;

    const dchi =
      (sqrtMu * dtSeconds -
        chi * chi * chi * c3 -
        (rdotv / sqrtMu) * chi * chi * c2 -
        r0 * chi * (1 - psi * c3)) /
      r;
    chi += dchi;
    if (Math.abs(dchi) < 1e-9) {
      converged = true;
      break;
    }
  }
  if (!converged) return null;

  // Lagrange coefficients.
  const f = 1 - (chi * chi * c2) / r0;
  const g = dtSeconds - (chi * chi * chi * c3) / sqrtMu;
  const gdot = 1 - (chi * chi * c2) / r;
  const fdot = (sqrtMu / (r * r0)) * chi * (psi * c3 - 1);

  return {
    r: {
      x: f * r0v.x + g * v0v.x,
      y: f * r0v.y + g * v0v.y,
      z: f * r0v.z + g * v0v.z,
    },
    v: {
      x: fdot * r0v.x + gdot * v0v.x,
      y: fdot * r0v.y + gdot * v0v.y,
      z: fdot * r0v.z + gdot * v0v.z,
    },
  };
}

/** Add a delta-v along the velocity direction. `dvKmS` may be negative. */
export function applyAlongTrackDeltaV(state: State, dvKmS: number): State {
  const speed = mag(state.v);
  if (!(speed > 0)) return state;
  const s = dvKmS / speed;
  return {
    r: state.r,
    v: {
      x: state.v.x * (1 + s),
      y: state.v.y * (1 + s),
      z: state.v.z * (1 + s),
    },
  };
}
