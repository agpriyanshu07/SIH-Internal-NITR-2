import { parseCatalogue, type CatalogueEntry } from './parse';
import type { ObjectType, SpaceObject } from '../types';

import stationsTxt from '../snapshot/stations.txt?raw';
import cosmos1408Txt from '../snapshot/cosmos-1408-debris.txt?raw';
import iridium33Txt from '../snapshot/iridium-33-debris.txt?raw';
import cosmos2251Txt from '../snapshot/cosmos-2251-debris.txt?raw';
import manifest from '../snapshot/manifest.json';

/**
 * The catalogue, as the browser sees it.
 *
 * The snapshot files are bundled at build time, so the app makes no network
 * request at any point — a demo cannot depend on conference wifi. Refreshing
 * the data is a deliberate act: scripts/fetch-snapshot.sh.
 */

/** Where the snapshot came from, for the provenance footer. */
export const PROVENANCE = manifest;

/** The instant every element set in the snapshot was captured. */
export const SNAPSHOT_EPOCH = Date.parse(manifest.capturedAtUtc);

export const SNAPSHOT_SOURCES = [
  { group: 'stations', text: stationsTxt },
  { group: 'cosmos-1408-debris', text: cosmos1408Txt },
  { group: 'iridium-33-debris', text: iridium33Txt },
  { group: 'cosmos-2251-debris', text: cosmos2251Txt },
];

export const CATALOGUE: CatalogueEntry[] = parseCatalogue(
  SNAPSHOT_SOURCES,
  SNAPSHOT_EPOCH,
);

export const OBJECTS: SpaceObject[] = CATALOGUE.map((e) => e.object);

const BY_NORAD = new Map(CATALOGUE.map((e) => [e.object.norad, e]));

export const entryById = (norad: number): CatalogueEntry | undefined =>
  BY_NORAD.get(norad);

export const objectById = (norad: number): SpaceObject =>
  BY_NORAD.get(norad)?.object ?? OBJECTS[0];

/** Which real destruction event an object descends from, if any. */
export const groupOf = (norad: number): string | undefined =>
  BY_NORAD.get(norad)?.group;

export const OBJECT_COUNTS: Record<ObjectType, number> = OBJECTS.reduce(
  (acc, o) => ({ ...acc, [o.type]: acc[o.type] + 1 }),
  { PAYLOAD: 0, 'ROCKET BODY': 0, DEBRIS: 0 } as Record<ObjectType, number>,
);

export const GROUP_COUNTS: Record<string, number> = CATALOGUE.reduce(
  (acc, e) => ({ ...acc, [e.group]: (acc[e.group] ?? 0) + 1 }),
  {} as Record<string, number>,
);

/**
 * How many objects this console screens.
 *
 * The public catalogue holds tens of thousands; this is the four groups we
 * committed. The UI shows this number, not a headline figure for the catalogue
 * as a whole.
 */
export const CATALOGUE_TOTAL = OBJECTS.length;

export type { CatalogueEntry };
export { GROUP_EVENT } from './parse';
