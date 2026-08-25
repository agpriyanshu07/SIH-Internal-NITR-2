import { HBR } from './engine/pc';
import type { ResolvedConjunction, SpaceObject } from './types';

/**
 * Conjunction Data Message — CCSDS 508.0-B-1.
 *
 * The CDM is the format the field actually exchanges. Space-Track issues them,
 * ESA's SSA services consume them, NASA CARA works in them, the US TraCSS
 * programme specifies them, and an operator's flight-dynamics tooling already
 * has a reader for them. Until this existed, everything KESSLER computed left
 * the building as a CSV that nothing downstream understands — which made the
 * console a destination rather than a stage in somebody's workflow.
 *
 * Every mandatory quantity was already being computed. TCA, miss distance and
 * relative speed are measured off the refined encounter; the object identifiers
 * and international designators come off the TLEs; collision probability is the
 * Foster value the dashboard ranks on. This file is a formatter, not a model,
 * and it deliberately introduces no new number.
 *
 * ── The covariance, and why it says DEFAULT ──────────────────────────────
 *
 * A CDM carries a position covariance per object, and this is the one field
 * where emitting the format could quietly turn an assumption into a claim. A
 * TLE has no covariance; KESSLER assumes one, discloses it everywhere it is
 * used, and lets you scale it on the thresholds screen. Writing that assumed
 * number into a field an operator reads as the output of an orbit
 * determination would be the single most damaging thing this project could do.
 *
 * The standard already has the right answer. `COVARIANCE_METHOD` takes exactly
 * two values: `CALCULATED`, meaning it came from an OD solution, and `DEFAULT`,
 * meaning a default covariance was substituted. Ours is `DEFAULT`, on every
 * object, in every message, with a COMMENT above it naming the model and the
 * value. A reader who checks that field learns the truth without reading our
 * documentation, which is the entire point of using a standard.
 */

/**
 * What a caller has to supply that the event itself does not carry.
 *
 * `snapshotEpochMs` is required rather than defaulted, and that is deliberate:
 * element-set age in this codebase is measured from the snapshot capture
 * instant, so the last-observation time can only be reconstructed by someone
 * who knows that instant. A default would have to be either the wall clock —
 * which is wrong, and wrong in a way that still looks like a plausible date —
 * or an import of `data/objects`, which drags Vite's `?raw` snapshot loaders
 * into every consumer including the Node validation suite. Passing it in keeps
 * this module a pure formatter with no data dependency at all.
 *
 * `creationMs` defaults to now because that is genuinely what it means, and is
 * a parameter so a test can produce a byte-stable message.
 */
export interface CdmOptions {
  snapshotEpochMs: number;
  creationMs?: number;
  /**
   * Which snapshot group an object came from, for the JSON form's provenance
   * fields. Injected rather than imported for the same reason as the epoch:
   * the only module that knows this reads the TLE files through Vite's `?raw`
   * loader, and importing it here would make this formatter unloadable in
   * Node. Omitting it drops two non-standard fields and nothing else — no
   * mandatory CDM keyword depends on it.
   */
  groupOf?: (norad: number) => string | undefined;
}

/** Producer identity, per CCSDS 508.0-B-1 §3.2. */
const ORIGINATOR = 'KESSLER';
const CATALOG_NAME = 'CELESTRAK GP';

/** CDM timestamps are ISO 8601 with no zone suffix — UTC is implied by spec. */
function cdmTime(ms: number): string {
  const d = new Date(ms);
  const p = (n: number, w = 2) => String(n).padStart(w, '0');
  return (
    `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}T` +
    `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())}.` +
    `${p(d.getUTCMilliseconds(), 3)}`
  );
}

/**
 * `16040A` -> `2016-040A`.
 *
 * A TLE writes the international designator with a two-digit year and no
 * separators; the CDM wants the full form. The century rule is the standard
 * one for this field: Sputnik 1 was 1957, so 57-99 is 19xx and 00-56 is 20xx.
 * Anything that does not match the expected shape is passed through rather than
 * mangled — a designator we cannot parse is better emitted as-is than emitted
 * wrong.
 */
export function intlDesignator(intl: string): string {
  const m = /^(\d{2})(\d{3})([A-Z]{1,3})$/.exec(intl.trim().toUpperCase());
  if (!m) return intl;
  const yy = Number(m[1]);
  return `${yy >= 57 ? 1900 + yy : 2000 + yy}-${m[2]}${m[3]}`;
}

/*
 * CDM `OBJECT_TYPE` takes a fixed vocabulary — PAYLOAD, ROCKET BODY, DEBRIS,
 * UNKNOWN, OTHER — and `ObjectType` in this codebase is already the first three
 * of it verbatim. So there is no mapping to write, and writing one would only
 * create somewhere for the two to drift apart.
 */
const objectType = (o: SpaceObject): string => o.type;

/**
 * Split the pair's assumed sigma across the two objects.
 *
 * `sigmaFor` produces one combined 1-sigma for the pair, because that is what
 * the Foster integral takes. A CDM wants a covariance per object, so the
 * combined figure has to be attributed — and the attribution has to be stated,
 * because there is no unique way to do it.
 *
 * Each object gets the share of the model it is responsible for: half the
 * constant floor, its own element-set age term, and its own size-class penalty.
 * Those weights are then applied in quadrature, so that
 *
 *     sigma_1^2 + sigma_2^2 = sigma_pair^2
 *
 * holds exactly. That identity is what makes the emitted messages consistent
 * with the Pc we ranked on: a reader who combines our two covariances the way
 * conjunction assessment actually combines them recovers the number we used,
 * rather than something close to it.
 *
 * The weights are attribution, not measurement, and the COMMENT block in every
 * message says so.
 */
export function splitSigma(
  event: ResolvedConjunction,
): { a: number; b: number } {
  const contribution = (o: SpaceObject) =>
    0.45 + 0.055 * o.age + { LARGE: 0.05, MEDIUM: 0.15, SMALL: 0.35 }[o.rcs];
  const ca = contribution(event.A);
  const cb = contribution(event.B);
  const total = ca + cb;
  // Degenerate only if both contributions are zero, which the 0.45 floor makes
  // impossible; the guard is here so a future change to the model cannot make
  // this silently produce NaN.
  if (!(total > 0)) return { a: event.sigma / Math.SQRT2, b: event.sigma / Math.SQRT2 };
  return {
    a: event.sigma * Math.sqrt(ca / total),
    b: event.sigma * Math.sqrt(cb / total),
  };
}

/** Metres, from a value in km, at CDM precision. */
const m = (km: number, dp = 3) => (km * 1000).toFixed(dp);

/**
 * Per-object metadata and covariance block.
 *
 * The covariance is isotropic in RTN because the model it comes from is
 * isotropic: `sigmaFor` produces one number, not an ellipsoid, so the only
 * honest matrix is a diagonal one with that number on each axis. A real OD
 * covariance is strongly along-track dominant, and inventing that shape here
 * would be inventing information. Units are m^2, per the standard.
 */
function objectBlock(
  slot: 'OBJECT1' | 'OBJECT2',
  o: SpaceObject,
  sigmaKm: number,
  snapshotEpochMs: number,
): string {
  const varM2 = (sigmaKm * 1000) ** 2;
  const v = varM2.toFixed(3);
  return [
    `OBJECT                        = ${slot}`,
    `OBJECT_DESIGNATOR             = ${o.norad}`,
    `CATALOG_NAME                  = ${CATALOG_NAME}`,
    `OBJECT_NAME                   = ${o.name}`,
    `INTERNATIONAL_DESIGNATOR      = ${intlDesignator(o.intl)}`,
    `OBJECT_TYPE                   = ${objectType(o)}`,
    `OPERATOR_ORGANIZATION         = ${o.op}`,
    `EPHEMERIS_NAME                = NONE`,
    `COMMENT Covariance is not measured. A TLE carries none, so this is`,
    `COMMENT KESSLER's assumed 1-sigma of ${sigmaKm.toFixed(3)} km, isotropic in RTN,`,
    `COMMENT from element-set age ${o.age.toFixed(2)} d and RCS class ${o.rcs}.`,
    `COVARIANCE_METHOD             = DEFAULT`,
    `MANEUVERABLE                  = N/A`,
    `REF_FRAME                     = ITRF`,
    `ORBIT_CENTER                  = EARTH`,
    /*
     * Measured back from the SNAPSHOT instant, not from the wall clock. Element
     * -set age in this codebase is the gap between an object's TLE epoch and the
     * capture instant, and the console clock is anchored there for the same
     * reason — so subtracting the age from Date.now() would put the last
     * observation at a time that has nothing to do with the element set it
     * describes, and would make the message different every time it was
     * exported. This reproduces the TLE's own epoch, which is what the field
     * means.
     */
    `TIME_LASTOB_START             = ${cdmTime(snapshotEpochMs - o.age * 86400000)}`,
    `TIME_LASTOB_END               = ${cdmTime(snapshotEpochMs - o.age * 86400000)}`,
    `CR_R                          = ${v} [m**2]`,
    `CT_R                          = 0.000 [m**2]`,
    `CT_T                          = ${v} [m**2]`,
    `CN_R                          = 0.000 [m**2]`,
    `CN_T                          = 0.000 [m**2]`,
    `CN_N                          = ${v} [m**2]`,
  ].join('\r\n');
}

/**
 * One event as a CDM in Keyword=Value Notation, the format the standard defines
 * first and the one Space-Track serves by default.
 *
 * `creationMs` is a parameter rather than `Date.now()` so that a test can
 * produce a byte-stable message, and so the build-time exporter and the browser
 * cannot disagree about when a file was written.
 */
export function toCdmKvn(event: ResolvedConjunction, opts: CdmOptions): string {
  const { snapshotEpochMs, creationMs = Date.now() } = opts;
  const s = splitSigma(event);
  const hbrM = (HBR[event.A.rcs] + HBR[event.B.rcs]) * 1000;

  return [
    `CCSDS_CDM_VERS                = 1.0`,
    `COMMENT Generated by KESSLER, a screening prototype. NOT an operational`,
    `COMMENT conjunction assessment product and not a basis for a manoeuvre.`,
    `COMMENT Positions are SGP4 propagations of public two-line element sets;`,
    `COMMENT the covariance on both objects is assumed, not determined.`,
    `CREATION_DATE                 = ${cdmTime(creationMs)}`,
    `ORIGINATOR                    = ${ORIGINATOR}`,
    `MESSAGE_FOR                   = ${event.A.name}`,
    `MESSAGE_ID                    = ${event.id}`,
    ``,
    `COMMENT ── Relative metadata ──`,
    `TCA                           = ${cdmTime(event.tca)}`,
    `MISS_DISTANCE                 = ${m(event.miss)} [m]`,
    `RELATIVE_SPEED                = ${m(event.relv)} [m/s]`,
    `COMMENT Foster 1992 circular model over a combined hard-body radius of`,
    `COMMENT ${hbrM.toFixed(1)} m and an assumed pair 1-sigma of ${event.sigma.toFixed(3)} km.`,
    `COMMENT Per-object sigmas below are that pair value attributed by each`,
    `COMMENT object's own age and size class, in quadrature, so they recombine`,
    `COMMENT to the value the probability was computed from.`,
    `COLLISION_PROBABILITY         = ${event.pc.toExponential(5)}`,
    `COLLISION_PROBABILITY_METHOD  = FOSTER-1992`,
    ``,
    objectBlock('OBJECT1', event.A, s.a, snapshotEpochMs),
    ``,
    objectBlock('OBJECT2', event.B, s.b, snapshotEpochMs),
    ``,
  ].join('\r\n');
}

/**
 * The same message as JSON, shaped like the objects Space-Track serves from
 * `/class/cdm_public`, because that is what most tooling written against CDMs
 * in the last decade actually parses.
 */
export function toCdmJson(
  event: ResolvedConjunction,
  opts: CdmOptions,
): Record<string, string | number> {
  const { creationMs = Date.now(), groupOf } = opts;
  const s = splitSigma(event);
  return {
    CCSDS_CDM_VERS: '1.0',
    CREATION_DATE: cdmTime(creationMs),
    ORIGINATOR,
    MESSAGE_FOR: event.A.name,
    MESSAGE_ID: event.id,
    TCA: cdmTime(event.tca),
    MISS_DISTANCE: Number(m(event.miss)),
    RELATIVE_SPEED: Number(m(event.relv)),
    COLLISION_PROBABILITY: event.pc,
    COLLISION_PROBABILITY_METHOD: 'FOSTER-1992',

    SAT1_OBJECT_DESIGNATOR: event.A.norad,
    SAT1_OBJECT_NAME: event.A.name,
    SAT1_INTERNATIONAL_DESIGNATOR: intlDesignator(event.A.intl),
    SAT1_OBJECT_TYPE: objectType(event.A),
    SAT1_OPERATOR_ORGANIZATION: event.A.op,
    SAT1_COVARIANCE_METHOD: 'DEFAULT',
    SAT1_SIGMA_KM_ASSUMED: Number(s.a.toFixed(4)),
    SAT1_ELEMENT_SET_AGE_DAYS: Number(event.A.age.toFixed(3)),
    SAT1_RCS_CLASS_ASSUMED: event.A.rcs,
    SAT1_CATALOG_GROUP: groupOf?.(event.A.norad) ?? 'UNKNOWN',

    SAT2_OBJECT_DESIGNATOR: event.B.norad,
    SAT2_OBJECT_NAME: event.B.name,
    SAT2_INTERNATIONAL_DESIGNATOR: intlDesignator(event.B.intl),
    SAT2_OBJECT_TYPE: objectType(event.B),
    SAT2_OPERATOR_ORGANIZATION: event.B.op,
    SAT2_COVARIANCE_METHOD: 'DEFAULT',
    SAT2_SIGMA_KM_ASSUMED: Number(s.b.toFixed(4)),
    SAT2_ELEMENT_SET_AGE_DAYS: Number(event.B.age.toFixed(3)),
    SAT2_RCS_CLASS_ASSUMED: event.B.rcs,
    SAT2_CATALOG_GROUP: groupOf?.(event.B.norad) ?? 'UNKNOWN',
  };
}

/**
 * Many events as one file.
 *
 * A CDM describes exactly one conjunction, so a set of them is a concatenation
 * rather than a container — which is how Space-Track serves a bulk KVN pull.
 * The separator is a comment line so the result still parses keyword-by-keyword
 * for a reader that scans rather than splits.
 */
export function cdmBundleKvn(
  events: ResolvedConjunction[],
  opts: CdmOptions,
): string {
  return events
    .map((e) => toCdmKvn(e, opts))
    .join('\r\nCOMMENT ════════════════════════════════════════════════\r\n');
}

export const cdmBundleJson = (
  events: ResolvedConjunction[],
  opts: CdmOptions,
): string => JSON.stringify(events.map((e) => toCdmJson(e, opts)), null, 2);
