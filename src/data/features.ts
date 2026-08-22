/**
 * What actually works in this prototype.
 *
 * Single source of truth for both the sidebar (which marks unbuilt routes) and
 * the Prototype status screen. Keeping it as data rather than scattered
 * `disabled` props means the console can never claim to do something it can't.
 */

export type FeatureStatus = 'live' | 'partial' | 'not-built';

export interface Feature {
  id: string;
  label: string;
  /** Route, when there is one to go to. */
  to?: string;
  status: FeatureStatus;
  group: 'Operations' | 'Configuration' | 'Account' | 'Actions';
  /** Plain-language statement of exactly what does and does not happen. */
  note: string;
}

export const STATUS_LABEL: Record<FeatureStatus, string> = {
  live: 'LIVE',
  partial: 'PARTIAL',
  'not-built': 'NOT BUILT',
};

/** Maps onto the severity palette so the chips read at a glance. */
export const STATUS_SEV: Record<FeatureStatus, 'LOW' | 'MEDIUM' | 'NOMINAL'> = {
  live: 'LOW',
  partial: 'MEDIUM',
  'not-built': 'NOMINAL',
};

export const FEATURES: Feature[] = [
  {
    id: 'engine',
    label: 'Conjunction screening engine',
    status: 'live',
    group: 'Operations',
    note: 'Real SGP4 (satellite.js) over real element sets. Coarse 60 s sweep with a 450 km gate derived from the step size and the ~15 km/s maximum closing speed, then bisection on the sign change of range rate for the exact time of closest approach. Miss distance and relative velocity are measured at that instant. `npm run validate` checks it against brute-force all-pairs and known ISS geometry.',
  },
  {
    id: 'data',
    label: 'Orbital data',
    status: 'live',
    group: 'Operations',
    note: 'A committed CelesTrak GP snapshot — 840 real tracked objects across four groups, all captured at one instant so their epochs are mutually consistent. Bundled into the build, so the console makes no network request at any point. The console clock is anchored to the capture instant, because propagating these element sets from today would be arithmetic rather than prediction.',
  },
  {
    id: 'covariance',
    label: 'Positional uncertainty',
    status: 'partial',
    group: 'Operations',
    note: 'A TLE carries no covariance, so the 1-sigma used for Pc is ASSUMED, not measured: it grows with real element-set age and with a radar cross-section class inferred from object type, since RCS lives in the SATCAT and not in a TLE. Both assumptions are disclosed on the detail view. The Thresholds screen exposes the sigma as a scale control and re-bands every event live, so you can see how much of the severity ranking rests on it.',
  },
  {
    id: 'conjunctions',
    label: 'Conjunctions',
    to: '/console',
    status: 'live',
    group: 'Operations',
    note: 'Ranked event table over real SGP4-screened conjunctions. Severity, window and class filters and every column sort genuinely filter and re-sort the data. Rows open the detail view.',
  },
  {
    id: 'detail',
    label: 'Conjunction detail',
    to: '/console',
    status: 'live',
    group: 'Operations',
    note: 'Separation chart, both object specification panels, encounter geometry and the data-quality disclosure. The separation curve is propagated on demand from both element sets, not fitted. Reached by opening any row.',
  },
  {
    id: 'viewer',
    label: 'Orbital viewer',
    to: '/console/viewer',
    status: 'live',
    group: 'Operations',
    note: 'Time scrubber, play/pause, rate control and layer toggles all drive the canvas, on the same snapshot-anchored clock as the rest of the console. Clicking an object selects it. The orbits themselves are a SCHEMATIC: circles drawn from each object\'s real inclination, RAAN and mean motion, not SGP4 output. Positions are right to a glance, not to a kilometre — the conjunction geometry on the detail view is the propagated one.',
  },
  {
    id: 'catalogue',
    label: 'Object catalogue',
    to: '/console/catalogue',
    status: 'live',
    group: 'Operations',
    note: 'The whole screened catalogue, searchable, sortable and paginated. Element sets are the real committed TLEs; selecting a row opens the annotated set.',
  },
  {
    id: 'manoeuvres',
    label: 'Manoeuvre log',
    to: '/console/manoeuvres',
    status: 'live',
    group: 'Operations',
    note: 'Two halves, and they are not equally real. The burn HISTORY is synthetic and read-only — no manoeuvre in that table was ever planned or flown. The burn ADVISOR beside it is live: pick a real screened event, propose a delta-v, and it applies the first-order along-track result (dS = 3 x dV x t) against the propagated miss distance, re-deriving Pc and severity. It reports a range, not a number, because an along-track displacement is not necessarily across the miss vector. It does NOT re-propagate: there is no post-burn state vector and so no check that the burn merely creates a different conjunction with a third object.',
  },
  {
    id: 'thresholds',
    label: 'Screening thresholds',
    to: '/console/thresholds',
    status: 'live',
    group: 'Configuration',
    note: 'Sets the screening floor and the assumed positional uncertainty. Changes apply immediately to the dashboard and the manoeuvre log, and persist across reloads.',
  },
  {
    id: 'signin',
    label: 'Sign in',
    to: '/signin',
    status: 'partial',
    group: 'Account',
    note: 'The form validates and sets a local display name used by the console. There is no backend, so nothing is authenticated and no credential is checked or stored.',
  },
  {
    id: 'assets',
    label: 'Asset register',
    status: 'not-built',
    group: 'Configuration',
    note: 'Would let an operator declare which objects are theirs. Not built — the prototype screens the whole catalogue instead.',
  },
  {
    id: 'alerts',
    label: 'Alert routing',
    status: 'not-built',
    group: 'Configuration',
    note: 'Would configure email and webhook delivery. Not built, and there is no network access to deliver anything.',
  },
  {
    id: 'apikeys',
    label: 'API keys',
    status: 'not-built',
    group: 'Configuration',
    note: 'Would issue and revoke tokens. Not built — there is no API behind this prototype.',
  },
  {
    id: 'export',
    label: 'Export CSV',
    status: 'live',
    group: 'Actions',
    note: 'Downloads the conjunction table exactly as filtered and sorted on screen: event id, TCA in UTC, miss distance, relative velocity, Pc, score, severity, sigma, element-set age and both objects. Full precision, not display precision.',
  },
  {
    id: 'run',
    label: 'Run screening',
    status: 'live',
    group: 'Actions',
    note: 'Runs the real screening engine in a Web Worker with live progress: SGP4 propagation of every catalogued object over the configured horizon, a coarse distance screen, then bisection on range rate for each candidate. A 72 h run is about 3.6 million propagations and takes roughly twenty seconds. It reproduces the committed result exactly, because it is the same code.',
  },
  {
    id: 'ack',
    label: 'Acknowledge event',
    status: 'partial',
    group: 'Actions',
    note: 'Marks an event acknowledged and remembers it across reloads, in this browser only. There is no backend, so nothing is recorded against an operator, nothing is sent, and no one else can see it.',
  },
];

export const featureById = (id: string) => FEATURES.find((f) => f.id === id);

export const COUNTS = FEATURES.reduce(
  (acc, f) => ({ ...acc, [f.status]: acc[f.status] + 1 }),
  { live: 0, partial: 0, 'not-built': 0 } as Record<FeatureStatus, number>,
);
