import { makeRng, uniform, int, weighted, type Rng } from './rng';
import { relativeVelocity } from './orbital';
import { objectById, OBJECTS } from './objects';
import { riskScore, severityFor, SEVERITY_RANK } from './riskScore';
import type { Conjunction, ResolvedConjunction, SeparationPoint, SpaceObject } from './types';

/**
 * The synthetic conjunction set.
 *
 * ~60 events over a 72-hour horizon. Miss distance, relative velocity and
 * element-set age are drawn from the seeded generator; probability of collision
 * is then *derived* from them, so the four numbers on any given row always tell
 * a consistent story. See pcFoster below.
 */

export const CONJUNCTION_SEED = 0x434a_5f31; // "CJ_1"
export const TARGET_EVENT_COUNT = 60;
export const HORIZON_MINUTES = 72 * 60;

/** Screening threshold drawn on the detail chart, km. */
export const SCREENING_THRESHOLD_KM = 1.0;

/** Window of the precomputed separation curve, minutes either side of TCA. */
export const SEPARATION_SPAN_MIN = 40;
const SEPARATION_POINTS = 121;

/**
 * Session start. TCAs are stored as an offset in minutes from this instant, so
 * the countdown is always live no matter when the demo is opened, while the
 * underlying data stays seed-deterministic.
 */
export const SESSION_START = Date.now();

// ── Probability of collision ────────────────────────────────────────────────

/** Combined hard-body radius contribution by RCS class, km. */
const HBR: Record<SpaceObject['rcs'], number> = {
  LARGE: 0.05,
  MEDIUM: 0.034,
  SMALL: 0.02,
};

/**
 * How badly each size class is tracked, as an additive 1-sigma penalty in km.
 * A 10 cm fragment returns far less radar energy than a bus-sized spacecraft,
 * so its state is known far less precisely.
 */
const RCS_SIGMA: Record<SpaceObject['rcs'], number> = {
  LARGE: 0.05,
  MEDIUM: 0.15,
  SMALL: 0.35,
};

/**
 * Combined positional uncertainty for a pair, km.
 *
 * TLEs carry no covariance, so a 1-sigma value has to be assumed — this is the
 * assumption the detail page's data-quality panel discloses. Two things drive
 * it, and both are honest: element sets go stale, and small objects are tracked
 * worse than large ones. The consequence is the one that makes the ranking
 * interesting — a close approach between two well-tracked large objects scores
 * far above an equally close approach involving an elderly fragment, because in
 * the second case we mostly do not know where anything is.
 */
export function sigmaFor(a: SpaceObject, b: SpaceObject): number {
  return 0.9 + 0.055 * (a.age + b.age) + RCS_SIGMA[a.rcs] + RCS_SIGMA[b.rcs];
}

/**
 * Foster-style circular Pc: a 2D Gaussian miss distribution integrated over the
 * combined hard-body disc. Reduces to a clean closed form when the hard body is
 * small relative to sigma, which it always is here.
 */
function pcFoster(missKm: number, hbrKm: number, sigmaKm: number): number {
  const twoSigmaSq = 2 * sigmaKm * sigmaKm;
  return ((hbrKm * hbrKm) / twoSigmaSq) * Math.exp(-(missKm * missKm) / twoSigmaSq);
}

// ── Geometry ────────────────────────────────────────────────────────────────

/** Unit normal of an orbit plane, from inclination and RAAN. */
function planeNormal(incl: number, raan: number): [number, number, number] {
  const i = (incl * Math.PI) / 180;
  const o = (raan * Math.PI) / 180;
  return [Math.sin(i) * Math.sin(o), -Math.sin(i) * Math.cos(o), Math.cos(i)];
}

/** Angle between two orbit planes, degrees — this is what sets closing speed. */
function planeAngle(a: SpaceObject, b: SpaceObject): number {
  const na = planeNormal(a.incl, a.raan);
  const nb = planeNormal(b.incl, b.raan);
  const dot = na[0] * nb[0] + na[1] * nb[1] + na[2] * nb[2];
  return (Math.acos(Math.max(-1, Math.min(1, dot))) * 180) / Math.PI;
}

/**
 * Separation versus time.
 *
 * Two objects passing at relative velocity v have separation
 * sqrt(miss² + (v·t)²) — a hyperbola that bottoms out at the miss distance at
 * TCA. Straight-line relative motion is a good approximation over a window this
 * short.
 */
function separationCurve(missKm: number, relvKmS: number): SeparationPoint[] {
  const pts: SeparationPoint[] = [];
  for (let i = 0; i < SEPARATION_POINTS; i++) {
    const t = -SEPARATION_SPAN_MIN + (i / (SEPARATION_POINTS - 1)) * SEPARATION_SPAN_MIN * 2;
    const along = relvKmS * t * 60;
    pts.push({ t, sep: Math.sqrt(missKm * missKm + along * along) });
  }
  return pts;
}

// ── Pair selection ──────────────────────────────────────────────────────────

/**
 * The coarse apogee–perigee filter described on the landing page: two objects
 * can only conjunct if their radial bands overlap. Applying it here is what
 * keeps the generated pairs physically sensible.
 */
function altitudeBandsOverlap(a: SpaceObject, b: SpaceObject): boolean {
  return a.perigee <= b.apogee + 25 && b.perigee <= a.apogee + 25;
}

interface Draft {
  id: string;
  a: number;
  b: number;
  tcaMin: number;
  miss: number;
}

/** Scripted events, so the dashboard always opens with something urgent. */
const SCRIPTED: Draft[] = [
  // Sub-90-minute TCA between two large, well-tracked objects — lands CRITICAL
  // and gives the dashboard something genuinely urgent on first paint.
  { id: 'CJ-4429', a: 25544, b: 38078, tcaMin: 74, miss: 0.19 },
  // Second guaranteed CRITICAL.
  { id: 'CJ-4425', a: 42063, b: 23405, tcaMin: 168, miss: 0.294 },
  // The design's hero row: ISS against a Cosmos 2251 fragment.
  { id: 'CJ-4417', a: 25544, b: 34454, tcaMin: 214, miss: 0.412 },
  { id: 'CJ-4392', a: 42063, b: 33772, tcaMin: 341, miss: 0.664 },
  { id: 'CJ-4388', a: 43013, b: 52117, tcaMin: 486, miss: 0.571 },
  { id: 'CJ-4371', a: 25994, b: 52117, tcaMin: 512, miss: 1.203 },
  { id: 'CJ-4366', a: 33591, b: 8063, tcaMin: 688, miss: 0.938 },
  { id: 'CJ-4359', a: 39452, b: 30793, tcaMin: 802, miss: 2.417 },
  { id: 'CJ-4344', a: 48227, b: 23405, tcaMin: 1094, miss: 3.882 },
  { id: 'CJ-4331', a: 47953, b: 33772, tcaMin: 1210, miss: 1.744 },
  { id: 'CJ-4318', a: 38078, b: 34454, tcaMin: 1702, miss: 5.106 },
  { id: 'CJ-4302', a: 45657, b: 47953, tcaMin: 1990, miss: 4.337 },
  { id: 'CJ-4295', a: 42063, b: 30793, tcaMin: 2288, miss: 0.294 },
  { id: 'CJ-4281', a: 25544, b: 33772, tcaMin: 2604, miss: 6.771 },
  { id: 'CJ-4270', a: 23405, b: 8063, tcaMin: 2910, miss: 8.114 },
  { id: 'CJ-4263', a: 25994, b: 33591, tcaMin: 3188, miss: 3.006 },
  { id: 'CJ-4251', a: 39452, b: 34454, tcaMin: 3502, miss: 9.442 },
];

/** Miss distances: mostly unremarkable, with a deliberate tail of close ones. */
function drawMiss(rng: Rng): number {
  const band = weighted(rng, [
    ['close', 6],
    ['typical', 62],
    ['wide', 12],
    ['far', 20],
  ] as const);
  const v =
    band === 'close'
      ? uniform(rng, 0.12, 1.0)
      : band === 'typical'
        ? uniform(rng, 2.0, 15.0)
        : band === 'wide'
          ? uniform(rng, 1.0, 2.0)
          : uniform(rng, 15.0, 24.0);
  return +v.toFixed(3);
}

function build(): Conjunction[] {
  const rng = makeRng(CONJUNCTION_SEED);
  const drafts: Draft[] = [...SCRIPTED];
  const seen = new Set(SCRIPTED.map((d) => `${d.a}:${d.b}`));

  let nextId = 4248;
  let guard = 0;
  while (drafts.length < TARGET_EVENT_COUNT && guard++ < 40000) {
    const a = OBJECTS[int(rng, 0, OBJECTS.length - 1)];
    const b = OBJECTS[int(rng, 0, OBJECTS.length - 1)];
    if (a.norad === b.norad) continue;
    if (!altitudeBandsOverlap(a, b)) continue;

    const key = `${a.norad}:${b.norad}`;
    const rev = `${b.norad}:${a.norad}`;
    if (seen.has(key) || seen.has(rev)) continue;
    seen.add(key);

    drafts.push({
      id: `CJ-${nextId}`,
      a: a.norad,
      b: b.norad,
      tcaMin: int(rng, 95, HORIZON_MINUTES),
      miss: drawMiss(rng),
    });
    nextId -= int(rng, 3, 11);
  }

  return drafts
    .map((d): Conjunction => {
      const A = objectById(d.a);
      const B = objectById(d.b);

      const maxAge = Math.max(A.age, B.age);
      const sigma = sigmaFor(A, B);
      const hbr = HBR[A.rcs] + HBR[B.rcs];
      const pc = pcFoster(d.miss, hbr, sigma);

      const relv = +Math.max(
        1.5,
        Math.min(15.2, relativeVelocity(A.alt, B.alt, planeAngle(A, B))),
      ).toFixed(3);

      const sev = severityFor(pc);

      return {
        ...d,
        tca: SESSION_START + d.tcaMin * 60000,
        relv,
        pc,
        sev,
        score: riskScore({ pc, miss: d.miss, relv, maxAge }),
        maxAge: +maxAge.toFixed(1),
        sigma: +sigma.toFixed(2),
        separation: separationCurve(d.miss, relv),
      };
    })
    .sort((x, y) => x.tcaMin - y.tcaMin);
}

export const CONJUNCTIONS: Conjunction[] = build();

const BY_ID = new Map(CONJUNCTIONS.map((c) => [c.id, c]));

export const resolve = (c: Conjunction): ResolvedConjunction => ({
  ...c,
  A: objectById(c.a),
  B: objectById(c.b),
});

export const RESOLVED: ResolvedConjunction[] = CONJUNCTIONS.map(resolve);

export const conjunctionById = (id: string): ResolvedConjunction | undefined => {
  const c = BY_ID.get(id);
  return c ? resolve(c) : undefined;
};

export const SEVERITY_COUNTS = RESOLVED.reduce(
  (acc, c) => ({ ...acc, [c.sev]: acc[c.sev] + 1 }),
  { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, NOMINAL: 0 },
);

export { SEVERITY_RANK };
