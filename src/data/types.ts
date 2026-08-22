export type ObjectType = 'PAYLOAD' | 'ROCKET BODY' | 'DEBRIS';

export type RcsSize = 'LARGE' | 'MEDIUM' | 'SMALL';

/** Severity bands are defined by probability of collision — see riskScore.ts. */
export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NOMINAL';

export interface SpaceObject {
  norad: number;
  name: string;
  type: ObjectType;
  /** Owner or, for derelicts, the responsible state. */
  op: string;
  /** International designator, e.g. `98067A`. */
  intl: string;
  launch: string;
  /** Mean altitude, km. */
  alt: number;
  apogee: number;
  perigee: number;
  ecc: number;
  incl: number;
  raan: number;
  argp: number;
  ma: number;
  /** Period, minutes. */
  period: number;
  rcs: RcsSize;
  /** Age of this object's element set, in days. */
  age: number;
  tle: [string, string];
}

/** One point of the separation-versus-time curve. */
export interface SeparationPoint {
  /** Minutes from TCA; negative is before. */
  t: number;
  /** Separation, km. */
  sep: number;
}

export interface Conjunction {
  id: string;
  /** NORAD id of the primary. */
  a: number;
  /** NORAD id of the secondary. */
  b: number;
  /** TCA as epoch milliseconds. */
  tca: number;
  /** Minutes from session start to TCA — the stable, seed-derived quantity. */
  tcaMin: number;
  /** Miss distance, km. */
  miss: number;
  /** Relative velocity, km/s. */
  relv: number;
  /** Probability of collision. */
  pc: number;
  /** 0–100. */
  score: number;
  sev: Severity;
  /** Age of the older element set in the pair, days. */
  maxAge: number;
  /** Assumed 1-sigma positional uncertainty used for Pc, km. */
  sigma: number;
  separation: SeparationPoint[];
}

/** A conjunction with both objects resolved — what the UI actually renders. */
export interface ResolvedConjunction extends Conjunction {
  A: SpaceObject;
  B: SpaceObject;
}
