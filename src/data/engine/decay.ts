/**
 * Orbital decay and where the debris comes down.
 *
 * Two questions, with very different answerability, and the difference is the
 * point of this module.
 *
 * HOW LONG until a fragment re-enters is estimable to an order of magnitude
 * from its ballistic coefficient and perigee. Not better than that: drag
 * depends on atmospheric density, which varies by more than an order of
 * magnitude over the eleven-year solar cycle, and we are not modelling solar
 * activity. So lifetimes are reported in decade bands, never as dates.
 *
 * WHERE it comes down is not predictable at all in longitude, and it is
 * important to say so rather than draw a convincing dot on a map. A re-entry
 * prediction carries roughly +/-10-20% error on the remaining lifetime; applied
 * to the last orbit that is many minutes of uncertainty, and an object moving at
 * 7.7 km/s covers a quarter of the planet in ten minutes. Nobody — not this
 * tool, not an operational conjunction centre — can tell you the country.
 *
 * What IS rigorously knowable is the LATITUDE. An orbit of inclination i never
 * goes beyond +/-i, and within that band the time it spends at each latitude
 * follows a closed form. That is a real prediction with a real distribution,
 * and it is what this module returns.
 */

import { EARTH_RADIUS_KM } from '../orbital';

const MU = 398600.4418; // km³/s²

/** Altitude at which an object is considered to have re-entered, km. */
export const REENTRY_ALT_KM = 100;

/**
 * Piecewise-exponential atmosphere, kg/m³.
 *
 * Base altitudes, densities and scale heights from the standard tabulation
 * (Vallado, Fundamentals of Astrodynamics, exponential atmosphere model). Crude
 * next to NRLMSISE-00, and crude in the specific way that matters: it carries no
 * solar activity, no diurnal bulge and no geomagnetic response, each of which
 * moves density at these altitudes by a large factor.
 */
const ATM: [alt: number, rho0: number, H: number][] = [
  [0, 1.225, 7.249], [25, 3.899e-2, 6.349], [30, 1.774e-2, 6.682],
  [40, 3.972e-3, 7.554], [50, 1.057e-3, 8.382], [60, 3.206e-4, 7.714],
  [70, 8.77e-5, 6.549], [80, 1.905e-5, 5.799], [90, 3.396e-6, 5.382],
  [100, 5.297e-7, 5.877], [110, 9.661e-8, 7.263], [120, 2.438e-8, 9.473],
  [130, 8.484e-9, 12.636], [140, 3.845e-9, 16.149], [150, 2.07e-9, 22.523],
  [180, 5.464e-10, 29.74], [200, 2.789e-10, 37.105], [250, 7.248e-11, 45.546],
  [300, 2.418e-11, 53.628], [350, 9.518e-12, 53.298], [400, 3.725e-12, 58.515],
  [450, 1.585e-12, 60.828], [500, 6.967e-13, 63.822], [600, 1.454e-13, 71.835],
  [700, 3.614e-14, 88.667], [800, 1.17e-14, 124.64], [900, 5.245e-15, 181.05],
  [1000, 3.019e-15, 268.0],
];

/** Local scale height from the same table, km. */
export function scaleHeight(altKm: number): number {
  if (altKm <= 0) return ATM[0][2];
  let i = ATM.length - 1;
  for (let k = 0; k < ATM.length; k++) {
    if (ATM[k][0] > altKm) {
      i = k - 1;
      break;
    }
  }
  return ATM[Math.max(0, i)][2];
}

export function density(altKm: number): number {
  if (altKm < 0) return ATM[0][1];
  if (altKm > 1100) return 0;
  let i = ATM.length - 1;
  for (let k = 0; k < ATM.length; k++) {
    if (ATM[k][0] > altKm) {
      i = k - 1;
      break;
    }
  }
  const [h0, rho0, H] = ATM[Math.max(0, i)];
  return rho0 * Math.exp(-(altKm - h0) / H);
}

/**
 * Modified Bessel functions I0 and I1, scaled by exp(-z).
 *
 * Scaled deliberately: King-Hele's decay equations contain exp(-z)*I_n(z), and
 * for the eccentric orbits a breakup produces z runs into the hundreds, where
 * exp(-z) underflows and I_n(z) overflows. Computing the product directly keeps
 * the whole range usable. Polynomial approximations from Abramowitz & Stegun
 * 9.8.1-9.8.4.
 */
function besselI0Scaled(z: number): number {
  const t = z / 3.75;
  if (z < 3.75) {
    const y = t * t;
    const i0 =
      1 + y * (3.5156229 + y * (3.0899424 + y * (1.2067492 +
        y * (0.2659732 + y * (0.0360768 + y * 0.0045813)))));
    return i0 * Math.exp(-z);
  }
  const y = 1 / t;
  return (
    (0.39894228 + y * (0.01328592 + y * (0.00225319 + y * (-0.00157565 +
      y * (0.00916281 + y * (-0.02057706 + y * (0.02635537 +
        y * (-0.01647633 + y * 0.00392377)))))))) / Math.sqrt(z)
  );
}

function besselI1Scaled(z: number): number {
  const t = z / 3.75;
  if (z < 3.75) {
    const y = t * t;
    const i1 =
      z * (0.5 + y * (0.87890594 + y * (0.51498869 + y * (0.15084934 +
        y * (0.02658733 + y * (0.00301532 + y * 0.00032411))))));
    return i1 * Math.exp(-z);
  }
  const y = 1 / t;
  return (
    (0.39894228 + y * (-0.03988024 + y * (-0.00362018 + y * (0.00163801 +
      y * (-0.01031555 + y * (0.02282967 + y * (-0.02895312 +
        y * (0.01787654 + y * -0.00420059)))))))) / Math.sqrt(z)
  );
}

/**
 * Orbital lifetime by King-Hele drag decay, in days.
 *
 * The standard semi-analytical treatment: drag acts almost entirely around
 * perigee, so each revolution removes a slice of energy that lowers apogee and
 * circularises the orbit. Per revolution,
 *
 *     da = -2*pi*B*rho_p*a^2 * exp(-z) * [I0(z) + 2e*I1(z)]
 *     de = -2*pi*B*rho_p*a   * exp(-z) * [I1(z) + (e/2)*(I0(z) + I2(z))]
 *
 * with B = Cd*(A/m) the ballistic coefficient and z = a*e/H. Integrated with an
 * adaptive number of revolutions per step so a 100-year lifetime does not
 * require 500,000 iterations.
 *
 * Cd of 2.2 is conventional for free-molecular flow on an irregular tumbling
 * body. Returns Infinity when the orbit does not decay inside the cap.
 *
 * ACCURACY: order of magnitude, no better, and the limit is the atmosphere
 * rather than the integrator. Density at these altitudes swings by more than a
 * factor of ten across the solar cycle, which this model does not carry — so
 * results are reported in bands, never as dates.
 */
export function lifetimeDays(
  perigeeKm: number,
  apogeeKm: number,
  aOverM: number,
  cd = 2.2,
  capDays = 200 * 365.25,
): number {
  const RE = EARTH_RADIUS_KM;
  let rp = RE + perigeeKm;
  let ra = RE + Math.max(apogeeKm, perigeeKm);
  if (rp <= RE + REENTRY_ALT_KM) return 0;
  if (!(aOverM > 0)) return Infinity;

  const B = cd * aOverM; // m²/kg
  let days = 0;

  for (let iter = 0; iter < 20000; iter++) {
    let a = (rp + ra) / 2;
    let e = Math.max(0, (ra - rp) / (ra + rp));
    const altP = rp - RE;
    if (altP <= REENTRY_ALT_KM) return days;

    const rho = density(altP);
    if (!(rho > 0)) return Infinity;

    // Local scale height from the tabulated atmosphere, km.
    const H = scaleHeight(altP);
    const z = (a * e) / H;

    const i0 = besselI0Scaled(z);
    const i1 = besselI1Scaled(z);
    // I2 from the recurrence I2 = I0 - (2/z) I1, valid for the scaled forms too.
    const i2 = z > 1e-8 ? i0 - (2 / z) * i1 : 0;

    // Work in metres for the drag terms, then convert back.
    const aM = a * 1000;
    const daRev = -2 * Math.PI * B * rho * aM * aM * (i0 + 2 * e * i1); // m
    const deRev = -2 * Math.PI * B * rho * aM * (i1 + (e / 2) * (i0 + i2)); // -

    const periodDays = (2 * Math.PI * Math.sqrt((a * a * a) / MU)) / 86400;
    if (!(Math.abs(daRev) > 0)) return Infinity;

    // Adaptive: take enough revolutions to move the semi-major axis by ~1 km,
    // but never so many that we overshoot re-entry inside a single step.
    const revs = Math.max(1, Math.min(20000, Math.floor(1000 / Math.abs(daRev))));

    a += (daRev * revs) / 1000; // km
    e = Math.max(0, e + deRev * revs);
    days += periodDays * revs;

    rp = a * (1 - e);
    ra = a * (1 + e);
    if (days > capDays) return Infinity;
    if (!(a > 0) || !Number.isFinite(a)) return Infinity;
  }
  return Infinity;
}

/** Coarse, honest reporting bands for lifetime. */
export type LifetimeBand = '<1 y' | '1–10 y' | '10–100 y' | '>100 y';

export function lifetimeBand(days: number): LifetimeBand {
  const y = days / 365.25;
  if (y < 1) return '<1 y';
  if (y < 10) return '1–10 y';
  if (y < 100) return '10–100 y';
  return '>100 y';
}

/**
 * Probability density of the sub-satellite latitude, for an orbit of
 * inclination i.
 *
 *     p(phi) ∝ cos(phi) / sqrt(sin²i - sin²phi)
 *
 * This is exact for a circular orbit over a non-rotating Earth, and it says
 * something counter-intuitive and true: an object spends the LEAST time over
 * the equator and the MOST near its turning latitudes, where its motion is
 * momentarily parallel to a line of latitude. A polar-ish debris cloud is
 * therefore most likely to come down near the poles, not spread evenly.
 *
 * Returns normalised bin probabilities over [-90, 90].
 */
export function reentryLatitudeDistribution(
  inclinationDeg: number,
  bins = 36,
): { lat: number; p: number }[] {
  const i = (Math.min(inclinationDeg, 180 - inclinationDeg) * Math.PI) / 180;
  const sinI = Math.sin(i);
  const out: { lat: number; p: number }[] = [];
  let total = 0;

  for (let k = 0; k < bins; k++) {
    const latLo = -90 + (180 * k) / bins;
    const latHi = -90 + (180 * (k + 1)) / bins;
    const mid = ((latLo + latHi) / 2) * (Math.PI / 180);
    const s = Math.sin(mid);
    // Outside the reachable band the density is exactly zero — a hard bound,
    // not a small number.
    let p = 0;
    if (Math.abs(s) < sinI) {
      p = Math.cos(mid) / Math.sqrt(sinI * sinI - s * s);
    }
    if (!Number.isFinite(p)) p = 0;
    out.push({ lat: (latLo + latHi) / 2, p });
    total += p;
  }
  return out.map((b) => ({ ...b, p: total > 0 ? b.p / total : 0 }));
}

/** The hard geometric bound: nothing re-enters outside +/- this latitude. */
export const reachableLatitude = (inclinationDeg: number) =>
  Math.min(inclinationDeg, 180 - inclinationDeg);
