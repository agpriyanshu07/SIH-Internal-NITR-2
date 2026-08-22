import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as satellite from 'satellite.js';
import { loadCatalogue, MANIFEST, SNAPSHOT_DIR, SNAPSHOT_EPOCH } from './snapshot-node';
import { periApo, screen, SCREEN_KM, STEP_S, CO_ORBIT_KM } from '../src/data/engine/screen';
import { refine } from '../src/data/engine/refine';
import { DEFAULT_HORIZON_HOURS, runScreening } from '../src/data/engine/run';
import { SEVERITY_RANK } from '../src/data/riskScore';
import { applyAlongTrackDeltaV, propagateState } from '../src/data/engine/twobody';
import {
  density,
  lifetimeDays,
  reachableLatitude,
  reentryLatitudeDistribution,
} from '../src/data/engine/decay';
import { materialByKey, simulateEntry, casualtyArea } from '../src/data/engine/thermal';
import {
  CATASTROPHIC_THRESHOLD_JG,
  fragmentCount,
  modelBreakup,
  specificEnergy,
} from '../src/data/engine/breakup';

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

// ── 9. The two-body propagator behind the burn advisor ──────────────────────
// The advisor's re-propagated answer is only worth more than the closed-form
// one if this integrator is right. Three properties pin it down.
section('9. Two-body propagator is self-consistent');
{
  const iss = byName('ISS (ZARYA)');
  if (!iss) {
    check('ISS present', false, 'not found');
  } else {
    const pv = satellite.propagate(iss.rec, new Date(SNAPSHOT_EPOCH));
    const st = { r: pv!.position!, v: pv!.velocity! };

    // (a) Propagating forward then back must return the original state.
    const there = propagateState(st, 3600);
    const back = there ? propagateState(there, -3600) : null;
    const rt = back
      ? Math.hypot(back.r.x - st.r.x, back.r.y - st.r.y, back.r.z - st.r.z)
      : Infinity;
    check(
      'forward then back returns the original state',
      rt < 1e-6,
      `round-trip error ${rt.toExponential(2)} km over +/-1 h`,
    );

    // (b) Specific orbital energy is conserved: the integrator must not add or
    //     remove energy over a long arc.
    const long = propagateState(st, 6 * 3600);
    const MU = 398600.4418;
    const energy = (s: { r: typeof st.r; v: typeof st.v }) =>
      (s.v.x ** 2 + s.v.y ** 2 + s.v.z ** 2) / 2 -
      MU / Math.hypot(s.r.x, s.r.y, s.r.z);
    const de = long ? Math.abs(energy(long) - energy(st)) / Math.abs(energy(st)) : 1;
    check(
      'specific orbital energy is conserved over 6 h',
      de < 1e-10,
      `relative drift ${de.toExponential(2)}`,
    );

    // (c) A zero delta-v must produce exactly zero displacement — otherwise the
    //     advisor would report a burn benefit for not burning.
    const zero = propagateState(applyAlongTrackDeltaV(st, 0), 7200);
    const plain = propagateState(st, 7200);
    const d0 =
      zero && plain
        ? Math.hypot(zero.r.x - plain.r.x, zero.r.y - plain.r.y, zero.r.z - plain.r.z)
        : Infinity;
    check(
      'a zero burn displaces the asset by exactly zero',
      d0 === 0,
      `displacement ${d0} km`,
    );

    // (d) The along-track closed form is what the differential arms should
    //     reproduce to first order; agreeing within a few percent over a short
    //     arc is the cross-check that neither is badly wrong.
    const dv = 10e-6; // 10 mm/s in km/s
    const t = 3 * 3600;
    const burned = propagateState(applyAlongTrackDeltaV(st, dv), t);
    const base = propagateState(st, t);
    const actual =
      burned && base
        ? Math.hypot(burned.r.x - base.r.x, burned.r.y - base.r.y, burned.r.z - base.r.z)
        : 0;
    const closed = 3 * dv * t;
    const rel = Math.abs(actual - closed) / closed;
    check(
      'displacement agrees with 3*dV*t to within 10% over 3 h',
      rel < 0.1,
      `re-propagated ${actual.toFixed(4)} km vs closed form ${closed.toFixed(4)} km (${(rel * 100).toFixed(1)}%)`,
    );
  }
}

// ── 10. Atmosphere and orbital decay ────────────────────────────────────────
// The decay model drives every "when does this come down" figure. It cannot be
// checked to a year — density swings by more than 10x over the solar cycle,
// which is exactly why the UI reports bands. What CAN be checked is that it
// behaves like drag: monotone in altitude, monotone in ballistic coefficient,
// and inside the right order of magnitude at the ends.
section('10. Atmospheric decay behaves like drag');
{
  let monotoneRho = true;
  for (let h = 100; h < 1000; h += 25) {
    if (!(density(h) > density(h + 25))) monotoneRho = false;
  }
  check(
    'density falls monotonically with altitude',
    monotoneRho,
    `100 km ${density(100).toExponential(1)} -> 800 km ${density(800).toExponential(1)} kg/m3`,
  );

  const lives = [200, 300, 400, 500, 600, 700].map((h) => lifetimeDays(h, h, 0.01));
  let monotoneLife = true;
  for (let i = 1; i < lives.length; i++) if (!(lives[i] > lives[i - 1])) monotoneLife = false;
  check(
    'lifetime increases monotonically with altitude',
    monotoneLife,
    lives.map((d, i) => `${200 + i * 100}km ${(d / 365.25).toFixed(1)}y`).join(', '),
  );

  const heavy = lifetimeDays(600, 600, 0.005);
  const light = lifetimeDays(600, 600, 0.5);
  check(
    'a higher area-to-mass ratio decays sooner',
    light < heavy,
    `A/m 0.5 -> ${(light / 365.25).toFixed(2)} y vs A/m 0.005 -> ${(heavy / 365.25).toFixed(1)} y at 600 km`,
  );

  check(
    'a 200 km orbit decays within a year, an 800 km one does not',
    lifetimeDays(200, 200, 0.01) < 365 && lifetimeDays(800, 800, 0.005) > 10 * 365,
    `200 km ${(lifetimeDays(200, 200, 0.01)).toFixed(0)} d, 800 km ${(lifetimeDays(800, 800, 0.005) / 365.25).toFixed(0)} y`,
  );

  // An eccentric orbit decays through its perigee, so it must come down sooner
  // than a circular orbit at its apogee altitude.
  check(
    'an eccentric orbit decays faster than a circular one at its apogee',
    lifetimeDays(300, 900, 0.05) < lifetimeDays(900, 900, 0.05),
    `300x900 km ${(lifetimeDays(300, 900, 0.05) / 365.25).toFixed(2)} y vs 900 km circular`,
  );
}

// ── 11. Where debris can come down ──────────────────────────────────────────
// The latitude bound is the one genuinely hard prediction in the re-entry
// story, so it gets checked rather than asserted.
section('11. Re-entry latitude is bounded by inclination');
{
  let ok = true;
  let sums = true;
  let peaksHigh = true;
  for (const inc of [51.6, 74, 86.4, 98.7]) {
    const bins = reentryLatitudeDistribution(inc, 180);
    const bound = reachableLatitude(inc);
    // Nothing outside the reachable band, at all.
    for (const b of bins) {
      if (Math.abs(b.lat) > bound + 1 && b.p > 0) ok = false;
    }
    const total = bins.reduce((a, b) => a + b.p, 0);
    if (Math.abs(total - 1) > 1e-9) sums = false;
    // The distribution must peak near the turning latitude, not the equator.
    const peak = bins.reduce((m, b) => (b.p > m.p ? b : m));
    if (Math.abs(peak.lat) < bound * 0.7) peaksHigh = false;
  }
  check('probability is exactly zero outside +/- inclination', ok, 'checked 4 inclinations');
  check('the distribution is normalised', sums, 'sums to 1 for all four');
  check(
    'debris is likeliest near the turning latitude, not the equator',
    peaksHigh,
    'peak |lat| within 30% of the inclination bound in every case',
  );
}

// ── 12. The NASA Standard Breakup Model ─────────────────────────────────────
section('12. Breakup model matches its published form');
{
  // A 1 kg fragment onto a 1000 kg satellite at 14 km/s: 98 J/g, well past the
  // 40 J/g threshold, so the target is destroyed entirely.
  const ep = specificEnergy(1000, 1, 14);
  check(
    'specific energy puts a 1 kg hit at 14 km/s over the catastrophic threshold',
    ep > CATASTROPHIC_THRESHOLD_JG,
    `${ep.toFixed(1)} J/g vs ${CATASTROPHIC_THRESHOLD_JG} J/g threshold`,
  );
  check(
    'the same fragment at 2 km/s is not catastrophic',
    specificEnergy(1000, 1, 2) < CATASTROPHIC_THRESHOLD_JG,
    `${specificEnergy(1000, 1, 2).toFixed(1)} J/g`,
  );

  // N(Lc) = 0.1 * M^0.75 * Lc^-1.71 — more fragments at smaller sizes, always.
  const n10 = fragmentCount(1000, 0.1);
  const n100 = fragmentCount(1000, 1.0);
  check(
    'fragment count follows the power law and grows as size falls',
    n10 > n100 && Math.abs(n10 / n100 - Math.pow(0.1, -1.71)) < 1e-6,
    `N(>10cm)=${n10.toFixed(0)}, N(>1m)=${n100.toFixed(0)} for a 1 t breakup`,
  );

  const A = catalogue.find((e) => e.group === 'indian-assets')!;
  const B = catalogue.find((e) => e.group === 'cosmos-2251-debris')!;
  const r = modelBreakup(A.object, B.object, 14, A.group, B.group);
  check(
    'a modelled cloud has physical fragments',
    r.fragments.length > 0 &&
      r.fragments.every((f) => f.mass > 0 && f.aOverM > 0 && f.dvMs > 0 && f.lc >= 0.1),
    `${r.fragments.length} modelled of ${r.predictedCount} predicted, catastrophic=${r.catastrophic}`,
  );
  check(
    'the same collision always produces the same cloud',
    JSON.stringify(modelBreakup(A.object, B.object, 14, A.group, B.group).fragments) ===
      JSON.stringify(r.fragments),
    'seeded from the pair, so a reload cannot reshuffle the debris',
  );
}

// ── 13. Re-entry heating ────────────────────────────────────────────────────
// Absolute demise altitudes are not calibrated against flight data, so they are
// not asserted. What IS asserted is the physics that must hold regardless of
// calibration — and one of these caught a sign-of-effect error where suppressing
// free-molecular heating made light fragments survive and heavy ones demise,
// exactly inverting the real behaviour.
section('13. Re-entry heating scales the way it must');
{
  const al = materialByKey('aluminium');
  const aoms = [0.008, 0.02, 0.05, 0.1, 0.2, 0.5, 1.0];
  const melt = aoms.map((aom) => simulateEntry(1, aom, al, 7800, 0.1).meltFraction);

  let monotone = true;
  for (let i = 1; i < melt.length; i++) if (!(melt[i] > melt[i - 1])) monotone = false;
  check(
    'heat absorbed per unit mass rises with area-to-mass ratio',
    monotone,
    aoms.map((a, i) => `${a}:${(melt[i] * 100).toFixed(0)}%`).join(' '),
  );

  // Peak heating moves deeper for a higher ballistic coefficient, because a
  // compact fragment carries its speed further down.
  const peaks = [0.008, 0.05, 0.5].map(
    (aom) => simulateEntry(1, aom, al, 7800, 0.1).peakAltKm,
  );
  check(
    'peak heating occurs deeper for a more compact fragment',
    peaks[0] < peaks[1] && peaks[1] < peaks[2],
    `A/m 0.008 peaks at ${peaks[0].toFixed(0)} km, 0.5 at ${peaks[2].toFixed(0)} km`,
  );

  // Titanium melts at 1941 K against aluminium's 933 K, so for identical
  // geometry it must always survive at least as well.
  const alF = simulateEntry(1, 0.1, materialByKey('aluminium'), 7800, 0.1).meltFraction;
  const tiF = simulateEntry(1, 0.1, materialByKey('titanium'), 7800, 0.1).meltFraction;
  check(
    'titanium survives better than aluminium for identical geometry',
    tiF < alF,
    `titanium ${(tiF * 100).toFixed(0)}% melted vs aluminium ${(alF * 100).toFixed(0)}%`,
  );

  // A shallower entry means longer in the heat pulse, hence more total heat.
  const shallow = simulateEntry(1, 0.1, al, 7800, 0.05).meltFraction;
  const steep = simulateEntry(1, 0.1, al, 7800, 1.0).meltFraction;
  check(
    'a shallower entry absorbs more total heat than a steep one',
    shallow > steep,
    `0.05 deg -> ${(shallow * 100).toFixed(0)}%, 1.0 deg -> ${(steep * 100).toFixed(0)}%`,
  );

  // Terminal velocity must rise with ballistic coefficient.
  const vLight = simulateEntry(1, 0.5, al, 7800, 0.1).terminalMs;
  const vDense = simulateEntry(100, 0.8, al, 7800, 0.1).terminalMs;
  check(
    'a denser fragment lands faster',
    vDense > vLight,
    `${vLight.toFixed(0)} m/s vs ${vDense.toFixed(0)} m/s`,
  );

  // The DAS casualty-area form: each survivor contributes (sqrt(A)+0.3)^2.
  const ca = casualtyArea([0.04]);
  check(
    'casualty area matches the published DAS form',
    Math.abs(ca - Math.pow(Math.sqrt(0.04) + 0.3, 2)) < 1e-12,
    `${ca.toFixed(3)} m2 for a single 0.04 m2 survivor`,
  );
}

section('Result');
console.log(`${checks - failures}/${checks} checks passed`);
if (failures > 0) process.exit(1);
