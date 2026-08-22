import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadCatalogue, MANIFEST, SNAPSHOT_DIR, SNAPSHOT_EPOCH } from './snapshot-node';
import { runScreening } from '../src/data/engine/run';

/**
 * Build-time screening run.
 *
 * The dashboard has to paint instantly, and a full 24-hour screen of the whole
 * snapshot takes long enough that doing it on page load would freeze the tab.
 * So the same engine runs here, at build time, and the result is committed. The
 * "Run screening" button then re-runs the identical code in a Web Worker, live,
 * against whatever horizon the operator picks — the precomputed set is a cache
 * of a real run, not a substitute for one.
 *
 * Run: npm run screen
 */

const HOURS = Number(process.env.KESSLER_HOURS ?? 24);

const catalogue = loadCatalogue();
const start = new Date(SNAPSHOT_EPOCH);

console.log(
  `screening ${catalogue.length} objects over ${HOURS} h from ${start.toISOString()}`,
);

let lastPct = -1;
const t0 = Date.now();
const { conjunctions, cascade } = runScreening(catalogue, {
  start,
  hours: HOURS,
  // The detail view computes its own curve on demand; see RunOptions.
  includeSeparation: false,
  onProgress: (f, stage) => {
    const pct = Math.floor(f * 100);
    if (pct !== lastPct && pct % 10 === 0) {
      lastPct = pct;
      process.stdout.write(`  ${stage} ${pct}%\r`);
    }
  },
});

const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

console.log(`
cascade
  objects                ${cascade.objects}
  all pairs              ${cascade.totalPairs.toLocaleString()}
  after radial filter    ${cascade.afterRadialFilter.toLocaleString()}
  coarse candidates      ${cascade.candidates.toLocaleString()}
  dropped as co-orbiting ${cascade.coOrbiting.toLocaleString()}
  unbracketed            ${cascade.unbracketed.toLocaleString()}
  beyond ${cascade.gateKm} km gate       ${cascade.beyondGate.toLocaleString()}
  CONFIRMED EVENTS       ${cascade.events.toLocaleString()}
  SGP4 propagations      ${cascade.propagations.toLocaleString()}
  wall clock             ${elapsed}s
`);

const bySev = conjunctions.reduce<Record<string, number>>(
  (acc, c) => ({ ...acc, [c.sev]: (acc[c.sev] ?? 0) + 1 }),
  {},
);
console.log('severity', bySev);

const closest = [...conjunctions].sort((a, b) => a.miss - b.miss).slice(0, 8);
console.log('\nclosest approaches');
for (const c of closest) {
  const A = catalogue.find((e) => e.object.norad === c.a)!.object;
  const B = catalogue.find((e) => e.object.norad === c.b)!.object;
  console.log(
    `  ${c.miss.toFixed(3)} km  ${c.relv.toFixed(2)} km/s  Pc ${c.pc.toExponential(2)}  ${c.sev.padEnd(8)} ${A.name} (${A.norad}) x ${B.name} (${B.norad})`,
  );
}

const out = {
  generatedFrom: {
    snapshot: MANIFEST.capturedAtUtc,
    engine: 'satellite.js SGP4 + range-rate bisection',
  },
  cascade,
  conjunctions,
};

const path = join(SNAPSHOT_DIR, '..', 'precomputed.json');
writeFileSync(path, JSON.stringify(out));
console.log(`\nwrote ${path} (${(JSON.stringify(out).length / 1024 / 1024).toFixed(2)} MB)`);
