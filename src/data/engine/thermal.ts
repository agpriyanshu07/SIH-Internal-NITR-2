import { density, scaleHeight } from './decay';

/**
 * Re-entry heating and demise.
 *
 * The question this answers is the one that decides whether "where does it
 * fall" is even a meaningful question for a given fragment. Most debris does
 * not reach the ground: it is destroyed by aerodynamic heating somewhere around
 * 65-80 km, and only dense, compact or refractory pieces survive. A re-entry
 * casualty assessment that skipped this step would overstate ground risk by
 * one to two orders of magnitude.
 *
 * METHOD, and its limits, stated plainly.
 *
 * Trajectory: the Allen-Eggers analytic solution for a shallow ballistic
 * entry, which gives velocity as a function of altitude in closed form for a
 * constant ballistic coefficient and an exponential atmosphere.
 *
 * Heating: Sutton-Graves stagnation-point convective heat flux,
 *
 *     q = k · sqrt(rho / R_n) · V³            [W/m²],  k = 1.7415e-4 for air
 *
 * the standard engineering correlation, integrated down the trajectory to a
 * total heat load. It puts peak heating in the megawatts per square metre
 * around 70-80 km, which is where it belongs — a formulation that produces
 * kilowatts there has its constant wrong and will report that nothing ever
 * demises.
 *
 * Flow regime: Sutton-Graves is a CONTINUUM correlation and does not hold in
 * the rarefied flow high up, where the mean free path is comparable to the
 * body. Both regimes are therefore computed — free-molecular
 * q = ½·alpha·rho·V³ above, Sutton-Graves below — and combined harmonically,
 *
 *     q = q_fm · q_cont / (q_fm + q_cont)
 *
 * which tends to whichever is smaller and transitions smoothly with no
 * arbitrary altitude band. This detail is not cosmetic. Suppressing the
 * free-molecular contribution instead — by ramping heating to zero above some
 * altitude — deletes precisely the heat that LIGHT, high-area fragments
 * experience, because they decelerate high up and never reach continuum flow at
 * speed. That inverts the model's central result: it makes compact heavy
 * fragments demise and light ones survive, when the standard scaling is that
 * heat absorbed per unit mass goes as sqrt(A/m) and high-area fragments demise
 * most readily.
 *
 * Averaging: stagnation-point flux is the peak at one point on the windward
 * face, not the average over the body. Debris tumbles, so the mean heating a
 * fragment actually sees is roughly a quarter of the stagnation value — the
 * standard sphere-average factor. Applying stagnation flux over the whole
 * frontal area, as an obvious first implementation does, over-predicts demise
 * badly and puts demise altitudes up near 90 km instead of the 65-80 km the
 * literature reports.
 *
 * Demise: a lumped-mass criterion. The fragment is treated as isothermal and
 * demised once the absorbed heat exceeds what is needed to raise it to its
 * melting point and melt it entirely. That is what NASA's DAS does at its
 * "object-level" fidelity, and it is deliberately less than ORSAT or SCARAB
 * do: no shape change, no ablation feedback, no internal conduction, no
 * fragment-of-a-fragment breakup. Treat the surviving/demising split as
 * indicative, not as a casualty assessment.
 *
 * CALIBRATION, stated rather than tuned away: demise altitudes from this model
 * come out somewhat higher than the 65-80 km that ORSAT and SCARAB report for
 * typical satellite components. The A/m dependence and the demise/survive
 * boundary near 0.15 m²/kg are the physically meaningful outputs and behave
 * correctly; the absolute demise altitude is not calibrated against flight data
 * and should not be quoted as though it were.
 *
 * One structural limitation worth knowing, because it bounds what varying the
 * material can tell you: the breakup model supplies each fragment's
 * area-to-mass ratio directly and says nothing about composition, so material
 * density does NOT feed back into fragment area here. Changing the material mix
 * therefore varies melt enthalpy alone. In reality a steel fragment of a given
 * mass is more compact than an aluminium one and survives partly for that
 * reason, and that second effect is absent.
 */

export interface Material {
  key: string;
  label: string;
  /** kg/m³ */
  density: number;
  /** Melting point, K. */
  meltK: number;
  /** Specific heat capacity, J/(kg·K). */
  cp: number;
  /** Latent heat of fusion, J/kg. */
  hFusion: number;
  /** Fraction of incident stagnation heating actually absorbed. */
  absorptivity: number;
  /** Where this shows up in a spacecraft. */
  note: string;
}

/**
 * The four materials that make up nearly all of a spacecraft by mass.
 *
 * Aluminium dominates structure and demises readily, which is why most debris
 * never lands. Titanium and steel are the survivors — pressure vessels,
 * reaction wheels, propellant tanks — and are what re-entry casualty studies
 * actually worry about.
 */
export const MATERIALS: Material[] = [
  {
    key: 'aluminium',
    label: 'Aluminium 6061',
    density: 2700,
    meltK: 933,
    cp: 896,
    hFusion: 397000,
    absorptivity: 0.6,
    note: 'Primary structure, panels, brackets. Demises readily.',
  },
  {
    key: 'titanium',
    label: 'Titanium Ti-6Al-4V',
    density: 4430,
    meltK: 1941,
    cp: 526,
    hFusion: 419000,
    absorptivity: 0.6,
    note: 'Pressure vessels and tanks. Frequently survives to the ground.',
  },
  {
    key: 'steel',
    label: 'Stainless steel 304',
    density: 8000,
    meltK: 1700,
    cp: 500,
    hFusion: 270000,
    absorptivity: 0.6,
    note: 'Fasteners, bearings, reaction wheels. Often survives.',
  },
  {
    key: 'cfrp',
    label: 'Carbon composite',
    density: 1600,
    meltK: 3800,
    cp: 1000,
    hFusion: 43000,
    absorptivity: 0.8,
    note: 'Panels and booms. Does not melt — chars and delaminates; modelled here by its ablation enthalpy.',
  },
];

export const materialByKey = (k: string): Material =>
  MATERIALS.find((m) => m.key === k) ?? MATERIALS[0];

/**
 * Representative material mix for spacecraft debris, by fragment count.
 *
 * ASSUMPTION. The breakup model says nothing about what a fragment is made of,
 * and the mix drives the survival fraction directly, so the research view
 * exposes it as an input rather than burying it.
 */
export const DEFAULT_MATERIAL_MIX: Record<string, number> = {
  aluminium: 0.62,
  titanium: 0.08,
  steel: 0.1,
  cfrp: 0.2,
};

export interface EntryResult {
  /** Total convective heat load absorbed, J/m². */
  heatLoadJm2: number;
  /** Peak stagnation heat flux, W/m². */
  peakFluxWm2: number;
  /** Altitude of peak heating, km. */
  peakAltKm: number;
  /** Energy needed to melt the fragment entirely, J. */
  meltEnergyJ: number;
  /** Absorbed energy over the fragment's frontal area, J. */
  absorbedJ: number;
  /** Fraction of the fragment melted. >= 1 means it demised. */
  meltFraction: number;
  demised: boolean;
  /** Altitude at which the melt criterion is met, km. Null when it survives. */
  demiseAltKm: number | null;
  /** Speed at 20 km, m/s. */
  speedAt20kmMs: number;
  /**
   * Terminal velocity at sea level, m/s — the speed a surviving fragment
   * actually lands at, where drag balances weight. This, not the entry speed,
   * is what determines whether a survivor is dangerous on the ground.
   */
  terminalMs: number;
}

/**
 * Sutton-Graves constant for Earth's atmosphere, SI.
 *
 * q = k·sqrt(rho/R_n)·V³ with rho in kg/m³, R_n in m, V in m/s gives W/m².
 */
export const SUTTON_GRAVES_K = 1.7415e-4;

/**
 * Mean-to-stagnation heating ratio for a randomly tumbling body.
 *
 * The sphere-average value. Without it the model applies peak stagnation flux
 * over the entire frontal area and demises nearly everything.
 */
export const TUMBLING_AVERAGE = 0.25;

/**
 * Thermal accommodation coefficient for free-molecular heating.
 *
 * The fraction of incident molecular kinetic energy transferred to the surface.
 * Close to unity for engineering surfaces at these speeds.
 */
export const ACCOMMODATION = 0.9;

/**
 * Heat flux in both flow regimes, harmonically bridged, W/m².
 *
 * Free-molecular above, continuum below, with no altitude constants: the
 * harmonic combination naturally selects whichever mechanism is limiting.
 */
function heatFlux(rho: number, v: number, noseR: number): number {
  const qFreeMolecular = 0.5 * ACCOMMODATION * rho * Math.pow(v, 3);
  const qContinuum = SUTTON_GRAVES_K * Math.sqrt(rho / noseR) * Math.pow(v, 3);
  const sum = qFreeMolecular + qContinuum;
  return sum > 0 ? (qFreeMolecular * qContinuum) / sum : 0;
}

/** Nose radius from frontal area, treating the fragment as an equivalent sphere. */
const noseRadius = (areaM2: number) => Math.max(0.005, Math.sqrt(areaM2 / Math.PI));

/**
 * Integrate a shallow ballistic entry from 120 km.
 *
 * `flightPathDeg` is the entry angle below local horizontal, defaulting to the
 * 0.1 degrees characteristic of natural orbital decay. It is shallow, and that
 * shallowness is the point: it keeps a fragment in the heat pulse for minutes
 * rather than seconds, which is why decaying debris demises where a steep
 * ballistic re-entry of the same object might not.
 */
export function simulateEntry(
  massKg: number,
  areaM2: number,
  material: Material,
  entrySpeedMs = 7800,
  flightPathDeg = 0.1,
  cd = 2.2,
): EntryResult {
  const beta = massKg / (cd * areaM2); // ballistic coefficient, kg/m²
  const rn = noseRadius(areaM2);
  const gamma = (flightPathDeg * Math.PI) / 180;
  const sinG = Math.max(Math.sin(gamma), 1e-4);

  const meltEnergyJ =
    massKg * (material.cp * Math.max(0, material.meltK - 300) + material.hFusion);

  let v = entrySpeedMs;
  let heat = 0;
  let absorbed = 0;
  let peakFlux = 0;
  let peakAlt = 120;
  let demiseAlt: number | null = null;

  const dh = 0.25; // km per step
  for (let h = 120; h > 20; h -= dh) {
    const rho = density(h);
    if (!(rho > 0)) continue;
    const H = scaleHeight(h) * 1000; // m

    // Allen-Eggers: dv/dh = (rho * v) / (2 * beta * sin(gamma)) with h decreasing.
    const dv = ((rho * v) / (2 * beta * sinG)) * (dh * 1000);
    // No artificial floor: a fragment that has bled off its orbital energy is
    // genuinely subsonic by 30 km, and clamping the speed would hide that by
    // keeping a fictitious heat flux alive all the way down.
    v = Math.max(1, v - dv);

    const q = heatFlux(rho, v, rn);
    if (q > peakFlux) {
      peakFlux = q;
      peakAlt = h;
    }

    // Time spent in this altitude slice.
    const dt = (dh * 1000) / Math.max(1, v * sinG);
    heat += q * dt;
    absorbed += q * TUMBLING_AVERAGE * dt * material.absorptivity * areaM2;

    if (demiseAlt === null && absorbed >= meltEnergyJ) demiseAlt = h;
    // Sanity guard for the exponential atmosphere at very low altitude.
    if (!Number.isFinite(v) || !Number.isFinite(heat) || H <= 0) break;
  }

  const meltFraction = meltEnergyJ > 0 ? absorbed / meltEnergyJ : Infinity;
  // Terminal velocity at sea level: sqrt(2*g*beta/rho).
  const terminalMs = Math.sqrt((2 * 9.80665 * beta) / 1.225);
  return {
    heatLoadJm2: heat,
    peakFluxWm2: peakFlux,
    peakAltKm: peakAlt,
    meltEnergyJ,
    absorbedJ: absorbed,
    meltFraction,
    demised: meltFraction >= 1,
    demiseAltKm: demiseAlt,
    speedAt20kmMs: v,
    terminalMs,
  };
}

/**
 * Casualty area for a set of surviving fragments, m².
 *
 * The published DAS form: each surviving fragment contributes
 * (sqrt(A) + 0.3)², where 0.3 m stands in for the radius of a person. Summed
 * over survivors it is the standard input to a ground-casualty expectation.
 */
export function casualtyArea(survivorAreasM2: number[]): number {
  return survivorAreasM2.reduce((s, a) => s + Math.pow(Math.sqrt(a) + 0.3, 2), 0);
}
