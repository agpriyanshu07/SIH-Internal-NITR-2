/**
 * Annotations for the catalogue's element-set drawer.
 *
 * This module used to also contain `synthesiseTle()`, which manufactured
 * fixed-column TLEs with genuine checksums around invented numbers. Every
 * element set in the app is now a real one read from the committed CelesTrak
 * snapshot, so the synthesiser has been deleted rather than left lying around
 * where it could be mistaken for a data source.
 */

/**
 * Which cluster a field belongs to.
 *
 * The drawer used to render all nine as one flat column of identical rows —
 * same weight, same spacing, no grouping — which is what made a real
 * instrument readout scan like a form. A catalogue number and an argument of
 * perigee are not the same kind of fact and should not look like it.
 */
export type TleFieldGroup = 'identity' | 'orbit' | 'freshness';

export const TLE_GROUP_LABEL: Record<TleFieldGroup, string> = {
  identity: 'Identity',
  orbit: 'Orbit',
  freshness: 'Freshness',
};

/** Plain-language annotations for the catalogue drawer. */
export const TLE_FIELD_NOTES: { key: string; label: string; group: TleFieldGroup; note: string }[] = [
  {
    key: 'norad',
    group: 'identity',
    label: 'Catalogue number',
    note: "The object's permanent identifier in the public satellite catalogue.",
  },
  {
    key: 'intl',
    group: 'identity',
    label: 'International designator',
    note: 'Launch year, the launch number within that year, and which piece of that launch this is.',
  },
  {
    key: 'launch',
    group: 'identity',
    label: 'Launch year',
    note: 'Read from the international designator, which carries the year and nothing finer — so this is a year, not a date.',
  },
  {
    key: 'epoch',
    group: 'freshness',
    label: 'Epoch',
    note: 'The instant these elements describe. Everything else is propagated forward from here, and accuracy decays as that gap widens.',
  },
  {
    key: 'incl',
    group: 'orbit',
    label: 'Inclination',
    note: 'Tilt of the orbit plane against the equator. Above 90° the object travels retrograde.',
  },
  {
    key: 'raan',
    group: 'orbit',
    label: 'Right ascension of ascending node',
    note: 'Where the orbit crosses the equator going north, measured against the vernal equinox.',
  },
  {
    key: 'ecc',
    group: 'orbit',
    label: 'Eccentricity',
    note: 'How far the orbit departs from a circle. Zero is circular.',
  },
  {
    key: 'argp',
    group: 'orbit',
    label: 'Argument of perigee',
    note: 'Angle from the ascending node round to the lowest point of the orbit.',
  },
  {
    key: 'ma',
    group: 'orbit',
    label: 'Mean anomaly',
    note: 'Where the object sits along its orbit at the epoch, as an angle from perigee.',
  },
  {
    key: 'mm',
    group: 'orbit',
    label: 'Mean motion',
    note: 'Revolutions completed per day. This is what fixes the orbit size, and so the altitude and period.',
  },
  {
    key: 'age',
    group: 'freshness',
    label: 'Element-set age',
    note: 'How far this prediction is extrapolating. SGP4 is accurate near an epoch and degrades away from it, so age is the first thing to check before trusting a miss distance.',
  },
];
