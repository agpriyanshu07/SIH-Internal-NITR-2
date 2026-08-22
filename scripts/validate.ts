import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as satellite from 'satellite.js';
import { loadCatalogue, MANIFEST, SNAPSHOT_DIR, SNAPSHOT_EPOCH } from './snapshot-node';
import { periApo, screen, SCREEN_KM, STEP_S, CO_ORBIT_KM } from '../src/data/engine/screen';
import { refine } from '../src/data/engine/refine';
import { DEFAULT_HORIZON_HOURS, runScreening } from '../src/data/engine/run';
import { SEVERITY_RANK } from '../src/data/riskScore';

/**
 * Known-answer tests for the screening engine.
 *
 * These exist because the two ways this engine can be wrong are both silent. A
 * coordinate-frame mistake makes every number wrong while every number still
 * looks plausible; an over-aggressive coarse filter makes the engine faster and
 * quieter while dropping real close approaches. Neither shows up in the UI.
 *
 * Run: npm run validate
 */

let failures = 0;
let checks = 0;

function check(name: string, ok: boolean, detail: string): void {
  checks++;
  if (!ok) failures++;
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${name}\n        ${detail}`);
}

function section(title: string): void {
  console.log(`\n${title}\n${'─'.repeat(title.length)}`);
}

const catalogue = loadCatalogue();
const byName = (needle: string) =>
  catalogue.find((e) => e.object.name.includes(needle));

console.log(
  `KESSLER engine validation\nsnapshot ${MANIFEST.capturedAtUtc} · ${catalogue.length} objects parsed`,
);

// ── 1. ISS altitude ─────────────────────────────────────────────────────────
// The ISS is the one object in this snapshot whose altitude everybody knows. If
// the propagator or the ECI frame were wrong, this is where it shows.
section('1. ISS propagates to its real altitude');
{
  const iss = byName('ISS (ZARYA)');
  if (!iss) {
    check('ISS present', false, 'ISS (ZARYA) not found in the snapshot');
  } else {
    const RE = 6378.137;
    const alts: number[] = [];
    for (let m = 0; m < 96; m += 2) {
      const pv = satellite.propagate(iss.rec, new Date(SNAPSHOT_EPOCH + m * 60000));
      if (pv?.position) {
        const p = pv.position;
        alts.push(Math.hypot(p.x, p.y, p.z) - RE);
      }
    }
    const min = Math.min(...alts);
    const max = Math.max(...alts);
    check(
      'altitude stays in the 380–440 km band over one orbit',
      min > 380 && max < 440,
      `min ${min.toFixed(1)} km, max ${max.toFixed(1)} km across ${alts.length} samples`,
    );

    const pv = satellite.propagate(iss.rec, new Date(SNAPSHOT_EPOCH));
    const speed = pv?.velocity
      ? Math.hypot(pv.velocity.x, pv.velocity.y, pv.velocity.z)
      : 0;
    check(
      'orbital speed is ~7.66 km/s',
      speed > 7.5 && speed < 7.8,
      `${speed.toFixed(3)} km/s`,
    );
    check(
      'element-set age is read from the TLE epoch, not assumed',
      iss.object.age >= 0 && iss.object.age < 30,
      `${iss.object.age} d at the capture instant`,
    );
  }
}

// ── 2. Self-distance ────────────────────────────────────────────────────────
// An object against itself must be exactly zero apart at every timestep. Any
// drift means the two propagation paths are not the same computation.
section('2. An object against itself is exactly 0 km apart');
{
  const iss = byName('ISS (ZARYA)');
  let worst = 0;
  if (iss) {
    for (let k = 0; k < 240; k++) {
      const t = new Date(SNAPSHOT_EPOCH + k * STEP_S * 1000);
      const a = satellite.propagate(iss.rec, t);
      const b = satellite.propagate(iss.rec, t);
      if (a?.position && b?.position) {
        worst = Math.max(
          worst,
          Math.hypot(
            a.position.x - b.position.x,
            a.position.y - b.position.y,
            a.position.z - b.position.z,
          ),
        );
      }
    }
  }
  check(
    'separation is identically zero over 240 steps',
    worst === 0,
    `largest observed separation ${worst} km`,
  );
}

// ── 3. refine() finds a true minimum ────────────────────────────────────────
// A sign change in range rate is necessary but not sufficient: it could in
// principle bracket a maximum. Sample either side of the returned TCA and
// confirm the separation really is smallest there.
section('3. refine() returns a true local minimum of separation');
{
  const start = new Date(SNAPSHOT_EPOCH);
  const subset = catalogue
    .filter((e) => e.group === 'stations' || e.group === 'cosmos-1408-debris')
    .concat(catalogue.filter((e) => e.group === 'iridium-33-debris').slice(0, 60));

  const { candidates } = screen(
    subset.map((e) => e.rec),
    { start, hours: 6 },
  );

  let tested = 0;
  let minima = 0;
  let worstDelta = 0;

  for (const c of candidates.slice(0, 40)) {
    const ev = refine(subset[c.i].rec, subset[c.j].rec, c.t, 90);
    if (!ev) continue;
    tested++;
    let isMin = true;
    for (const dt of [-20, -5, -1, 1, 5, 20]) {
      const t = new Date(ev.tca + dt * 1000);
      const pa = satellite.propagate(subset[c.i].rec, t);
      const pb = satellite.propagate(subset[c.j].rec, t);
      if (!pa?.position || !pb?.position) continue;
      const d = Math.hypot(
        pa.position.x - pb.position.x,
        pa.position.y - pb.position.y,
        pa.position.z - pb.position.z,
      );
      // Allow a hair of slack for floating point at the very bottom of the dip.
      if (d < ev.missKm - 1e-6) {
        isMin = false;
        worstDelta = Math.max(worstDelta, ev.missKm - d);
      }
    }
    if (isMin) minima++;
  }

  check(
    'every refined TCA is the smallest separation in its neighbourhood',
    tested > 0 && minima === tested,
    `${minima}/${tested} refined events verified; worst overshoot ${worstDelta.toExponential(2)} km`,
  );
}

// ── 4. Brute force vs the filtered cascade ──────────────────────────────────
// The only real guard against a coarse filter that silently drops events. Run
// every pair with no filtering at all and confirm the cascade found the same
// close approaches.
section('4. The filtered cascade agrees with brute-force all-pairs');
{
  const subset = catalogue
    .filter((e) => e.group === 'stations' || e.group === 'cosmos-1408-debris')
    .concat(catalogue.filter((e) => e.group === 'iridium-33-debris').slice(0, 80));
  const recs = subset.map((e) => e.rec);
  const start = new Date(SNAPSHOT_EPOCH);
  const hours = 6;
  const steps = (hours * 3600) / STEP_S;

  // Brute force: no radial filter, no early exits, same sampling grid.
  const n = recs.length;
  const brute = new Map<string, number>();
  const bruteMax = new Map<string, number>();
  for (let k = 0; k < steps; k++) {
    const t = new Date(start.getTime() + k * STEP_S * 1000);
    const pos = recs.map((r) => satellite.propagate(r, t)?.position ?? null);
    for (let i = 0; i < n; i++) {
      if (!pos[i]) continue;
      for (let j = i + 1; j < n; j++) {
        if (!pos[j]) continue;
        const d = Math.hypot(
          pos[i]!.x - pos[j]!.x,
          pos[i]!.y - pos[j]!.y,
          pos[i]!.z - pos[j]!.z,
        );
        const key = `${i}:${j}`;
        if (d < (brute.get(key) ?? Infinity)) brute.set(key, d);
        if (d > (bruteMax.get(key) ?? 0)) bruteMax.set(key, d);
      }
    }
  }

  const bruteCandidates = new Set(
    [...brute.entries()]
      .filter(([k, d]) => d <= SCREEN_KM && (bruteMax.get(k) ?? 0) >= CO_ORBIT_KM)
      .map(([k]) => k),
  );

  const { candidates, cascade } = screen(recs, { start, hours });
  const cascadeCandidates = new Set(candidates.map((c) => `${c.i}:${c.j}`));

  const missed = [...bruteCandidates].filter((k) => !cascadeCandidates.has(k));
  const extra = [...cascadeCandidates].filter((k) => !bruteCandidates.has(k));

  check(
    'the cascade misses nothing brute force found',
    missed.length === 0,
    `brute force ${bruteCandidates.size} candidates, cascade ${cascadeCandidates.size}; ${missed.length} missed, ${extra.length} extra`,
  );

  // Same check on the distances themselves, not just the pair set.
  let worstDiff = 0;
  for (const c of candidates) {
    const b = brute.get(`${c.i}:${c.j}`);
    if (b !== undefined) worstDiff = Math.max(worstDiff, Math.abs(b - c.d));
  }
  // Not an exact-equality check: brute force uses Math.hypot and the cascade a
  // manual sqrt, which differ in the last bit. A micrometre is many orders of
  // magnitude below anything that could hide a real disagreement.
  check(
    'sampled minimum distances agree to under a micrometre',
    worstDiff < 1e-9,
    `largest disagreement ${worstDiff.toExponential(2)} km over ${candidates.length} candidates`,
  );

  check(
    'the radial filter is reported honestly',
    cascade.afterRadialFilter <= cascade.totalPairs,
    `${cascade.totalPairs} pairs → ${cascade.afterRadialFilter} after radial overlap → ${cascade.candidates} candidates (${cascade.coOrbiting} dropped as co-orbiting)`,
  );
}

// ── 5. The screening radius is wide enough for the step size ────────────────
section('5. The screening radius covers the step size');
{
  const maxClosing = 15; // km/s, the fastest LEO head-on geometry
  check(
    'SCREEN_KM >= max closing speed x step / 2',
    SCREEN_KM >= (maxClosing * STEP_S) / 2,
    `SCREEN_KM ${SCREEN_KM} km vs required ${(maxClosing * STEP_S) / 2} km at ${STEP_S}s steps`,
  );
}

// ── 6. Derived elements match the propagator ────────────────────────────────
section('6. Catalogue elements are consistent with the propagator');
{
  let worst = 0;
  for (const e of catalogue) {
    const [peri, apo] = periApo(e.rec);
    const RE = 6378.137;
    worst = Math.max(
      worst,
      Math.abs(peri - RE - e.object.perigee),
      Math.abs(apo - RE - e.object.apogee),
    );
  }
  check(
    'perigee/apogee agree with the filter geometry to under 1 km',
    worst < 1,
    `largest disagreement ${worst.toFixed(4)} km across ${catalogue.length} objects`,
  );
}

// ── 7. The score column agrees with the severity column ─────────────────────
// The table sorts by score by default and prints a severity chip on every row.
// If those two ever disagree the operator is looking at a contradiction, so the
// score is banded by severity rather than blended freely — this is the check
// that keeps it that way.
section('7. Sorting by score never contradicts the severity chips');
{
  const { conjunctions } = runScreening(catalogue, {
    start: new Date(SNAPSHOT_EPOCH),
    hours: 12,
    includeSeparation: false,
  });
  const sorted = [...conjunctions].sort((a, b) => b.score - a.score);
  let inversions = 0;
  for (let i = 1; i < sorted.length; i++) {
    if (SEVERITY_RANK[sorted[i].sev] > SEVERITY_RANK[sorted[i - 1].sev]) inversions++;
  }

  // And the bands must not merely avoid inverting — their score ranges must not
  // overlap at all, or two adjacent rows could share a score across a boundary.
  const range = new Map<string, [number, number]>();
  for (const c of conjunctions) {
    const cur = range.get(c.sev) ?? [Infinity, -Infinity];
    range.set(c.sev, [Math.min(cur[0], c.score), Math.max(cur[1], c.score)]);
  }
  const ordered = [...range.entries()].sort(
    (a, b) => SEVERITY_RANK[a[0] as keyof typeof SEVERITY_RANK] -
      SEVERITY_RANK[b[0] as keyof typeof SEVERITY_RANK],
  );
  let overlaps = 0;
  for (let i = 1; i < ordered.length; i++) {
    if (ordered[i][1][0] <= ordered[i - 1][1][1]) overlaps++;
  }

  check(
    'no severity inversion when sorted by score',
    inversions === 0,
    `${inversions} inversions over ${sorted.length} events`,
  );
  check(
    'score ranges of adjacent severity bands do not overlap',
    overlaps === 0,
    ordered.map(([sev, [lo, hi]]) => `${sev} ${lo}-${hi}`).join(', '),
  );
}

// ── 8. The committed run matches the console's default horizon ──────────────
// This one exists because it already went wrong. `npm run screen` defaulted to
// 24 h while the console's default window was 72 h, so regenerating the
// committed result silently dropped two thirds of the events with nothing in
// the UI to say why. Both now read DEFAULT_HORIZON_HOURS; this checks that the
// committed artefact was actually built with it.
section('8. The committed screening result matches the default horizon');
{
  const committed = JSON.parse(
    readFileSync(join(SNAPSHOT_DIR, '..', 'precomputed.json'), 'utf8'),
  ) as { cascade: { horizonHours: number; objects: number }; conjunctions: unknown[] };

  check(
    'committed run horizon equals DEFAULT_HORIZON_HOURS',
    committed.cascade.horizonHours === DEFAULT_HORIZON_HOURS,
    `committed ${committed.cascade.horizonHours} h vs default ${DEFAULT_HORIZON_HOURS} h`,
  );
  check(
    'committed run covers the whole catalogue',
    committed.cascade.objects === catalogue.length,
    `${committed.cascade.objects} screened vs ${catalogue.length} in the snapshot`,
  );
  check(
    'committed event count is non-empty and self-consistent',
    committed.conjunctions.length > 0 &&
      committed.conjunctions.length === (committed.cascade as { events?: number }).events,
    `${committed.conjunctions.length} events stored`,
  );
}

section('Result');
console.log(`${checks - failures}/${checks} checks passed`);
if (failures > 0) process.exit(1);
