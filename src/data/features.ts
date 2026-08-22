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
    id: 'conjunctions',
    label: 'Conjunctions',
    to: '/console',
    status: 'live',
    group: 'Operations',
    note: 'Ranked event table. Severity, window and class filters and every column sort genuinely filter and re-sort the data. Rows open the detail view.',
  },
  {
    id: 'detail',
    label: 'Conjunction detail',
    to: '/console',
    status: 'live',
    group: 'Operations',
    note: 'Separation chart, both object specification panels, encounter geometry and the data-quality disclosure. Reached by opening any row.',
  },
  {
    id: 'viewer',
    label: 'Orbital viewer',
    to: '/console/viewer',
    status: 'live',
    group: 'Operations',
    note: 'Time scrubber, play/pause, rate control and layer toggles all drive the canvas. Clicking an object selects it.',
  },
  {
    id: 'catalogue',
    label: 'Object catalogue',
    to: '/console/catalogue',
    status: 'live',
    group: 'Operations',
    note: 'All 400 objects, searchable, sortable and paginated. Selecting a row opens the annotated element set.',
  },
  {
    id: 'manoeuvres',
    label: 'Manoeuvre log',
    to: '/console/manoeuvres',
    status: 'live',
    group: 'Operations',
    note: 'Burn history against screened events, with status and delta-v filters. Records are synthetic and read-only — you cannot plan a new burn.',
  },
  {
    id: 'thresholds',
    label: 'Screening thresholds',
    to: '/console/thresholds',
    status: 'live',
    group: 'Configuration',
    note: 'Sets the screening floor. Changes apply immediately to the dashboard and the manoeuvre log, and persist across reloads.',
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
    status: 'not-built',
    group: 'Actions',
    note: 'Button is present on the dashboard but does nothing. No file is produced.',
  },
  {
    id: 'run',
    label: 'Run screening',
    status: 'not-built',
    group: 'Actions',
    note: 'Button is present but inert. The event set is generated once at load; there is no screening engine to re-run.',
  },
  {
    id: 'ack',
    label: 'Acknowledge event',
    status: 'not-built',
    group: 'Actions',
    note: 'Button is present on the dashboard and detail view but does not record anything.',
  },
];

export const featureById = (id: string) => FEATURES.find((f) => f.id === id);

export const COUNTS = FEATURES.reduce(
  (acc, f) => ({ ...acc, [f.status]: acc[f.status] + 1 }),
  { live: 0, partial: 0, 'not-built': 0 } as Record<FeatureStatus, number>,
);
