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

**Assumed, and disclosed wherever used.** The 1-sigma positional covariance
feeding Pc — a TLE carries no covariance. Radar cross-section class, inferred
from object type because real RCS lives in the SATCAT, not in a TLE. Launch day:
a designator gives only the year.

**Still synthetic.** The manoeuvre log's burn records. Sign-in authenticates
nothing. Acknowledgements are localStorage only.

## Data flow

```
src/data/snapshot/*.txt      committed CelesTrak TLEs (verbatim) + manifest.json
  -> engine/parse.ts         TLE -> SpaceObject + SatRec
  -> engine/screen.ts        radial filter, 60 s SGP4 sweep, 450 km gate
  -> engine/refine.ts        bisection on range rate -> exact TCA
  -> engine/run.ts           the pipeline (+ Pc, severity, score)
  -> data/precomputed.json   committed result, for instant first paint
  -> data/conjunctions.ts    RESOLVED / conjunctionById / SEVERITY_COUNTS
```

`workers/screening.worker.ts` runs `engine/run.ts` unchanged, so the "Run
screening" button performs a real screening run rather than replaying one. The
build-time precompute and the live run must stay byte-identical over the same
horizon — if they ever diverge, something is wrong with one of them.

The UI only ever consumes the shapes in `data/types.ts`. Keep those stable and
the screens do not care where the numbers came from.

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
- **satellite.js ships an optional WASM runtime** that pulls node built-ins and
  a top-level await. It is aliased away in `vite.config.ts` and excluded from
  dev pre-bundling. Do not remove either without checking `npm run build` and
  `npm run dev`.

## Commands

```bash
npm run dev        # dev server
npm run build      # tsc -b && vite build — the only CI this repo has
npm run screen     # re-run screening, rewrite src/data/precomputed.json
npm run validate   # known-answer tests for the engine (must stay 15/15)
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

## Style

- Semantic CSS tokens only (`bg-panel`, `text-secondary`, `border-hairline`,
  `text-risk-*`). Never a raw hex or a Tailwind default colour.
- New panels pair `.glass` with `.lift` — see `components/primitives.tsx`.
- Severity travels by `data-sev`, which sets `--sev`. No prop-drilling colours.
- All ambient motion is disabled under `prefers-reduced-motion`.
- Match the existing `aria-sort` keyboard pattern for new interactive controls.
- Comments explain *why*, especially where a number is derived or assumed.
