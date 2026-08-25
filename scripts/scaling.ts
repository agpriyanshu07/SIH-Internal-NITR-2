import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadCatalogue, SNAPSHOT_DIR, SNAPSHOT_EPOCH } from './snapshot-node';
import { runScreening, DEFAULT_HORIZON_HOURS } from '../src/data/engine/run';

/**
 * How the cascade scales, measured rather than argued.
 *
 * "Does it work at 30,000 objects" is the most predictable question this
 * project gets after precision, and the answer in DEMO.md was a rejection-rate
 * argument: all-pairs is O(n^2), the filters reject a roughly constant
 * FRACTION, therefore the shape holds. That reasoning is correct and it is
 * still reasoning. In front of an engineer a measured curve beats it.
 *
 * So: run the real screening over subsets of the real catalogue at increasing
 * size and record what actually happens. No synthetic objects — a synthetic
 * catalogue would have synthetic geometry, and the whole question is whether
 * the filters keep rejecting at the same rate when the geometry is real.
 *
 * Subsets are taken by a deterministic stride rather than by slicing the front
 * of the array, because the catalogue is ordered by group: the first 200
 * entries are stations and ISRO assets and nothing else, which is not a smaller
 * version of the problem, it is a different one. A stride keeps the mix of
 * shells and inclinations roughly constant as n grows, which is what makes the
 * points comparable.
 *
 *     npm run scaling
 *
 * Writes scaling.json beside the precomputed run and prints the table that goes
 * in the pitch.
 */

const catalogue = loadCatalogue();
const N = catalogue.length;

/** Sizes to measure. The last is the whole catalogue, whatever that is today. */
const SIZES = [100, 200, 350, 500, 700, N].filter((n, i, a) => n <= N && a.indexOf(n) === i);

function subset(n: number) {
  if (n >= N) return catalogue;
  const stride = N / n;
  const out = [];
  for (let i = 0; i < n; i++) out.push(catalogue[Math.floor(i * stride)]);
  return out;
}

interface Row {
  objects: number;
  pairs: number;
  afterRadialFilter: number;
  candidates: number;
  events: number;
  propagations: number;
  elapsedMs: number;
  pairsPerSecond: number;
  propagationsPerSecond: number;
}

const rows: Row[] = [];

console.log('\nCascade scaling — real catalogue, real geometry');
console.log('──────────────────────────────────────────────');
console.log(
  '  objects      pairs   after radial   candidates   events' +
    '     elapsed   pairs/s',
);

for (const n of SIZES) {
  const sub = subset(n);
  const t0 = performance.now();
  const run = runScreening(sub, {
    start: new Date(SNAPSHOT_EPOCH),
    hours: DEFAULT_HORIZON_HOURS,
    // The separation curve is a per-event convenience for the detail view and
    // is pure overhead here — including it would measure chart preparation
    // rather than the cascade this script exists to characterise.
    includeSeparation: false,
  });
  const elapsedMs = performance.now() - t0;
  const c = run.cascade;
  const row: Row = {
    objects: c.objects,
    pairs: c.totalPairs,
    afterRadialFilter: c.afterRadialFilter,
    candidates: c.candidates,
    events: run.conjunctions.length,
    propagations: c.propagations,
    elapsedMs,
    pairsPerSecond: c.totalPairs / (elapsedMs / 1000),
    propagationsPerSecond: c.propagations / (elapsedMs / 1000),
  };
  rows.push(row);
  console.log(
    `  ${String(row.objects).padStart(7)}` +
      `  ${row.pairs.toLocaleString('en-US').padStart(9)}` +
      `  ${row.afterRadialFilter.toLocaleString('en-US').padStart(13)}` +
      `  ${row.candidates.toLocaleString('en-US').padStart(11)}` +
      `  ${String(row.events).padStart(7)}` +
      `  ${(elapsedMs / 1000).toFixed(1).padStart(9)}s` +
      `  ${Math.round(row.pairsPerSecond).toLocaleString('en-US').padStart(8)}`,
  );
}

/*
 * Fit the exponent, because that is the number the question is actually about.
 *
 * Least squares on log(elapsed) against log(objects). An exponent near 2 says
 * the pair loop dominates and the cost is quadratic in catalogue size; below 2
 * says the filters are taking a growing share; above 2 would mean something is
 * super-quadratic and the extrapolation below is not safe to make.
 */
const xs = rows.map((r) => Math.log(r.objects));
const ys = rows.map((r) => Math.log(r.elapsedMs));
const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
const my = ys.reduce((a, b) => a + b, 0) / ys.length;
const slope =
  xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0) /
  xs.reduce((s, x) => s + (x - mx) ** 2, 0);
const intercept = my - slope * mx;

const predict = (n: number) => Math.exp(intercept + slope * Math.log(n)) / 1000;

console.log(`\n  Fitted exponent: ${slope.toFixed(3)}  (2.000 would be pure all-pairs)`);
console.log('\n  Extrapolated, single-threaded, on this machine:');
for (const n of [5000, 10000, 30000]) {
  const s = predict(n);
  console.log(
    `    ${String(n).padStart(6)} objects  ${(n * (n - 1) / 2).toLocaleString('en-US').padStart(15)} pairs` +
      `  ~${s < 90 ? `${s.toFixed(0)} s` : `${(s / 60).toFixed(0)} min`}`,
  );
}

console.log(
  '\n  Stated honestly: this is an extrapolation of a fit to six points over\n' +
    '  one order of magnitude, on one machine, single-threaded, and the fit\n' +
    '  cannot know about cache behaviour or memory pressure at 30,000 objects.\n' +
    '  It is a measurement of the shape, not a benchmark of the destination.\n' +
    '  The right structure at that size is spatial binning per time step rather\n' +
    '  than a pair loop, and that is not built.\n',
);

writeFileSync(
  join(SNAPSHOT_DIR, '..', 'scaling.json'),
  JSON.stringify(
    {
      measuredAtUtc: new Date().toISOString(),
      horizonHours: DEFAULT_HORIZON_HOURS,
      note:
        'Subsets taken by deterministic stride over the real catalogue, so the ' +
        'mix of shells and inclinations stays comparable as n grows. Timings are ' +
        'single-threaded and machine-specific; the exponent is the portable part.',
      fittedExponent: Number(slope.toFixed(4)),
      rows,
      extrapolation: Object.fromEntries(
        [5000, 10000, 30000].map((n) => [n, Number(predict(n).toFixed(1))]),
      ),
    },
    null,
    2,
  ) + '\n',
);
