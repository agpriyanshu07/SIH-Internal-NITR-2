import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { estimateUncertainty, type DatedTle } from '../src/data/engine/tleUncertainty';
import { SNAPSHOT_DIR } from './snapshot-node';

/**
 * Measure positional uncertainty from a run of element sets.
 *
 * Reads whatever `scripts/fetch-history.sh` has collected into
 * `src/data/history/<norad>.txt`, runs successive TLE differencing over each
 * object, and writes `src/data/measuredSigma.json`.
 *
 * It refuses to write anything if there is no history, rather than emitting an
 * empty file that a later reader could mistake for "measured, and it came out
 * zero". Nothing in the console consumes the output until the wiring commit
 * that also moves the feature registry — see tleUncertainty.ts.
 */

const HISTORY_DIR = join(SNAPSHOT_DIR, '..', 'history');
const OUT = join(SNAPSHOT_DIR, '..', 'measuredSigma.json');

/** Epoch field of TLE line 1: two-digit year plus fractional day of year. */
function epochFromLine1(l1: string): number {
  const yy = Number(l1.slice(18, 20));
  const doy = Number(l1.slice(20, 32));
  const year = yy >= 57 ? 1900 + yy : 2000 + yy;
  return Date.UTC(year, 0, 1) + (doy - 1) * 86400000;
}

/** A three-line TLE file, possibly many sets for one object, concatenated. */
function readHistory(path: string): DatedTle[] {
  const lines = readFileSync(path, 'utf8').split(/\r?\n/).filter((l) => l.trim());
  const out: DatedTle[] = [];
  for (let i = 0; i + 2 < lines.length + 1; i += 3) {
    const l1 = lines[i + 1];
    const l2 = lines[i + 2];
    if (!l1?.startsWith('1 ') || !l2?.startsWith('2 ')) continue;
    out.push({ line1: l1, line2: l2, epochMs: epochFromLine1(l1) });
  }
  // The fetch script appends, and an object that has not been re-fitted between
  // two runs yields the same element set twice. Identical epochs measure zero
  // disagreement and would drag every sigma down, so they are dropped here
  // rather than being allowed to look like agreement.
  const seen = new Set<number>();
  return out.filter((t) => (seen.has(t.epochMs) ? false : (seen.add(t.epochMs), true)));
}

if (!existsSync(HISTORY_DIR)) {
  console.error(
    `No history at ${HISTORY_DIR}.\n\n` +
      'Successive TLE differencing needs several element sets per object at\n' +
      'different epochs, and the committed snapshot is one instant by design.\n' +
      'Collect a history first:\n\n' +
      '    scripts/fetch-history.sh\n\n' +
      'run daily for a week, or pull Space-Track gp_history directly — see the\n' +
      'header of that script.',
  );
  process.exit(1);
}

const files = readdirSync(HISTORY_DIR).filter((f) => /^\d+\.txt$/.test(f));
if (files.length === 0) {
  console.error(`${HISTORY_DIR} exists but holds no <norad>.txt files.`);
  process.exit(1);
}

const results: Record<string, unknown> = {};
let measured = 0;
let suspect = 0;

console.log('\nSuccessive TLE differencing');
console.log('───────────────────────────');
console.log('  NORAD    sets   span d      R km      I km      C km    total km');

for (const f of files.sort()) {
  const norad = Number(f.replace('.txt', ''));
  const history = readHistory(join(HISTORY_DIR, f));
  const est = estimateUncertainty(norad, history);
  if (!est) {
    console.log(
      `  ${String(norad).padStart(6)}  ${String(history.length).padStart(5)}` +
        '       —  needs two element sets at different epochs',
    );
    continue;
  }
  /*
   * Reject the implausible rather than reporting it.
   *
   * A TLE-derived uncertainty is metres to a few kilometres; anything past 100
   * km is not a measurement, it is corrupt input — a truncated file, two
   * different objects concatenated into one, or an epoch field edited without
   * the mean anomaly that goes with it. Found exactly that way while testing
   * this script: a hand-built history whose epoch was advanced a day without
   * touching mean anomaly put the object 16 orbits out of phase, and the
   * estimator faithfully reported a 13,576 km radial sigma. It was right, and
   * printing it as a result would have been the problem.
   */
  if (est.total > 100) {
    suspect++;
    console.log(
      `  ${String(norad).padStart(6)}  ${String(history.length).padStart(5)}` +
        `  ${est.meanSpanDays.toFixed(2).padStart(6)}` +
        `        REJECTED — ${est.total.toFixed(0)} km is not a TLE uncertainty;` +
        ' check this object\'s history file',
    );
    continue;
  }

  results[norad] = est;
  measured++;
  console.log(
    `  ${String(norad).padStart(6)}  ${String(est.samples + 1).padStart(5)}` +
      `  ${est.meanSpanDays.toFixed(2).padStart(6)}` +
      `  ${est.radial.toFixed(4).padStart(8)}` +
      `  ${est.alongTrack.toFixed(4).padStart(8)}` +
      `  ${est.crossTrack.toFixed(4).padStart(8)}` +
      `  ${est.total.toFixed(4).padStart(10)}`,
  );
}

if (measured === 0) {
  console.error(
    `\nNothing measurable${suspect ? ` (${suspect} rejected as implausible)` : ''}. ` +
      'Every object has fewer than two distinct epochs —\n' +
      'run scripts/fetch-history.sh again tomorrow, or pull a real history from\n' +
      "Space-Track's gp_history class.",
  );
  process.exit(1);
}

writeFileSync(
  OUT,
  JSON.stringify(
    {
      method: 'successive TLE differencing, states compared at the epoch midpoint',
      reference: 'Flohrer et al., AMOS 2008; Space-Track / ESA routine practice',
      caveat:
        'Measures the consistency of successive fits. An error common to the ' +
        'whole series — a shared theory error, a mismodelled drag regime — does ' +
        'not appear. Treat as a lower bound on the true uncertainty.',
      generatedAtUtc: new Date().toISOString(),
      objects: results,
    },
    null,
    2,
  ) + '\n',
);

console.log(
  `\n${measured} of ${files.length} objects measured` +
    `${suspect ? `, ${suspect} rejected as implausible` : ''}. Written to ` +
    'src/data/measuredSigma.json.\n\n' +
    'Along-track should dominate radial and cross-track by roughly an order of\n' +
    'magnitude; if it does not, the history is probably too short to have\n' +
    'accumulated any phase error, and the numbers are noise rather than signal.\n',
);
