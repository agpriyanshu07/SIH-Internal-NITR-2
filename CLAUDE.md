# KESSLER — working notes

A front-end-only orbital conjunction-screening console. No backend, no network
access at runtime, deployable as static files.

## The one rule

`src/data/features.ts` is the single source of truth for what this app can
honestly claim to do. It drives the sidebar's `NOT BUILT` markers and the
`/console/status` screen. **If you change what a capability does, change its
`status` and `note` in the same commit.** Never let the registry claim something
that is not real. That registry is the project's credibility mechanic — a judge
who catches one overstatement stops believing the rest.

The same rule applies to the README's top-level disclaimer and to any number
printed in the UI. A hard-coded metric that looks measured is the specific
failure mode to avoid: it makes a falsifiable claim unfalsifiable.

## What is real, and what is not

**Real.** Objects, element sets, epochs, SGP4 propagation, times of closest
approach, miss distances, relative velocities, element-set ages, every figure in
the pair-reduction cascade, and the burn advisor's re-propagated post-burn miss
distance. All measured, none authored.

**Modelled from published models, not measured.** The collision-consequence
chain: NASA Standard Breakup Model for the fragment cloud, King-Hele for decay,
Sutton-Graves for re-entry heating. Real models, applied to real events, but
their inputs include assumptions — see below — so the outputs are estimates
rather than observations, and the UI says which is which.

**Assumed, and disclosed wherever used.** The 1-sigma positional covariance
feeding Pc — a TLE carries no covariance. Radar cross-section class, inferred
from object type because real RCS lives in the SATCAT, not in a TLE. Launch day:
a designator gives only the year. Object MASSES for the consequence analysis,
where fragment count scales as mass^0.75 — the single most consequential
assumption in that chain. Fragment material mix, drag coefficient, solar
activity and entry angle: all controls on the analysis workbench rather than
constants, because an assumption you can sweep is a finding and one buried in a
constant is a claim.

**Still synthetic.** The manoeuvre log's burn records. Sign-in authenticates
nothing. Acknowledgements are localStorage only.

## Data flow

Screening — what the dashboard shows:

```
src/data/snapshot/*.txt      committed CelesTrak TLEs (verbatim) + manifest.json
  -> engine/parse.ts         TLE -> SpaceObject + SatRec
  -> engine/screen.ts        radial filter, 60 s SGP4 sweep, 450 km gate
  -> engine/refine.ts        bisection on range rate -> exact TCA
  -> engine/run.ts           the pipeline (+ Pc, severity, score)
  -> data/precomputed.json   committed result, for instant first paint
  -> data/conjunctions.ts    RESOLVED / conjunctionById / SEVERITY_COUNTS
```

Manoeuvre planning — what the burn advisor shows:

```
engine/twobody.ts            universal-variable state-vector propagation
  -> data/advisor.ts         differential re-propagation of a burn
  -> components/BurnAdvisor  one post-burn miss distance, not a range
```

Collision consequence — what the analysis workbench shows:

```
engine/impact.ts             centre-of-mass mechanics, J2 nodal precession
  -> engine/breakup.ts       NASA Standard Breakup Model
  -> engine/thermal.ts       Sutton-Graves heating, lumped-mass demise
  -> engine/decay.ts         King-Hele drag decay, re-entry latitude
  -> engine/cascade.ts       Kessler particle-in-a-box flux on surviving assets
  -> data/consequence.ts     the chain, with every assumption an input
  -> routes/Analysis.tsx     the workbench; Consequence.tsx summarises it
```

**Two different things are called "cascade" in this codebase, and conflating them
will produce nonsense.** `ScreenCascade` in `engine/screen.ts` (and
`components/CascadePanel.tsx`) is the *pair-reduction* cascade — how many pairs
each filter stage rejected. `engine/cascade.ts` (and `components/CascadeRisk.tsx`)
is the *Kessler* cascade — the added collision rate a debris cloud imposes on
everything still flying. They share a word and nothing else.

`workers/screening.worker.ts` runs `engine/run.ts` unchanged, so the "Run
screening" button performs a real screening run rather than replaying one. The
build-time precompute and the live run must stay byte-identical over the same
horizon — if they ever diverge, something is wrong with one of them.

The UI only ever consumes the shapes in `data/types.ts`. Keep those stable and
the screens do not care where the numbers came from.

Two modules are deliberately PURE — no data imports at all — and must stay that
way. `data/cdm.ts` takes the snapshot epoch and the group lookup as parameters
rather than importing them, and `engine/tleUncertainty.ts` imports nothing but
satellite.js. The reason is mechanical: everything that reads the snapshot does
it through Vite's `?raw` loader, and importing any of it makes a module
unloadable in Node — which is where `npm run validate` runs. Add an import of
`data/objects` or `engine/catalogue` to either file and the whole suite stops
starting, with an error about a `.txt` extension that names neither module.

## Things that will bite you

- **The screening radius is derived, not a tuning knob.** 450 km = 15 km/s max
  closing speed x 60 s step / 2. Lowering it makes the screen report fewer
  events and look faster while silently missing real close approaches. If you
  change the step size, change the radius with it. `npm run validate` checks it.
- **The console clock is not the wall clock.** It is anchored to the snapshot
  capture instant (`useNow`, `EPOCH_OFFSET`). Every element set was captured
  then, and SGP4 only tells the truth near its epoch.
- **Docked objects are not conjunctions.** ISS modules and a berthed Progress
  sit 0 km apart forever. A pair must also *separate* past `CO_ORBIT_KM`
  somewhere in the window to count.
- **A burned state cannot become a TLE.** SGP4 propagates mean elements and is
  not invertible, so the advisor works differentially: both the burned and the
  unburned state go through the same two-body integrator and only their
  DIFFERENCE is used. Never propagate one arm one way and the other another —
  the cancellation is the whole reason the answer is trustworthy.
- **Fragments do NOT leave from the pair's centre of mass.** It looks right —
  that is where the combined momentum goes — but for two comparable masses at a
  large angle `|v_cm|` is far below orbital speed, so every fragment goes
  sub-orbital and whole clouds appear to de-orbit within the hour. A
  hypervelocity breakup is not an inelastic merger: each body shatters and its
  pieces keep ITS momentum. Model the two parents' clouds separately, conserving
  momentum within each. This was a real bug; do not reintroduce it.
- **Never suppress free-molecular heating.** Ramping entry heating to zero above
  some altitude deletes precisely the heat that light, high-area fragments
  experience — they decelerate too high to reach continuum flow at speed. It
  inverts the model so compact heavy fragments demise and light ones survive.
  The standard scaling is heat per unit mass ~ sqrt(A/m), and `npm run validate`
  asserts it. Both regimes are computed and bridged harmonically.
- **Thermal demise altitudes are not calibrated.** They run higher than the
  65-80 km ORSAT and SCARAB report. The A/m dependence and the survive/demise
  boundary are the meaningful outputs; do not quote the altitude as if it were
  validated, and do not tune the model to hit a published number.
- **satellite.js ships an optional WASM runtime** that pulls node built-ins and
  a top-level await. It is aliased away in `vite.config.ts` and excluded from
  dev pre-bundling. Do not remove either without checking `npm run build` and
  `npm run dev`.

## Commands

```bash
npm run dev        # dev server
npm run build      # tsc -b && vite build — the only CI this repo has
npm run screen     # re-run screening, rewrite src/data/precomputed.json
npm run validate   # known-answer tests for the engine (must stay 62/62)
npm run build:single  # one self-contained file in dist-single/
scripts/fetch-snapshot.sh   # refresh the snapshot from CelesTrak, by hand
```

Run `npm run build` and `npm run validate` before committing engine changes.

`npm run screen` is deterministic — the only field that changes between runs is
`cascade.elapsedMs`, a measurement of the machine that ran it. A one-line diff
on `precomputed.json` is expected; a diff in any other field means something
changed in the engine.

The screening horizon lives in ONE place, `DEFAULT_HORIZON_HOURS` in
engine/run.ts, read by both the precompute script and `DEFAULT_THRESHOLDS`.
They used to be separate and drifted to 24 h vs 72 h, which silently rebuilt
the dashboard with a third of the events. Do not reintroduce a second literal.

## Decks

`deck/KESSLER-SIH-2026-Idea.pptx` is the design standard, and
`deck/DESIGN-NOTES.md` records why: the dark hero band carrying the template's
own pointer as an orange kicker, cards with coloured left accent bars,
letterspaced uppercase micro-labels as the hierarchy device, real product
screenshots, real charts, and body type at 8.4-9 pt to buy the density. **Read
that file before building or editing any deck.** `KESSLER-SIH-PS04.pptx` is a
plainer earlier attempt kept for reference only — do not use it as the model.

The honesty rule above outranks the design. A better-looking slide does not get
to make a looser claim, and every figure a deck prints must map to a command in
`deck/README.md` that reproduces it.

## Style

- Semantic CSS tokens only (`bg-panel`, `text-secondary`, `border-hairline`,
  `text-risk-*`). Never a raw hex or a Tailwind default colour.
- New panels pair `.glass` with `.lift` — see `components/primitives.tsx`.
- Severity travels by `data-sev`, which sets `--sev`. No prop-drilling colours.
- All ambient motion is disabled under `prefers-reduced-motion`.
- Match the existing `aria-sort` keyboard pattern for new interactive controls.
- Comments explain *why*, especially where a number is derived or assumed.
