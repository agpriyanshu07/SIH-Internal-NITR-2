import { EARTH_RADIUS_KM } from './orbital';
import { modelBreakup, assumedMass, type BreakupResult } from './engine/breakup';
import {
  lifetimeBand,
  lifetimeDays,
  reachableLatitude,
  reentryLatitudeDistribution,
  REENTRY_ALT_KM,
  type LifetimeBand,
} from './engine/decay';
import {
  enforceMomentumConservation,
  impactGeometry,
  nodalPrecessionDegPerDay,
  type ImpactGeometry,
} from './engine/impact';
import {
  casualtyArea,
  DEFAULT_MATERIAL_MIX,
  materialByKey,
  simulateEntry,
  type EntryResult,
} from './engine/thermal';
import type { Vec3 } from './engine/twobody';
import type { CatalogueEntry } from './engine/parse';
import type { ResolvedConjunction } from './types';

/**
 * End-to-end consequence analysis.
 *
 * Impact mechanics in the centre-of-mass frame, the NASA Standard Breakup
 * Model, momentum-conserving ejection onto the parents' real SGP4 states,
 * King-Hele orbital decay, and Sutton-Graves re-entry heating — chained onto a
 * real screened conjunction.
 *
 * Every assumption that materially moves the answer is an INPUT rather than a
 * constant, so the analysis can be swept rather than merely believed. That is
 * the difference between a demo number and a research tool.
 */

const MU = 398600.4418;

export interface ConsequenceOptions {
  /** Override the class-assumed masses, kg. */
  massTargetKg?: number;
  massProjectileKg?: number;
  /** Fragment material mix by count; keys from MATERIALS. */
  materialMix?: Record<string, number>;
  /** Drag coefficient used for both decay and entry. */
  cd?: number;
  /**
   * Multiplier on atmospheric density, standing in for solar activity.
   * Density at these altitudes varies by more than 10x over the solar cycle,
   * so 0.3 and 3 bracket solar minimum and maximum respectably.
   */
  solarActivity?: number;
  /** Entry flight-path angle below local horizontal, degrees. */
  entryAngleDeg?: number;
}

export interface FragmentOrbit {
  lc: number;
  mass: number;
  area: number;
  aOverM: number;
  dvMs: number;
  material: string;
  perigee: number;
  apogee: number;
  incl: number;
  /** Nodal precession, deg/day — what spreads the cloud into a shell. */
  nodalDegPerDay: number;
  lifetimeDays: number;
  band: LifetimeBand;
  immediate: boolean;
  entry: EntryResult;
  /** Survives re-entry heating and reaches the ground. */
  survivesEntry: boolean;
}

export interface Consequence {
  impact: ImpactGeometry;
  breakup: BreakupResult;
  fragments: FragmentOrbit[];
  /** Residual cloud momentum removed to enforce conservation, m/s. */
  momentumResidualMs: number;
  /** Fraction of centre-of-mass impact energy that went into fragment motion. */
  energyIntoFragments: number;
  byBand: { band: LifetimeBand; count: number }[];
  stillUp: { years: number; count: number }[];
  crossingStationAltitude: number;
  altitudeSpread: { min: number; max: number };
  immediateReentries: number;
  /** Spread in nodal precession rate across the cloud, deg/day. */
  nodalSpreadDegPerDay: number;
  /** Days for differential precession to smear the cloud into a full shell. */
  shellFormationDays: number;
  /** Fragments surviving re-entry heating to reach the ground. */
  survivors: number;
  survivingMassKg: number;
  /** DAS casualty area of the survivors, m². */
  casualtyAreaM2: number;
  reachableLatitudeDeg: number;
  latitudeDistribution: { lat: number; p: number }[];
  likeliestLatitude: number;
}

function elementsFrom(r: Vec3, v: Vec3) {
  const rMag = Math.hypot(r.x, r.y, r.z);
  const vMag = Math.hypot(v.x, v.y, v.z);
  const a = 1 / (2 / rMag - (vMag * vMag) / MU);
  const hx = r.y * v.z - r.z * v.y;
  const hy = r.z * v.x - r.x * v.z;
  const hz = r.x * v.y - r.y * v.x;
  const h = Math.hypot(hx, hy, hz);
  const incl = (Math.acos(Math.max(-1, Math.min(1, hz / h))) * 180) / Math.PI;
  const rdotv = r.x * v.x + r.y * v.y + r.z * v.z;
  const c = vMag * vMag - MU / rMag;
  const e = Math.hypot(
    (c * r.x - rdotv * v.x) / MU,
    (c * r.y - rdotv * v.y) / MU,
    (c * r.z - rdotv * v.z) / MU,
  );
  return { a, e, incl };
}

/** Deterministic material assignment, so a fragment keeps its material. */
function pickMaterial(mix: Record<string, number>, u: number): string {
  const entries = Object.entries(mix);
  const total = entries.reduce((s, [, w]) => s + w, 0) || 1;
  let acc = 0;
  for (const [k, w] of entries) {
    acc += w / total;
    if (u <= acc) return k;
  }
  return entries[entries.length - 1]?.[0] ?? 'aluminium';
}

export function analyseConsequence(
  event: ResolvedConjunction,
  A: CatalogueEntry,
  B: CatalogueEntry,
  opts: ConsequenceOptions = {},
): Consequence | null {
  const mA = opts.massTargetKg ?? assumedMass(A.group);
  const mB = opts.massProjectileKg ?? assumedMass(B.group);
  const cd = opts.cd ?? 2.2;
  const solar = opts.solarActivity ?? 1;
  const entryAngle = opts.entryAngleDeg ?? 0.1;
  const mix = opts.materialMix ?? DEFAULT_MATERIAL_MIX;

  const impact = impactGeometry(A.rec, B.rec, event.tca, mA, mB);
  if (!impact) return null;

  const breakup = modelBreakup(event.A, event.B, impact.speed, A.group, B.group, {
    massAKg: mA,
    massBKg: mB,
  });

  /*
   * Where each fragment starts from — and this is the step that is easy to get
   * badly wrong.
   *
   * The tempting move is to launch the whole cloud from the pair's centre of
   * mass, since that is where the combined momentum goes. It is wrong, and
   * wrong in a way that quietly destroys the answer: for two comparable masses
   * meeting at a large angle, |v_cm| is far BELOW orbital speed — a 139 degree
   * encounter between equal masses leaves the centre of mass at about 2.6 km/s
   * — so every fragment is placed on a sub-orbital trajectory and the model
   * reports that the entire cloud de-orbits within the hour. Iridium 33 and
   * Cosmos 2251 met at 102 degrees with comparable masses, and produced
   * thousands of fragments still in orbit fifteen years later.
   *
   * The physics is that a hypervelocity breakup is not an inelastic merger.
   * Each body shatters, and its pieces largely keep ITS momentum. So the two
   * parents' debris clouds are modelled separately, each ejected isotropically
   * about its own parent's state. Total momentum is then conserved because the
   * A-fragments carry A's and the B-fragments carry B's, and the resulting
   * cloud is bimodal — which is what is actually observed.
   */
  const parents = [
    { r: impact.r1, v: impact.v1, mass: mA },
    { r: impact.r2, v: impact.v2, mass: mB },
  ];
  // Non-catastrophic: only the target is cratered, so all debris is its own.
  const targetIndex = mA >= mB ? 0 : 1;
  const shareA = mA / (mA + mB);

  const assign = breakup.fragments.map((_f, i) => {
    if (!breakup.catastrophic) return targetIndex;
    // Deterministic split in proportion to mass, using a low-discrepancy
    // sequence so a small cloud still splits close to the intended ratio.
    return ((i * 0.6180339887) % 1) < shareA ? 0 : 1;
  });

  const draws = breakup.fragments.map((f) => ({
    mass: f.mass,
    dv: {
      x: (f.dvMs / 1000) * f.dir[0],
      y: (f.dvMs / 1000) * f.dir[1],
      z: (f.dvMs / 1000) * f.dir[2],
    } as Vec3,
  }));

  // Conserve momentum within each parent's own sub-cloud, so neither parent's
  // debris inherits a spurious drift from the other's sampling.
  let residualMs = 0;
  for (const p of [0, 1]) {
    const subset = draws.filter((_d, i) => assign[i] === p);
    if (subset.length === 0) continue;
    const r = enforceMomentumConservation(subset);
    residualMs = Math.max(residualMs, r.residualMs);
  }

  let fragmentKineticJ = 0;
  const fragments: FragmentOrbit[] = [];

  for (let i = 0; i < breakup.fragments.length; i++) {
    const f = breakup.fragments[i];
    const dv = draws[i].dv;
    const dvMag = Math.hypot(dv.x, dv.y, dv.z) * 1000; // m/s
    fragmentKineticJ += 0.5 * f.mass * dvMag * dvMag;

    const parent = parents[assign[i]];
    const v: Vec3 = {
      x: parent.v.x + dv.x,
      y: parent.v.y + dv.y,
      z: parent.v.z + dv.z,
    };
    const { a, e, incl } = elementsFrom(parent.r, v);
    if (!(a > 0) || !Number.isFinite(a) || e >= 1) continue;

    const perigee = a * (1 - e) - EARTH_RADIUS_KM;
    const apogee = a * (1 + e) - EARTH_RADIUS_KM;
    const immediate = perigee <= REENTRY_ALT_KM;

    // Solar activity scales density, and therefore lifetime, directly.
    const life = immediate
      ? 0
      : lifetimeDays(perigee, apogee, f.aOverM * solar, cd);

    // Deterministic per-fragment material, from the fragment's own draw.
    const material = pickMaterial(mix, (i * 0.6180339887) % 1);
    const entry = simulateEntry(
      f.mass,
      f.area,
      materialByKey(material),
      7800,
      entryAngle,
      cd,
    );

    fragments.push({
      lc: f.lc,
      mass: f.mass,
      area: f.area,
      aOverM: f.aOverM,
      dvMs: dvMag,
      material,
      perigee,
      apogee,
      incl,
      nodalDegPerDay: nodalPrecessionDegPerDay(a, e, incl),
      lifetimeDays: life,
      band: lifetimeBand(life),
      immediate,
      entry,
      survivesEntry: !entry.demised,
    });
  }

  const BANDS: LifetimeBand[] = ['<1 y', '1–10 y', '10–100 y', '>100 y'];
  const byBand = BANDS.map((band) => ({
    band,
    count: fragments.filter((o) => o.band === band).length,
  }));
  const stillUp = [1, 10, 100].map((years) => ({
    years,
    count: fragments.filter((o) => o.lifetimeDays > years * 365.25).length,
  }));

  const surviving = fragments.filter((o) => !o.immediate);
  const alts = surviving.flatMap((o) => [o.perigee, o.apogee]);
  const altitudeSpread = {
    min: alts.length ? Math.min(...alts) : 0,
    max: alts.length ? Math.max(...alts) : 0,
  };

  const rates = surviving.map((o) => o.nodalDegPerDay);
  const nodalSpreadDegPerDay = rates.length
    ? Math.max(...rates) - Math.min(...rates)
    : 0;
  const shellFormationDays =
    nodalSpreadDegPerDay > 1e-9 ? 360 / nodalSpreadDegPerDay : Infinity;

  const survivorList = fragments.filter((o) => o.survivesEntry);
  const survivingMassKg = survivorList.reduce((s, o) => s + o.mass, 0);

  const incl = event.A.incl;
  const latitudeDistribution = reentryLatitudeDistribution(incl, 24);
  const likeliest = latitudeDistribution.reduce((m, b) => (b.p > m.p ? b : m));

  return {
    impact,
    breakup,
    fragments,
    momentumResidualMs: residualMs * 1000,
    energyIntoFragments:
      impact.energyCmJ > 0 ? fragmentKineticJ / impact.energyCmJ : 0,
    byBand,
    stillUp,
    crossingStationAltitude: fragments.filter(
      (o) => !o.immediate && o.perigee <= 430 && o.apogee >= 400,
    ).length,
    altitudeSpread,
    immediateReentries: fragments.length - surviving.length,
    nodalSpreadDegPerDay,
    shellFormationDays,
    survivors: survivorList.length,
    survivingMassKg,
    casualtyAreaM2: casualtyArea(survivorList.map((o) => o.area)),
    reachableLatitudeDeg: reachableLatitude(incl),
    latitudeDistribution,
    likeliestLatitude: Math.abs(likeliest.lat),
  };
}
