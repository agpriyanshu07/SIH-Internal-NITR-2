import { EARTH_RADIUS_KM } from '../data/orbital';

/**
 * A fixed-angle 3/4 projection of circular orbits, used by both the landing
 * hero and the orbital viewer.
 *
 * This is on purpose not a 3D engine. Orbits are treated as circles in their
 * own plane, rotated by inclination and RAAN, then tilted towards the viewer
 * and projected orthographically. It costs a few hundred sin/cos per frame and
 * reads convincingly at a glance, which is the whole requirement.
 */

export const VIEW_TILT = 0.42;

export interface Projected {
  x: number;
  y: number;
  /** Depth: positive is in front of Earth, negative is behind it. */
  z: number;
}

export interface OrbitParams {
  /** Mean altitude, km. */
  alt: number;
  incl: number;
  raan: number;
  /** Phase along the orbit at t=0, radians. */
  phase: number;
}

/**
 * Position of an object at true anomaly `theta`, in screen space.
 *
 * `scale` maps one Earth radius to pixels; `spin` slowly rotates the whole
 * scene so the picture is never static.
 */
export function projectOrbitPoint(
  o: OrbitParams,
  theta: number,
  cx: number,
  cy: number,
  scale: number,
  spin: number,
): Projected {
  const r = (EARTH_RADIUS_KM + o.alt) / EARTH_RADIUS_KM;
  const i = (o.incl * Math.PI) / 180;
  const node = (o.raan * Math.PI) / 180 + spin;

  // In-plane circle.
  const px = Math.cos(theta) * r;
  const py = Math.sin(theta) * r * Math.cos(i);
  const pz = Math.sin(theta) * r * Math.sin(i);

  // Rotate the ascending node about the polar axis.
  const xr = px * Math.cos(node) - pz * Math.sin(node);
  const zr = px * Math.sin(node) + pz * Math.cos(node);

  // Tilt towards the viewer.
  const y2 = py * Math.cos(VIEW_TILT) - zr * Math.sin(VIEW_TILT);
  const z2 = py * Math.sin(VIEW_TILT) + zr * Math.cos(VIEW_TILT);

  return { x: cx + xr * scale, y: cy - y2 * scale, z: z2 };
}

/** Angular rate in rad/s of simulated time, from the orbital period. */
export const angularRate = (periodMinutes: number) => (2 * Math.PI) / (periodMinutes * 60);

/** A point on the Earth's surface graticule. */
export function projectGlobe(
  lat: number,
  lon: number,
  cx: number,
  cy: number,
  scale: number,
  spin: number,
): Projected {
  const x = Math.cos(lat) * Math.cos(lon + spin);
  const y = Math.sin(lat);
  const z = Math.cos(lat) * Math.sin(lon + spin);
  const y2 = y * Math.cos(VIEW_TILT) - z * Math.sin(VIEW_TILT);
  const z2 = y * Math.sin(VIEW_TILT) + z * Math.cos(VIEW_TILT);
  return { x: cx + x * scale, y: cy - y2 * scale, z: z2 };
}

/** Reads the current theme's palette off the document. */
export function palette() {
  const cs = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) =>
    cs.getPropertyValue(name).trim() || fallback;
  return {
    line: v('--hairline', '#232E3C'),
    soft: v('--hairline-soft', '#1B2431'),
    t1: v('--t1', '#E4EAF0'),
    t2: v('--t2', '#93A3B5'),
    t3: v('--t3', '#5E7286'),
    accent: v('--accent', '#E8853A'),
    critical: v('--risk-critical', '#C0453A'),
    nominal: v('--risk-nominal', '#4A5B6E'),
    globe: v('--globe', '#080D16'),
  };
}
