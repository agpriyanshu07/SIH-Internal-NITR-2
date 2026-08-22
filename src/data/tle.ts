/**
 * Annotations for the catalogue's element-set drawer.
 *
 * This module used to also contain `synthesiseTle()`, which manufactured
 * fixed-column TLEs with genuine checksums around invented numbers. Every
 * element set in the app is now a real one read from the committed CelesTrak
 * snapshot, so the synthesiser has been deleted rather than left lying around
 * where it could be mistaken for a data source.
 */

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
