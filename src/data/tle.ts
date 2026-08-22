import { meanMotion } from './orbital';

/** TLE line checksum: sum of digits, minus signs count as 1, modulo 10. */
function checksum(line: string): number {
  let s = 0;
  for (const c of line) {
    if (c >= '0' && c <= '9') s += +c;
    else if (c === '-') s += 1;
  }
  return s % 10;
}

/** `26234.51782528` — two-digit year plus fractional day of year. */
function epochField(ageDays: number, now: number): string {
  const d = new Date(now - ageDays * 86400000);
  const yy = String(d.getUTCFullYear() % 100).padStart(2, '0');
  const doy = Math.floor(
    (d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 0)) / 86400000,
  );
  const frac =
    (d.getUTCHours() * 3600 + d.getUTCMinutes() * 60 + d.getUTCSeconds()) / 86400;
  return yy + (doy + frac).toFixed(8).padStart(12, '0');
}

export interface TleSource {
  norad: number;
  intl: string;
  alt: number;
  ecc: number;
  incl: number;
  raan: number;
  argp: number;
  ma: number;
  age: number;
}

/**
 * Build a synthetic two-line element set in the real fixed-column layout.
 *
 * The column positions, field widths and checksums are genuine — the numbers
 * are not. A TLE parser would accept these; a propagator would produce an
 * orbit that does not correspond to any real object.
 */
export function synthesiseTle(o: TleSource, now: number): [string, string] {
  const id = String(o.norad).padStart(5, '0');

  const l1 =
    `1 ${id}U ${o.intl.padEnd(8, ' ')} ${epochField(o.age, now)}` +
    `  .00002182  00000-0  12345-4 0  999`;

  const revs = 20000 + (o.norad % 9000);
  const l2 =
    `2 ${id} ${o.incl.toFixed(4).padStart(8, ' ')} ${o.raan.toFixed(4).padStart(8, ' ')} ` +
    `${Math.round(o.ecc * 1e7).toString().padStart(7, '0')} ` +
    `${o.argp.toFixed(4).padStart(8, ' ')} ${o.ma.toFixed(4).padStart(8, ' ')} ` +
    `${meanMotion(o.alt).toFixed(8).padStart(11, ' ')}${String(revs).padStart(5, ' ')}`;

  return [l1 + checksum(l1), l2 + checksum(l2)];
}

/** Plain-language annotations for the catalogue drawer. */
export const TLE_FIELD_NOTES: { key: string; label: string; note: string }[] = [
  {
    key: 'norad',
    label: 'Catalogue number',
    note: "The object's permanent identifier in the public satellite catalogue.",
  },
  {
    key: 'intl',
    label: 'International designator',
    note: 'Launch year, the launch number within that year, and which piece of that launch this is.',
  },
  {
    key: 'epoch',
    label: 'Epoch',
    note: 'The instant these elements describe. Everything else is propagated forward from here, and accuracy decays as that gap widens.',
  },
  {
    key: 'incl',
    label: 'Inclination',
    note: 'Tilt of the orbit plane against the equator. Above 90° the object travels retrograde.',
  },
  {
    key: 'raan',
    label: 'Right ascension of ascending node',
    note: 'Where the orbit crosses the equator going north, measured against the vernal equinox.',
  },
  {
    key: 'ecc',
    label: 'Eccentricity',
    note: 'How far the orbit departs from a circle. Zero is circular.',
  },
  {
    key: 'argp',
    label: 'Argument of perigee',
    note: 'Angle from the ascending node round to the lowest point of the orbit.',
  },
  {
    key: 'ma',
    label: 'Mean anomaly',
    note: 'Where the object sits along its orbit at the epoch, as an angle from perigee.',
  },
  {
    key: 'mm',
    label: 'Mean motion',
    note: 'Revolutions completed per day. This is what fixes the orbit size, and so the altitude and period.',
  },
];
