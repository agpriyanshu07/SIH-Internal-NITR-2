/**
 * Cascade risk: what the debris cloud does to everything else.
 *
 * The breakup model says how many fragments a collision makes. This module
 * answers the question that actually matters — does that cloud measurably raise
 * the risk to the assets still flying, and by how much? Without it the
 * consequence analysis stops at "here are 1,400 new objects", which is a fact
 * without a consequence.
 *
 * METHOD, and why it is this one rather than a conjunction screen.
 *
 * The obvious approach is to propagate every fragment and screen it against the
 * catalogue. That is wrong here for a reason that is physical, not
 * computational: a fragment's along-track position is meaningless days after
 * the breakup. Its period is known, so it is known WHERE ROUND the orbit it
 * will be only until the accumulated period error wraps — a few weeks at most.
 * Screening for named close approaches months out would be inventing precision
 * that the model does not contain.
 *
 * What survives that objection is the orbit's SHAPE, which is stable. So this
 * uses the particle-in-a-box formulation from Kessler & Cour-Palais (1978) —
 * the paper this console is named after. Treat the spread cloud as a gas of
 * given spatial density and compute a collision rate:
 *
 *     rate = n · v_rel · A_c            [collisions per second]
 *
 * with n the fragment number density (km^-3), v_rel the mean relative speed
 * against the asset, and A_c the asset's cross-section (km²). This is the
 * standard basis of every debris-environment model (ORDEM, MASTER) and it gives
 * a rate rather than a schedule — which is exactly the honest answer.
 *
 * TIME WEIGHTING. A fragment on an eccentric orbit does not spend equal time at
 * every altitude; it lingers near apogee. Occupancy is therefore weighted by
 * dt ∝ r² dν, integrated over true anomaly, not by a naive perigee-apogee span.
 *
 * WHEN this applies. The gas picture needs the cloud spread around the Earth,
 * which differential nodal precession does over `shellFormationDays` — already
 * computed alongside this. Before then the debris is still a clump and the risk
 * is concentrated rather than diffuse, so these figures are a floor for the
 * first weeks, not an estimate.
 */

import { EARTH_RADIUS_KM } from '../orbital';
import type { FragmentOrbit } from '../consequence';
import type { SpaceObject } from '../types';

const MU = 398600.4418; // km³/s²
const SECONDS_PER_YEAR = 365.25 * 86400;

/** Altitude bin width for the density profile, km. */
export const SHELL_KM = 25;

/**
 * Representative cross-sections by catalogue size class, m².
 *
 * ASSUMED, like the masses in breakup.ts, and for the same reason: a TLE
 * carries no geometry. Collision rate is linear in this, so it scales the
 * answer directly and is surfaced in the UI rather than buried.
 */
export const CROSS_SECTION_M2: Record<SpaceObject['rcs'], number> = {
  LARGE: 100,
  MEDIUM: 10,
  SMALL: 1,
};

/**
 * Mean relative speed between an asset and a cloud that has spread uniformly in
 * right ascension, km/s.
 *
 * Two circular orbits whose planes differ by θ close at 2·v·sin(θ/2). Once the
 * cloud is spread the node difference is uniform over 2π, so the mean is taken
 * over that, with cos θ = cos i₁ cos i₂ + sin i₁ sin i₂ cos ΔΩ. Co-planar,
 * co-altitude objects genuinely do have a low closing speed — that is real
 * physics, not a modelling artefact, and it is why same-shell constellations are
 * safer against their own debris than against anybody else's.
 */
export function meanRelativeSpeed(inclADeg: number, inclBDeg: number, altKm: number): number {
  const v = Math.sqrt(MU / (EARTH_RADIUS_KM + altKm));
  const i1 = (inclADeg * Math.PI) / 180;
  const i2 = (inclBDeg * Math.PI) / 180;
  const STEPS = 180;
  let sum = 0;
  for (let k = 0; k < STEPS; k++) {
    const dOmega = (2 * Math.PI * k) / STEPS;
    const cosT = Math.cos(i1) * Math.cos(i2) + Math.sin(i1) * Math.sin(i2) * Math.cos(dOmega);
    sum += 2 * v * Math.sin(Math.acos(Math.max(-1, Math.min(1, cosT))) / 2);
  }
  return sum / STEPS;
}

/**
 * Fraction of one orbit spent between two altitudes.
 *
 * Sampled in true anomaly and weighted by r², which is proportional to dt for a
 * Keplerian orbit (equal areas in equal times). Returns 0 when the shell lies
 * outside the orbit entirely.
 */
export function timeFractionInShell(
  perigeeAltKm: number,
  apogeeAltKm: number,
  shellLoKm: number,
  shellHiKm: number,
): number {
  if (apogeeAltKm < shellLoKm || perigeeAltKm > shellHiKm) return 0;
  const rp = perigeeAltKm + EARTH_RADIUS_KM;
  const ra = apogeeAltKm + EARTH_RADIUS_KM;
  const a = (rp + ra) / 2;
  const e = (ra - rp) / (ra + rp);
  const STEPS = 360;
  let inside = 0;
  let total = 0;
  for (let k = 0; k < STEPS; k++) {
    const nu = (2 * Math.PI * k) / STEPS;
    const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu));
    const w = r * r; // dt ∝ r² dν
    total += w;
    const alt = r - EARTH_RADIUS_KM;
    if (alt >= shellLoKm && alt <= shellHiKm) inside += w;
  }
  return total > 0 ? inside / total : 0;
}

export interface Shell {
  /** Shell centre altitude, km. */
  altKm: number;
  /** Time-weighted fragment count resident in this shell. */
  fragments: number;
  volumeKm3: number;
  /** Fragments per km³. */
  density: number;
}

/** Volume of a spherical shell between two altitudes, km³. */
function shellVolume(loKm: number, hiKm: number): number {
  const r1 = loKm + EARTH_RADIUS_KM;
  const r2 = hiKm + EARTH_RADIUS_KM;
  return (4 / 3) * Math.PI * (r2 * r2 * r2 - r1 * r1 * r1);
}

/**
 * Spatial density profile of the cloud, by altitude shell.
 *
 * Only fragments that stay up are counted — anything whose perigee is already
 * in the atmosphere is on its way down and does not contribute to a standing
 * environment.
 */
export function densityProfile(fragments: FragmentOrbit[], scale = 1): Shell[] {
  const live = fragments.filter((f) => !f.immediate);
  if (!live.length) return [];

  const maxAlt = Math.max(...live.map((f) => f.apogee));
  const minAlt = Math.max(0, Math.min(...live.map((f) => f.perigee)));
  const lo = Math.floor(minAlt / SHELL_KM) * SHELL_KM;
  const hi = Math.ceil(maxAlt / SHELL_KM) * SHELL_KM;

  const shells: Shell[] = [];
  for (let base = lo; base < hi; base += SHELL_KM) {
    let count = 0;
    for (const f of live) count += timeFractionInShell(f.perigee, f.apogee, base, base + SHELL_KM);
    const volumeKm3 = shellVolume(base, base + SHELL_KM);
    shells.push({
      altKm: base + SHELL_KM / 2,
      fragments: count * scale,
      volumeKm3,
      density: (count * scale) / volumeKm3,
    });
  }
  return shells;
}

/** Density this cloud adds at one altitude, fragments per km³. */
export function densityAt(shells: Shell[], altKm: number): number {
  const s = shells.find((x) => Math.abs(x.altKm - altKm) <= SHELL_KM / 2);
  return s ? s.density : 0;
}

export interface AssetRisk {
  norad: number;
  name: string;
  altKm: number;
  inclDeg: number;
  crossSectionM2: number;
  /** Added fragment density at this asset's altitude, per km³. */
  addedDensity: number;
  /** Mean closing speed against the spread cloud, km/s. */
  relSpeedKmS: number;
  /** Added collision rate, per year. */
  ratePerYear: number;
  /** Probability of at least one strike in ten years, from the added cloud. */
  probability10y: number;
  /** Mean interval between strikes at this rate, years. Infinite when rate is 0. */
  meanIntervalYears: number;
}

/**
 * Added collision risk this cloud imposes on a set of assets.
 *
 * Reports the INCREMENT from this one breakup, not total environmental risk —
 * the pre-existing background is a separate and much larger number. The
 * increment is the honest way to attribute consequence to a single event.
 */
export function assetRisk(
  shells: Shell[],
  assets: SpaceObject[],
  cloudInclDeg: number,
): AssetRisk[] {
  return assets
    .map((o) => {
      const addedDensity = densityAt(shells, o.alt);
      const relSpeedKmS = meanRelativeSpeed(o.incl, cloudInclDeg, o.alt);
      const areaKm2 = CROSS_SECTION_M2[o.rcs] * 1e-6; // m² -> km²
      // rate = n · v · A   [km^-3 · km/s · km² = s^-1]
      const ratePerSec = addedDensity * relSpeedKmS * areaKm2;
      const ratePerYear = ratePerSec * SECONDS_PER_YEAR;
      return {
        norad: o.norad,
        name: o.name,
        altKm: o.alt,
        inclDeg: o.incl,
        crossSectionM2: CROSS_SECTION_M2[o.rcs],
        addedDensity,
        relSpeedKmS,
        ratePerYear,
        probability10y: 1 - Math.exp(-ratePerYear * 10),
        meanIntervalYears: ratePerYear > 0 ? 1 / ratePerYear : Infinity,
      };
    })
    .sort((a, b) => b.ratePerYear - a.ratePerYear);
}

export interface CascadeResult {
  shells: Shell[];
  peakShell: Shell | null;
  assets: AssetRisk[];
  /** Assets sitting in a shell this cloud actually occupies. */
  assetsExposed: number;
  /** Sum of added per-year rates across all assessed assets. */
  totalRatePerYear: number;
  /** Fragments modelled vs predicted, so a sampled cloud can be scaled up. */
  scale: number;
}

/**
 * Full cascade assessment.
 *
 * `scale` corrects for the breakup model instantiating at most a few thousand
 * fragments when the power law predicts more; densities are scaled to the
 * predicted population so the answer describes the real cloud rather than the
 * sample.
 */
export function assessCascade(
  fragments: FragmentOrbit[],
  predictedCount: number,
  assets: SpaceObject[],
  cloudInclDeg: number,
): CascadeResult {
  const scale = fragments.length > 0 ? Math.max(1, predictedCount / fragments.length) : 1;
  const shells = densityProfile(fragments, scale);
  const risks = assetRisk(shells, assets, cloudInclDeg);
  const peakShell = shells.reduce<Shell | null>(
    (best, s) => (!best || s.density > best.density ? s : best),
    null,
  );
  return {
    shells,
    peakShell,
    assets: risks,
    assetsExposed: risks.filter((r) => r.addedDensity > 0).length,
    totalRatePerYear: risks.reduce((s, r) => s + r.ratePerYear, 0),
    scale,
  };
}
