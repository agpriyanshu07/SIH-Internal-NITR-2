import { makeRng, int, pick, uniform, weighted } from './rng';
import { RESOLVED, SESSION_START } from './conjunctions';
import { OBJECTS, groupOf, objectById } from './objects';
import type { ResolvedConjunction, SpaceObject } from './types';

/**
 * Synthetic manoeuvre log.
 *
 * Burns are generated *against* screened events wherever possible, so the log
 * tells a coherent story with the conjunction table: a close approach appears,
 * an operator plans a burn, the post-manoeuvre miss distance is larger.
 */

export const MANOEUVRE_SEED = 0x4d4e_5601; // "MNV\1"

export type BurnStatus = 'EXECUTED' | 'PLANNED' | 'UNDER REVIEW' | 'CANCELLED';
export type BurnAxis = 'ALONG-TRACK' | 'RADIAL' | 'CROSS-TRACK';

export interface Manoeuvre {
  id: string;
  /** The operator's own asset being moved. */
  norad: number;
  object: SpaceObject;
  /** The event that prompted the burn, when there was one. */
  cause?: ResolvedConjunction;
  /** Epoch ms. Negative offsets are burns already in the past. */
  epoch: number;
  /** Minutes from session start; negative is history. */
  epochMin: number;
  deltaV: number;
  axis: BurnAxis;
  status: BurnStatus;
  /** Miss distance the burn is predicted to produce, km. */
  postMissKm?: number;
  /** Miss distance before the burn, km. */
  preMissKm?: number;
  operator: string;
  note: string;
}

const NOTES: Record<BurnStatus, string[]> = {
  EXECUTED: [
    'Burn confirmed by ranging. Post-manoeuvre state vector uplinked.',
    'Nominal execution. Screening re-run against updated ephemeris.',
    'Executed one revolution early to preserve the ground track.',
  ],
  PLANNED: [
    'Command load staged. Awaiting final screening pass before upload.',
    'Scheduled at the next apogee crossing to minimise propellant.',
    'Held pending a Conjunction Data Message from the 18th SDS.',
  ],
  'UNDER REVIEW': [
    'Awaiting operator sign-off. Element set age exceeds internal limits.',
    'Flight dynamics reviewing whether a burn is warranted at this Pc.',
    'Deferred one screening cycle to see whether the geometry improves.',
  ],
  CANCELLED: [
    'Stood down after refreshed elements moved the miss distance out.',
    'Cancelled — secondary object reported as decayed.',
    'Superseded by a later, larger burn on the same asset.',
  ],
};

/*
 * Snapshot groups whose objects have an operator who could fly a burn.
 *
 * Type alone is not enough, for the same reason it was not enough for the
 * station-keeping tail below: COSMOS 2251 is a payload by class and has been
 * derelict since 2009, so filtering on PAYLOAD put burns in the mouths of dead
 * satellites.
 */
const OPERABLE = new Set(['stations', 'indian-assets']);

function build(): Manoeuvre[] {
  const rng = makeRng(MANOEUVRE_SEED);

  // Only active payloads get manoeuvred — debris and spent stages cannot.
  /*
   * Only objects that can actually manoeuvre.
   *
   * Filtering on type === 'PAYLOAD' was not enough once the catalogue became
   * real: COSMOS 2251 is a payload by class and has been a derelict since 2009,
   * so the log cheerfully showed burns being flown by a dead satellite. An
   * object needs an active operator, and in this snapshot that means the
   * stations group — crewed modules and their visiting vehicles.
   */
  const manoeuvrable = OBJECTS.filter(
    (o) => o.type === 'PAYLOAD' && groupOf(o.norad) === 'stations',
  );
  const out: Manoeuvre[] = [];

  /*
   * Events worth a burn, most severe first — which the comment here always
   * claimed and the code never did. RESOLVED is ordered by time of closest
   * approach, so `.slice(0, 26)` took the twenty-six SOONEST events rather than
   * the worst, and in this catalogue all twenty-six were debris against debris.
   * Nothing had a controllable side, the loop below pushed nothing, and the
   * log's "prompted by an event" filter matched 0 of 16 burns — a chip that
   * could never light up.
   */
  const operableSide = (e: ResolvedConjunction) =>
    OPERABLE.has(groupOf(e.a) ?? '')
      ? objectById(e.a)
      : OPERABLE.has(groupOf(e.b) ?? '')
        ? objectById(e.b)
        : null;

  /*
   * The cap applies to events that could produce a burn, not to events in
   * general. Slicing first threw away the one MEDIUM event with a flyable
   * asset because twenty-six HIGH debris-on-debris passes outranked it — and
   * those twenty-six can never produce a burn, so they were spending the budget
   * without being able to use it.
   */
  const prompting = RESOLVED
    .filter((e) => e.sev === 'CRITICAL' || e.sev === 'HIGH' || e.sev === 'MEDIUM')
    .filter((e) => operableSide(e) !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 26);

  let id = 1180;

  for (const event of prompting) {
    // Whichever side of the pair is actually controllable.
    const asset = operableSide(event);
    if (!asset) continue;

    const status = weighted(rng, [
      ['PLANNED', 34],
      ['EXECUTED', 30],
      ['UNDER REVIEW', 22],
      ['CANCELLED', 14],
    ] as const) as BurnStatus;

    const deltaV = +uniform(rng, 0.04, 1.85).toFixed(3);
    // A burn buys separation roughly in proportion to delta-v and lead time.
    const gain = deltaV * uniform(rng, 3.5, 11);

    // Draw the lead time once — epoch and epochMin must describe the same instant.
    const epochMin = event.tcaMin - int(rng, 90, 900);

    out.push({
      id: `MNV-${id}`,
      norad: asset.norad,
      object: asset,
      cause: event,
      // Burns are placed a few hours ahead of the event they answer.
      epochMin,
      epoch: SESSION_START + epochMin * 60000,
      deltaV,
      axis: weighted(rng, [
        ['ALONG-TRACK', 62],
        ['RADIAL', 26],
        ['CROSS-TRACK', 12],
      ] as const) as BurnAxis,
      status,
      preMissKm: event.miss,
      postMissKm: status === 'CANCELLED' ? undefined : +(event.miss + gain).toFixed(3),
      operator: asset.op,
      note: pick(rng, NOTES[status]),
    });
    id -= int(rng, 2, 9);
  }

  // A tail of routine station-keeping, unconnected to any event.
  for (let i = 0; i < 16; i++) {
    const asset = manoeuvrable[int(rng, 0, manoeuvrable.length - 1)];
    const epochMin = -int(rng, 60, 20160); // up to two weeks of history
    out.push({
      id: `MNV-${id}`,
      norad: asset.norad,
      object: asset,
      epochMin,
      epoch: SESSION_START + epochMin * 60000,
      deltaV: +uniform(rng, 0.01, 0.34).toFixed(3),
      axis: 'ALONG-TRACK',
      status: 'EXECUTED',
      operator: asset.op,
      note: 'Routine station-keeping. Not prompted by a screened event.',
    });
    id -= int(rng, 2, 9);
  }

  return out.sort((a, b) => b.epochMin - a.epochMin);
}

export const MANOEUVRES: Manoeuvre[] = build();

export const BURN_STATUS_SEV: Record<BurnStatus, 'LOW' | 'MEDIUM' | 'HIGH' | 'NOMINAL'> = {
  EXECUTED: 'LOW',
  PLANNED: 'HIGH',
  'UNDER REVIEW': 'MEDIUM',
  CANCELLED: 'NOMINAL',
};
