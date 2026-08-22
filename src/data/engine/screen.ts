import * as satellite from 'satellite.js';

/**
 * Coarse conjunction screening over a real SGP4 propagation.
 *
 * The cascade is three stages, and every stage reports how many pairs it let
 * through. Those counts are what the dashboard shows — the reduction story has
 * to be measured, not asserted.
 *
 *   1. all pairs                     n(n-1)/2
 *   2. radial overlap filter         orbits whose [perigee, apogee] bands can
 *                                    never come within SCREEN_KM of each other
 *   3. distance gate                 pairs that actually sample inside
 *                                    SCREEN_KM at some timestep
 *
 * Stage 3's survivors are candidates, not events. Each still has to be refined
 * to a true time of closest approach and pass a miss-distance gate before it is
 * a conjunction — see refine.ts.
 */

const MU = 398600.4418; // km³/s²

/** Sampling interval, seconds. */
export const STEP_S = 60;

/**
 * Coarse screening radius, km.
 *
 * NOT arbitrary, and not a tuning knob. Two objects in LEO close at up to
 * ~15 km/s, so between two samples STEP_S apart their separation can change by
 * v·Δt = 900 km — meaning a pass can dip to zero and recover entirely between
 * samples unless the gate is at least v·Δt/2 = 450 km. Shrinking this does not
 * make the screen faster in any honest sense: it makes it silently miss real
 * close approaches while reporting a smaller, tidier number of events.
 */
export const SCREEN_KM = (15 * STEP_S) / 2;

/**
 * Separation below which a pair is treated as co-orbiting rather than
 * conjuncting, km.
 *
 * Real catalogues contain objects that are physically attached or deliberately
 * station-keeping: ISS modules, a docked Progress, CSS modules. Their
 * separation is ~0 at every timestep, which a naive screen reports as the most
 * urgent conjunction on the board. A genuine close approach is a *pass* — the
 * two objects are far apart before and after. So a pair only counts if it also
 * separates beyond this distance somewhere in the window.
 */
export const CO_ORBIT_KM = 100;

export interface ScreenCandidate {
  /** Index into the propagated set. */
  i: number;
  j: number;
  /** Smallest sampled separation, km — a coarse bound, not the miss distance. */
  d: number;
  /** Timestep of that sample, as epoch ms. */
  t: number;
}

/** Measured pair-reduction cascade — every figure counted, none estimated. */
export interface ScreenCascade {
  objects: number;
  totalPairs: number;
  afterRadialFilter: number;
  candidates: number;
  /** Pairs dropped as co-orbiting or docked rather than conjuncting. */
  coOrbiting: number;
  /** SGP4 state evaluations performed. */
  propagations: number;
  steps: number;
  elapsedMs: number;
}

export interface ScreenResult {
  candidates: ScreenCandidate[];
  cascade: ScreenCascade;
}

/**
 * Perigee and apogee radii straight off the propagator's own mean motion, km
 * from Earth centre. Used for the radial filter, which is pure geometry and so
 * needs no propagation at all.
 */
export function periApo(rec: satellite.SatRec): [number, number] {
  const n = rec.no / 60; // rad/min -> rad/s
  const a = Math.cbrt(MU / (n * n));
  return [a * (1 - rec.ecco), a * (1 + rec.ecco)];
}

export interface ScreenOptions {
  start: Date;
  hours: number;
  /** Called with 0–1 as the sweep proceeds, for the worker progress bar. */
  onProgress?: (fraction: number) => void;
}

export function screen(
  recs: satellite.SatRec[],
  { start, hours, onProgress }: ScreenOptions,
): ScreenResult {
  const t0 = Date.now();
  const steps = Math.round((hours * 3600) / STEP_S);
  const n = recs.length;
  const totalPairs = (n * (n - 1)) / 2;

  // ── Stage 2: radial overlap ───────────────────────────────────────────────
  // Done once, over pairs, before any propagation — the whole point of a coarse
  // filter is that it costs nothing. (Evaluating it inside the time loop, as is
  // tempting, would run it `steps` times for the same answer.)
  const pa = recs.map(periApo);
  const pairI: number[] = [];
  const pairJ: number[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (pa[i][0] - pa[j][1] > SCREEN_KM) continue;
      if (pa[j][0] - pa[i][1] > SCREEN_KM) continue;
      pairI.push(i);
      pairJ.push(j);
    }
  }
  const nPairs = pairI.length;

  // ── Stage 3: distance gate over the propagated sweep ──────────────────────
  // dMin drives the candidate decision; dMax is what separates a real pass from
  // a docked or station-keeping pair.
  const dMin = new Float64Array(nPairs).fill(Infinity);
  const dMax = new Float64Array(nPairs).fill(0);
  const tMin = new Float64Array(nPairs);

  const px = new Float64Array(n);
  const py = new Float64Array(n);
  const pz = new Float64Array(n);
  const ok = new Uint8Array(n);

  let propagations = 0;
  const startMs = start.getTime();

  for (let k = 0; k < steps; k++) {
    const tMs = startMs + k * STEP_S * 1000;
    const t = new Date(tMs);

    for (let i = 0; i < n; i++) {
      const pv = satellite.propagate(recs[i], t);
      propagations++;
      if (pv?.position) {
        px[i] = pv.position.x;
        py[i] = pv.position.y;
        pz[i] = pv.position.z;
        ok[i] = 1;
      } else {
        // Decayed or numerically diverged at this instant — skip, don't guess.
        ok[i] = 0;
      }
    }

    for (let p = 0; p < nPairs; p++) {
      const i = pairI[p];
      const j = pairJ[p];
      if (!ok[i] || !ok[j]) continue;
      const dx = px[i] - px[j];
      const dy = py[i] - py[j];
      const dz = pz[i] - pz[j];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < dMin[p]) {
        dMin[p] = d;
        tMin[p] = tMs;
      }
      if (d > dMax[p]) dMax[p] = d;
    }

    if (onProgress && (k & 15) === 0) onProgress(k / steps);
  }
  onProgress?.(1);

  const candidates: ScreenCandidate[] = [];
  let coOrbiting = 0;
  for (let p = 0; p < nPairs; p++) {
    if (dMin[p] > SCREEN_KM) continue;
    if (dMax[p] < CO_ORBIT_KM) {
      coOrbiting++;
      continue;
    }
    candidates.push({ i: pairI[p], j: pairJ[p], d: dMin[p], t: tMin[p] });
  }

  return {
    candidates,
    cascade: {
      objects: n,
      totalPairs,
      afterRadialFilter: nPairs,
      candidates: candidates.length,
      coOrbiting,
      propagations,
      steps,
      elapsedMs: Date.now() - t0,
    },
  };
}
