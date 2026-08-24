import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadCatalogue, SNAPSHOT_DIR, SNAPSHOT_EPOCH } from './snapshot-node';
import precomputed from '../src/data/precomputed.json';
// The console's own defaults, imported rather than restated, so the landing
// countdown and the dashboard can never disagree about which events count.
import { DEFAULT_THRESHOLDS } from '../src/state/thresholds';

/**
 * The landing page's own data file.
 *
 * The marketing page was importing CASCADE from data/conjunctions and OBJECTS
 * from data/objects, which is the whole engine: precomputed.json is 632 kB of
 * screening result, and building OBJECTS runs satellite.js over the snapshot at
 * import time. The first page a visitor sees was paying for the entire console
 * before it could paint, to print three numbers and animate some dots.
 *
 * So the three numbers and the dots get their own file. It carries six rounded
 * scalars per object rather than a SpaceObject with its element sets, and the
 * hero canvas does not need anything else — it draws circles from altitude,
 * inclination, RAAN and mean anomaly, and colours by class.
 *
 * Run: npm run screen (this runs after the screening precompute).
 */

const catalogue = loadCatalogue();

/*
 * Positions are drawn to a canvas a few hundred pixels across, so a tenth of a
 * degree is already far below one pixel. Rounding here is what keeps the file
 * small — full precision roughly triples it and changes nothing visible.
 */
const r1 = (n: number) => +n.toFixed(1);

const objects = catalogue.map(({ object: o }) => ({
  a: o.alt,
  i: r1(o.incl),
  r: r1(o.raan),
  m: r1(o.ma),
  p: r1(o.period),
  // 1 = debris, 0 = everything else. The canvas only makes that one distinction.
  d: o.type === 'DEBRIS' ? 1 : 0,
}));

const events = precomputed.conjunctions as { tca: number; id: string; miss: number; maxAge: number; sev: string }[];

/*
 * The soonest event the dashboard would show, so the landing countdown and the
 * console's "Next TCA" tile cannot disagree. Same default threshold filter the
 * console applies: a pair whose older element set has gone stale is withheld,
 * not displayed.
 */
const screened = events
  .filter((e) => e.miss <= DEFAULT_THRESHOLDS.maxMissKm && e.maxAge <= DEFAULT_THRESHOLDS.maxElementAgeDays)
  .sort((a, b) => a.tca - b.tca);

const next = screened.find((e) => e.tca > SNAPSHOT_EPOCH) ?? screened[0];

const summary = {
  generatedFrom: precomputed.generatedFrom,
  snapshotEpochMs: SNAPSHOT_EPOCH,
  objectCount: catalogue.length,
  totalPairs: precomputed.cascade.totalPairs,
  horizonHours: precomputed.cascade.horizonHours,
  elapsedMs: precomputed.cascade.elapsedMs,
  events: events.length,
  screenedEvents: screened.length,
  nextTca: next ? { id: next.id, tca: next.tca, sev: next.sev } : null,
  objects,
};

const path = join(SNAPSHOT_DIR, '..', 'landing-summary.json');
writeFileSync(path, JSON.stringify(summary));
console.log(
  `wrote ${path} (${(JSON.stringify(summary).length / 1024).toFixed(1)} kB, ${objects.length} objects)`,
);
