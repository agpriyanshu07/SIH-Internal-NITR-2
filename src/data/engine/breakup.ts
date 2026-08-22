/**
 * Collision consequence: the NASA Standard Breakup Model.
 *
 * Given two objects that actually hit, how many fragments result, how big, and
 * how fast do they leave? This is the published EVOLVE 4.0 / NASA SBM
 * formulation (Johnson et al., "NASA's New Breakup Model of EVOLVE 4.0",
 * Advances in Space Research 28(9), 2001) — the same model used to reconstruct
 * the Iridium 33 / Cosmos 2251 and Fengyun 1C clouds this catalogue is built
 * from. It is not a model of our own invention.
 *
 * SCOPE, stated because it bounds every number downstream: only fragments of
 * characteristic length >= 0.1 m are generated. That is the trackable
 * population — roughly what a ground radar network can catalogue, and what the
 * rest of this console screens. The real cloud contains orders of magnitude
 * more sub-centimetre debris that no catalogue carries and this tool cannot
 * screen.
 */

import { EARTH_RADIUS_KM } from '../orbital';
import type { SpaceObject } from '../types';

/** Smallest fragment modelled, metres. Trackable-population floor. */
export const MIN_FRAGMENT_M = 0.1;

/**
 * Representative masses, kg.
 *
 * ASSUMPTION, and a load-bearing one — fragment count scales as M^0.75, so the
 * mass estimate propagates straight into every figure this module produces. A
 * TLE carries no mass and the SATCAT is not in this snapshot, so these are
 * class representatives, not lookups. They are deliberately conservative.
 *
 * The UI states the assumed mass alongside the result, so a reader can see what
 * the answer rests on rather than having to trust it.
 */
export const ASSUMED_MASS_KG: Record<string, number> = {
  // ISS and CSS pressurised modules are the heaviest things in this catalogue.
  stations: 18000,
  // A typical ISRO LEO remote-sensing spacecraft.
  'indian-assets': 1100,
  // A tracked fragment at the catalogue's ~10 cm floor.
  'cosmos-1408-debris': 1.2,
  'iridium-33-debris': 1.2,
  'cosmos-2251-debris': 1.2,
};

export const assumedMass = (group: string | undefined): number =>
  (group && ASSUMED_MASS_KG[group]) || 500;

/**
 * Specific energy of the impact, J/g — the quantity that decides whether a
 * collision merely damages the target or destroys it completely.
 *
 * The 40 J/g threshold is the model's, not ours: above it the target is
 * fragmented entirely (catastrophic), below it only a crater's worth of mass is
 * liberated. It is why a 1 kg fragment at 14 km/s destroys a 1-tonne satellite
 * outright — 98 J/g — while the same fragment at 2 km/s does not.
 */
export function specificEnergy(
  massTargetKg: number,
  massProjectileKg: number,
  relVelKmS: number,
): number {
  const v = relVelKmS * 1000; // m/s
  return (0.5 * massProjectileKg * v * v) / massTargetKg / 1000; // J/g
}

export const CATASTROPHIC_THRESHOLD_JG = 40;

/**
 * Number of fragments with characteristic length >= Lc.
 *
 * N(Lc) = 0.1 * M^0.75 * Lc^-1.71, the collision form of the SBM power law.
 */
export function fragmentCount(effectiveMassKg: number, lcMetres: number): number {
  return 0.1 * Math.pow(effectiveMassKg, 0.75) * Math.pow(lcMetres, -1.71);
}

/** Cross-sectional area from characteristic length, m². SBM eq. */
function areaFromLc(lc: number): number {
  return lc < 0.00167
    ? 0.540424 * lc * lc
    : 0.556945 * Math.pow(lc, 2.0047077);
}

/** Piecewise-linear ramp used throughout the SBM's distribution parameters. */
const ramp = (x: number, x0: number, y0: number, x1: number, y1: number) =>
  x <= x0 ? y0 : x >= x1 ? y1 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);

/**
 * Area-to-mass distribution for spacecraft fragments larger than 11 cm.
 *
 * Bimodal in log10(A/M): the model carries two normal modes whose weights and
 * parameters vary with fragment size. The two modes are physically real — dense
 * structural fragments in one, light high-area pieces such as multi-layer
 * insulation and solar-array material in the other, and the second is what
 * decays fast.
 */
function chiParams(lambda: number) {
  return {
    alpha: ramp(lambda, -1.95, 0, 0.55, 1),
    mu1: ramp(lambda, -1.1, -0.6, 0, -0.95),
    sigma1: ramp(lambda, -1.3, 0.1, -0.3, 0.3),
    mu2: ramp(lambda, -0.7, -1.2, -0.1, -2.0),
    sigma2: ramp(lambda, -0.5, 0.5, -0.3, 0.3),
  };
}

/** Deterministic PRNG, so a given event always yields the same cloud. */
function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Box–Muller, for the model's normal distributions. */
function normal(rng: () => number, mu: number, sigma: number): number {
  const u = Math.max(rng(), 1e-12);
  const v = rng();
  return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export interface Fragment {
  /** Characteristic length, m. */
  lc: number;
  /** Mass, kg. */
  mass: number;
  /** Cross-sectional area, m². */
  area: number;
  /** Area-to-mass ratio, m²/kg — this is what decides how fast it decays. */
  aOverM: number;
  /** Ejection speed relative to the parent, m/s. */
  dvMs: number;
  /** Unit vector of the ejection, isotropic. */
  dir: [number, number, number];
}

export interface BreakupResult {
  catastrophic: boolean;
  specificEnergyJg: number;
  /** Mass entering the power law, kg. */
  effectiveMassKg: number;
  /** Modelled fragments >= MIN_FRAGMENT_M. */
  fragments: Fragment[];
  /** Total count the power law predicts at the 10 cm floor. */
  predictedCount: number;
  /** True when the cloud was sampled down rather than fully enumerated. */
  sampled: boolean;
  massTargetKg: number;
  massProjectileKg: number;
}

/** How many fragments to actually instantiate before sampling kicks in. */
const MAX_MODELLED = 4000;

export interface MassOverride {
  massAKg?: number;
  massBKg?: number;
}

export function modelBreakup(
  a: SpaceObject,
  b: SpaceObject,
  relVelKmS: number,
  groupA: string | undefined,
  groupB: string | undefined,
  masses: MassOverride = {},
): BreakupResult {
  // The heavier object is the target; the lighter one is the projectile.
  const mA = masses.massAKg ?? assumedMass(groupA);
  const mB = masses.massBKg ?? assumedMass(groupB);
  const massTargetKg = Math.max(mA, mB);
  const massProjectileKg = Math.min(mA, mB);

  const ep = specificEnergy(massTargetKg, massProjectileKg, relVelKmS);
  const catastrophic = ep >= CATASTROPHIC_THRESHOLD_JG;

  // Catastrophic collisions fragment both objects entirely. Below the
  // threshold only the projectile's kinetic contribution liberates mass.
  const effectiveMassKg = catastrophic
    ? massTargetKg + massProjectileKg
    : massProjectileKg * relVelKmS;

  const predictedCount = Math.max(
    0,
    Math.round(fragmentCount(effectiveMassKg, MIN_FRAGMENT_M)),
  );

  const modelled = Math.min(predictedCount, MAX_MODELLED);
  const sampled = predictedCount > MAX_MODELLED;

  // Seeded from the pair, so the same collision always produces the same cloud
  // — a demo that reshuffles its own debris on every reload is not evidence.
  const rng = makeRng((a.norad * 73856093) ^ (b.norad * 19349663));

  const fragments: Fragment[] = [];
  for (let i = 0; i < modelled; i++) {
    // Invert the power law to draw Lc: N(>Lc) ∝ Lc^-1.71.
    const u = Math.max(rng(), 1e-9);
    const lc = MIN_FRAGMENT_M * Math.pow(u, -1 / 1.71);
    // Nothing larger than the parent can come out of it.
    if (lc > 10) continue;

    const lambda = Math.log10(lc);
    const p = chiParams(lambda);
    const chi =
      rng() < p.alpha
        ? normal(rng, p.mu1, p.sigma1)
        : normal(rng, p.mu2, p.sigma2);
    const aOverM = Math.pow(10, chi);
    const area = areaFromLc(lc);
    const mass = area / aOverM;

    // Ejection speed: log10(dv) ~ N(0.9*chi + 2.9, 0.4), dv in m/s.
    const dvMs = Math.pow(10, normal(rng, 0.9 * chi + 2.9, 0.4));

    // Isotropic direction.
    const cosT = 2 * rng() - 1;
    const sinT = Math.sqrt(Math.max(0, 1 - cosT * cosT));
    const phi = 2 * Math.PI * rng();
    fragments.push({
      lc,
      mass,
      area,
      aOverM,
      dvMs,
      dir: [sinT * Math.cos(phi), sinT * Math.sin(phi), cosT],
    });
  }

  return {
    catastrophic,
    specificEnergyJg: ep,
    effectiveMassKg,
    fragments,
    predictedCount,
    sampled,
    massTargetKg,
    massProjectileKg,
  };
}

/** Altitude of a radius, km — used when binning the resulting cloud. */
export const altOf = (rKm: number) => rKm - EARTH_RADIUS_KM;
