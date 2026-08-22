import * as satellite from 'satellite.js';
import type { Vec3 } from './twobody';

/**
 * Collision mechanics, done in the frame it should be done in.
 *
 * The first version of this analysis took the scalar relative speed from the
 * screening result and ejected fragments isotropically around the heavier
 * object's velocity. That is wrong in two ways that matter, and both are fixed
 * here.
 *
 * FIRST, the energy available to fragment the two bodies is the kinetic energy
 * in their CENTRE-OF-MASS frame, not in the Earth-centred one. In the ECI frame
 * two objects carry ~30 GJ each simply by being in orbit; almost none of that
 * is available to break anything. What is available is
 *
 *     E_cm = ½ · μ · |v_rel|²        with μ = m₁m₂/(m₁+m₂)
 *
 * the reduced-mass form. For a 1 kg fragment hitting a 1 t satellite, μ is
 * essentially 1 kg, and the answer is the fragment's kinetic energy relative to
 * the target — which is the physically right number and differs by three orders
 * of magnitude from either object's orbital energy.
 *
 * SECOND, the debris cloud's centre of mass continues along the momentum-
 * weighted mean of the two velocities, not along either parent's. For a
 * catastrophic collision between comparable masses that is a materially
 * different orbit. Fragments are therefore ejected around v_cm, and the sampled
 * cloud has its residual momentum removed so that Σmᵢvᵢ equals the true total.
 */

const MU = 398600.4418;

export interface ImpactGeometry {
  /** Both parents' state vectors at TCA, km and km/s. */
  r1: Vec3;
  v1: Vec3;
  r2: Vec3;
  v2: Vec3;
  /** Relative velocity vector, km/s — the vector, not just its magnitude. */
  vRel: Vec3;
  /** Impact speed, km/s. */
  speed: number;
  /** Angle between the two velocity vectors, degrees. */
  approachAngleDeg: number;
  /** Centre-of-mass velocity of the pair, km/s. */
  vCm: Vec3;
  /** Reduced mass, kg. */
  reducedMassKg: number;
  /** Kinetic energy in the centre-of-mass frame, joules — what can break things. */
  energyCmJ: number;
  /** The same energy expressed as TNT-equivalent kilograms, for intuition. */
  tntKg: number;
  /** Total momentum of the pair, kg·km/s. */
  momentum: Vec3;
}

const sub = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const mag = (a: Vec3) => Math.hypot(a.x, a.y, a.z);
const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z;

/** One kilogram of TNT releases 4.184 MJ. */
const TNT_J_PER_KG = 4.184e6;

export function impactGeometry(
  recA: satellite.SatRec,
  recB: satellite.SatRec,
  tcaMs: number,
  massAKg: number,
  massBKg: number,
): ImpactGeometry | null {
  const at = new Date(tcaMs);
  const pa = satellite.propagate(recA, at);
  const pb = satellite.propagate(recB, at);
  if (!pa?.position || !pa.velocity || !pb?.position || !pb.velocity) return null;

  const r1 = pa.position;
  const v1 = pa.velocity;
  const r2 = pb.position;
  const v2 = pb.velocity;

  const vRel = sub(v1, v2);
  const speed = mag(vRel);

  const s1 = mag(v1);
  const s2 = mag(v2);
  const approachAngleDeg =
    s1 > 0 && s2 > 0
      ? (Math.acos(Math.max(-1, Math.min(1, dot(v1, v2) / (s1 * s2)))) * 180) / Math.PI
      : 0;

  const total = massAKg + massBKg;
  const vCm: Vec3 = {
    x: (massAKg * v1.x + massBKg * v2.x) / total,
    y: (massAKg * v1.y + massBKg * v2.y) / total,
    z: (massAKg * v1.z + massBKg * v2.z) / total,
  };

  const reducedMassKg = (massAKg * massBKg) / total;
  // v in km/s -> m/s for joules.
  const energyCmJ = 0.5 * reducedMassKg * Math.pow(speed * 1000, 2);

  return {
    r1,
    v1,
    r2,
    v2,
    vRel,
    speed,
    approachAngleDeg,
    vCm,
    reducedMassKg,
    energyCmJ,
    tntKg: energyCmJ / TNT_J_PER_KG,
    momentum: {
      x: massAKg * v1.x + massBKg * v2.x,
      y: massAKg * v1.y + massBKg * v2.y,
      z: massAKg * v1.z + massBKg * v2.z,
    },
  };
}

/**
 * Nodal precession rate from J2, degrees per day.
 *
 * This is what turns a debris cloud into a shell. Immediately after a breakup
 * the fragments occupy a compact ellipsoid; because each ends up with a
 * slightly different semi-major axis, eccentricity and inclination, each
 * precesses its right ascension of the ascending node at a slightly different
 * rate, and the cloud smears around the Earth. The spread in this rate across
 * the cloud is what sets how long that takes — days for a wide cloud, years for
 * a tight one.
 */
export const J2 = 1.08262668e-3;
const RE = 6378.137;

export function nodalPrecessionDegPerDay(
  aKm: number,
  ecc: number,
  inclDeg: number,
): number {
  const p = aKm * (1 - ecc * ecc);
  if (!(p > 0) || !(aKm > 0)) return 0;
  const n = Math.sqrt(MU / (aKm * aKm * aKm)); // rad/s
  const rate =
    -1.5 * n * J2 * Math.pow(RE / p, 2) * Math.cos((inclDeg * Math.PI) / 180);
  return (rate * 86400 * 180) / Math.PI;
}

/**
 * Remove the sampled cloud's residual momentum.
 *
 * Isotropic sampling only conserves momentum in expectation; a finite draw
 * always leaves the cloud drifting slightly. Subtracting the mass-weighted mean
 * Δv makes conservation exact for the cloud we actually simulate, rather than
 * for the one we would get with infinite fragments. The residual removed is
 * reported, because if it is large the sample was too small to trust.
 */
export function enforceMomentumConservation(
  fragments: { mass: number; dv: Vec3 }[],
): { residualMs: number } {
  let mTot = 0;
  let px = 0;
  let py = 0;
  let pz = 0;
  for (const f of fragments) {
    mTot += f.mass;
    px += f.mass * f.dv.x;
    py += f.mass * f.dv.y;
    pz += f.mass * f.dv.z;
  }
  if (!(mTot > 0)) return { residualMs: 0 };
  const bias: Vec3 = { x: px / mTot, y: py / mTot, z: pz / mTot };
  for (const f of fragments) {
    f.dv.x -= bias.x;
    f.dv.y -= bias.y;
    f.dv.z -= bias.z;
  }
  return { residualMs: mag(bias) };
}
