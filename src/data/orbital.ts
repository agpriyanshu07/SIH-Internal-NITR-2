/**
 * Orbital arithmetic.
 *
 * This is closed-form two-body geometry only — enough to make altitudes,
 * periods and element sets internally consistent. There is no SGP4 here and no
 * propagation of real ephemerides; see README.
 */

export const EARTH_RADIUS_KM = 6378.137;
const MU = 398600.4418; // km³/s², Earth's standard gravitational parameter

/** Mean motion in revolutions per day, from mean altitude in km. */
export function meanMotion(altKm: number): number {
  const a = EARTH_RADIUS_KM + altKm;
  return 86400 / (2 * Math.PI * Math.sqrt((a * a * a) / MU));
}

/** Orbital period in minutes. */
export const periodMinutes = (altKm: number) => 1440 / meanMotion(altKm);

/** Circular-orbit speed in km/s — used for plausible relative velocities. */
export const orbitalSpeed = (altKm: number) => Math.sqrt(MU / (EARTH_RADIUS_KM + altKm));

export const apogee = (altKm: number, ecc: number) =>
  Math.round(altKm + ecc * (EARTH_RADIUS_KM + altKm));

export const perigee = (altKm: number, ecc: number) =>
  Math.round(altKm - ecc * (EARTH_RADIUS_KM + altKm));

/**
 * Closing speed for two circular orbits whose planes differ by `angleDeg`.
 * Both objects move at roughly orbital speed, so the relative velocity is the
 * base of an isosceles triangle: 2·v·sin(θ/2).
 */
export function relativeVelocity(altA: number, altB: number, angleDeg: number): number {
  const v = (orbitalSpeed(altA) + orbitalSpeed(altB)) / 2;
  return 2 * v * Math.sin((angleDeg * Math.PI) / 360);
}
