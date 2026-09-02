/**
 * Presenter Mode script.
 *
 * This is `DEMO.md` §2 ("The live demo path") turned into data a component can
 * walk through. Every route, event ID and figure below is taken verbatim from
 * that file — this is not a second script that can drift from the one the
 * team actually rehearses against. If the demo path changes, change DEMO.md
 * first and this file second, in the same commit, the same rule the feature
 * registry already lives by.
 *
 * `target` names a `data-presenter="…"` attribute placed on the panel or
 * control the step is about — see the routes it names (Landing, Dashboard,
 * ConjunctionDetail, ManoeuvreLog, Analysis, Status) for where. `null` means
 * "spotlight nothing, just show the caption" — used for the closing beat,
 * where the whole page is the point rather than one panel.
 */

export interface PresenterStep {
  /** Stable id, for React keys and for `#presenter=<id>` style debugging. */
  id: string;
  /** Where NavLink/useNavigate should be pointed for this step. */
  route: string;
  /** The `data-presenter` attribute value to spotlight, or null. */
  target: string | null;
  /** Small caps label above the caption — which screen this is. */
  eyebrow: string;
  /** The talking point, drawn from DEMO.md. Read aloud, not summarised. */
  caption: string;
}

/** The real top-ranked ISRO-asset event in the committed run — DEMO.md §2. */
export const DEMO_EVENT_ID = 'CJ-34550-41599';

export const PRESENTER_SCRIPT: PresenterStep[] = [
  {
    id: 'landing-hero',
    route: '/',
    target: 'hero-canvas',
    eyebrow: 'LANDING · /',
    caption:
      'Every object on that globe is a real element set — it is a schematic, not a propagation, and the label says so. The landing page is context, not the product.',
  },
  {
    id: 'dashboard-cascade-funnel',
    route: '/console',
    target: 'cascade-panel',
    eyebrow: 'DASHBOARD · /console',
    caption:
      '859 objects → 368,511 pairs → 368,491 after the radial filter → 253,010 coarse candidates → 34 dropped as co-orbiting → 3,032 confirmed events. 3,710,880 SGP4 propagations in 15.1 seconds.',
  },
  {
    id: 'dashboard-cascade-gate',
    route: '/console',
    target: 'cascade-panel',
    eyebrow: 'DASHBOARD · /console',
    caption:
      '450 km is not a tuning knob. It is 15 km/s maximum closing speed times the 60-second step, halved. Change the step and the radius has to change with it, and the validation suite fails if it does not.',
  },
  {
    id: 'dashboard-high-risk',
    route: '/console',
    target: 'high-risk-tile',
    eyebrow: 'DASHBOARD · /console',
    caption:
      'The run produced 3,032 events; the dashboard shows 2,901, because the default thresholds exclude any pair whose older element set is more than 10 days stale. 27 HIGH, 77 MEDIUM, 149 LOW, 2,648 NOMINAL — and all 27 HIGH events involve debris from a deliberate or accidental destruction.',
  },
  {
    id: 'dashboard-isro-filter',
    route: '/console',
    target: 'isro-filter-button',
    eyebrow: 'DASHBOARD · /console',
    caption:
      'Hit ISRO assets · 72 to filter down to the events that involve an Indian-operated satellite — the same engine, the same real debris, just the slice that matters to this operator.',
  },
  {
    id: 'dashboard-run-screening',
    route: '/console',
    target: 'run-screening-button',
    eyebrow: 'DASHBOARD · /console',
    caption:
      'Run screening re-runs the same engine live in a Web Worker, rather than replaying a cached answer. The committed precompute and this live run are the same code, so they land on the same event count by construction.',
  },
  {
    id: 'event-header',
    route: `/console/conjunction/${DEMO_EVENT_ID}`,
    target: 'event-header',
    eyebrow: 'EVENT DETAIL · CARTOSAT-2C × COSMOS 2251 DEB',
    caption:
      'The top-ranked event in the entire run, and the right one to open because it is an Indian asset. Miss 1.911 km, relative velocity 4.834 km/s, Pc 4.9 × 10⁻⁴, severity HIGH, score 80 — oldest element set in the pair 1.29 days, σ 1.41 km.',
  },
  {
    id: 'event-separation',
    route: `/console/conjunction/${DEMO_EVENT_ID}`,
    target: 'separation-chart',
    eyebrow: 'EVENT DETAIL · separation chart',
    caption:
      'This curve is computed on demand — 242 SGP4 calls, not a stored curve. Miss distance and relative velocity are measured; nothing here was authored.',
  },
  {
    id: 'event-risk-model',
    route: `/console/conjunction/${DEMO_EVENT_ID}`,
    target: 'risk-model',
    eyebrow: 'EVENT DETAIL · risk model breakdown',
    caption:
      'Pc is derived from the measured miss distance and relative velocity. The one assumed input is the positional covariance, because a TLE does not carry one — and σ is on screen, not buried.',
  },
  {
    id: 'manoeuvre-burn-advisor',
    route: '/console/manoeuvres',
    target: 'burn-advisor',
    eyebrow: 'MANOEUVRE LOG · burn advisor',
    caption:
      'Drag delta-v and watch the post-burn miss distance move. This is not "3 · Δv · t" printed as if it were a simulation — both the burned and the unburned state go through the same universal-variable integrator, and only their difference is used, because SGP4 propagates mean elements and is not invertible.',
  },
  {
    id: 'analysis-gabbard',
    route: '/console/analysis',
    target: 'gabbard-diagram',
    eyebrow: 'ANALYSIS WORKBENCH · Gabbard diagram',
    caption:
      'The fragment cloud in period-versus-altitude space — the shape a real breakup makes. Fragments thrown forwards raise their apogee, those thrown backwards raise their perigee, and the two arms cross at the parent orbit.',
  },
  {
    id: 'analysis-cascade-risk',
    route: '/console/analysis',
    target: 'cascade-risk',
    eyebrow: 'ANALYSIS WORKBENCH · cascade risk',
    caption:
      'The added collision rate the debris cloud imposes on everything still flying, with the shell forming over a few years through differential J2 nodal precession.',
  },
  {
    id: 'analysis-mass-slider',
    route: '/console/analysis',
    target: 'mass-slider',
    eyebrow: 'ANALYSIS WORKBENCH · target mass',
    caption:
      'Drag the target mass slider and watch the fragment count move. Fragment count scales as mass to the 0.75, and a TLE carries no mass — so mass is a control here, not a constant. An assumption you can sweep is a finding; one buried in a constant is a claim.',
  },
  {
    id: 'status-closing',
    route: '/console/status',
    target: 'status-page',
    eyebrow: 'PROTOTYPE STATUS · /console/status',
    caption:
      'Every capability in this console has a status in one registry file, and that file drives the sidebar markers and this page. Alert routing: not built. API keys: not built. The manoeuvre log’s burn records are synthetic and it says so. We built the thing that tells you what we did not build.',
  },
];
