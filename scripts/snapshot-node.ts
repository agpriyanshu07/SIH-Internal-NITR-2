import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCatalogue, type CatalogueEntry } from '../src/data/engine/parse';

/**
 * Node-side snapshot loading.
 *
 * The browser gets the snapshot through Vite's `?raw` imports, which node
 * cannot resolve. This reads the same files off disk and hands them to the same
 * parser, so the precompute, the tests and the app cannot drift apart.
 */

const HERE = dirname(fileURLToPath(import.meta.url));
export const SNAPSHOT_DIR = join(HERE, '..', 'src', 'data', 'snapshot');

export interface Manifest {
  source: string;
  obtainedVia: string;
  capturedAtUtc: string;
  committedAtUtc: string;
  format: string;
  note: string;
  groups: { group: string; file: string; objects: number; note: string }[];
}

export const MANIFEST: Manifest = JSON.parse(
  readFileSync(join(SNAPSHOT_DIR, 'manifest.json'), 'utf8'),
);

export const SNAPSHOT_EPOCH = Date.parse(MANIFEST.capturedAtUtc);

export function loadCatalogue(): CatalogueEntry[] {
  const sources = MANIFEST.groups.map((g) => ({
    group: g.group,
    text: readFileSync(join(SNAPSHOT_DIR, g.file), 'utf8'),
  }));
  return parseCatalogue(sources, SNAPSHOT_EPOCH);
}
