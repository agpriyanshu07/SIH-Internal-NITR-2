import * as satellite from 'satellite.js';
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
import type { CatalogueEntry } from './engine/parse';
import type { ResolvedConjunction } from './types';

/**
 * What happens after the collision.
 *
 * Chains three published models onto a real screened event: the NASA Standard
 * Breakup Model produces the fragment cloud, each fragment's ejection velocity
 * is added to the parent's real SGP4 state at the time of closest approach, and
 * King-Hele drag decay gives how long each stays up.
 *
 * The output is deliberately asymmetric in confidence, because the underlying
 * physics is. Fragment counts and orbital spreads are solid. Lifetimes are
 * order-of-magnitude. Re-entry longitude is not predictable at all, and this
 * module does not pretend otherwise — it returns a latitude distribution, which
 * is the part that genuinely is.
 */

const MU = 398600.4418;

export interface FragmentOrbit {
  perigee: number;
  apogee: number;
  incl: number;
  lifetimeDays: number;
  band: LifetimeBand;
  /** True when the ejection alone drops it straight into the atmosphere. */
  immediate: boolean;
}

export interface Consequence {
  breakup: BreakupResult;
  orbits: FragmentOrbit[];
  /** Fragment counts by lifetime band, in reporting order. */
  byBand: { band: LifetimeBand; count: number }[];
  /** Fragments still in orbit after 1, 10 and 100 years. */
  stillUp: { years: number; count: number }[];
  /** Fragments whose orbit crosses the 400–430 km band the ISS occupies. */
  crossingStationAltitude: number;
  /**
   * Perigee and apogee extremes across fragments that stay in orbit, km.
   * Excludes immediate re-entries: those have a perigee below the surface, and
   * quoting a negative altitude as the bottom of a range is meaningless.
   */
  altitudeSpread: { min: number; max: number };
  /** Fragments the ejection alone puts straight into the atmosphere. */
  immediateReentries: number;
  /** The hard bound on where any of it can come down, degrees. */
  reachableLatitudeDeg: number;
  latitudeDistribution: { lat: number; p: number }[];
  /** Highest-probability latitude band, degrees. */
  likeliestLatitude: number;
}

/** Classical elements from a state vector — only what the cloud summary needs. */
function elementsFrom(r: satellite.EciVec3<number>, v: satellite.EciVec3<number>) {
  const rMag = Math.hypot(r.x, r.y, r.z);
  const vMag = Math.hypot(v.x, v.y, v.z);
  const a = 1 / (2 / rMag - (vMag * vMag) / MU);

  // Angular momentum, for inclination.
  const hx = r.y * v.z - r.z * v.y;
  const hy = r.z * v.x - r.x * v.z;
  const hz = r.x * v.y - r.y * v.x;
  const h = Math.hypot(hx, hy, hz);
  const incl = (Math.acos(Math.max(-1, Math.min(1, hz / h))) * 180) / Math.PI;

  // Eccentricity vector.
  const rdotv = r.x * v.x + r.y * v.y + r.z * v.z;
  const c = vMag * vMag - MU / rMag;
  const ex = (c * r.x - rdotv * v.x) / MU;
  const ey = (c * r.y - rdotv * v.y) / MU;
  const ez = (c * r.z - rdotv * v.z) / MU;
  const e = Math.hypot(ex, ey, ez);

  return { a, e, incl };
}

export function analyseConsequence(
  event: ResolvedConjunction,
  A: CatalogueEntry,
  B: CatalogueEntry,
): Consequence | null {
  const breakup = modelBreakup(
    event.A,
    event.B,
    event.relv,
    A.group,
    B.group,
  );

  // Fragments leave from the collision point on the heavier object's orbit.
  const heavier = assumedMass(A.group) >= assumedMass(B.group) ? A : B;
  const pv = satellite.propagate(heavier.rec, new Date(event.tca));
  if (!pv?.position || !pv.velocity) return null;

  const orbits: FragmentOrbit[] = [];
  for (const f of breakup.fragments) {
    // Ejection velocity, m/s -> km/s, applied isotropically.
    const dv = f.dvMs / 1000;
    const v = {
      x: pv.velocity.x + dv * f.dir[0],
      y: pv.velocity.y + dv * f.dir[1],
      z: pv.velocity.z + dv * f.dir[2],
    };
    const { a, e, incl } = elementsFrom(pv.position, v);
    // Hyperbolic or degenerate results are not fragments in orbit.
    if (!(a > 0) || !Number.isFinite(a) || e >= 1) continue;

    const perigee = a * (1 - e) - EARTH_RADIUS_KM;
    const apogee = a * (1 + e) - EARTH_RADIUS_KM;
    const immediate = perigee <= REENTRY_ALT_KM;
    const life = immediate ? 0 : lifetimeDays(perigee, apogee, f.aOverM);

    orbits.push({
      perigee,
      apogee,
      incl,
      lifetimeDays: life,
      band: lifetimeBand(life),
      immediate,
    });
  }

  const BANDS: LifetimeBand[] = ['<1 y', '1–10 y', '10–100 y', '>100 y'];
  const byBand = BANDS.map((band) => ({
    band,
    count: orbits.filter((o) => o.band === band).length,
  }));

  const stillUp = [1, 10, 100].map((years) => ({
    years,
    count: orbits.filter((o) => o.lifetimeDays > years * 365.25).length,
  }));

  // The ISS band. A fragment counts if its orbit passes through it at all —
  // perigee below the top and apogee above the bottom. Immediate re-entries are
  // excluded: they sweep through the band once on the way down rather than
  // taking up residence in it.
  const crossingStationAltitude = orbits.filter(
    (o) => !o.immediate && o.perigee <= 430 && o.apogee >= 400,
  ).length;

  const surviving = orbits.filter((o) => !o.immediate);
  const alts = surviving.flatMap((o) => [o.perigee, o.apogee]);
  const altitudeSpread = {
    min: alts.length ? Math.min(...alts) : 0,
    max: alts.length ? Math.max(...alts) : 0,
  };
  const immediateReentries = orbits.length - surviving.length;

  // Inclination barely changes in a breakup — ejection speeds are metres per
  // second against an orbital speed of kilometres per second — so the parent's
  // inclination sets the latitude bound for essentially the whole cloud.
  const incl = event.A.incl;
  const latitudeDistribution = reentryLatitudeDistribution(incl, 24);
  const likeliest = latitudeDistribution.reduce((m, b) => (b.p > m.p ? b : m));

  return {
    breakup,
    orbits,
    byBand,
    stillUp,
    crossingStationAltitude,
    altitudeSpread,
    immediateReentries,
    reachableLatitudeDeg: reachableLatitude(incl),
    latitudeDistribution,
    likeliestLatitude: Math.abs(likeliest.lat),
  };
}
