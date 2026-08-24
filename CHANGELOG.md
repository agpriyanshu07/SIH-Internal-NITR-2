# Changelog

What changed, and why it was worth changing. Every figure here is one the
repository reproduces — `npm run validate`, `npm run screen`, or `npm run build`.

The project began this work as a clickable prototype whose data came from a
seeded random-number generator. It ends it as a console whose every orbital
number is measured from real element sets, with a registry that states which
claims are backed by code and which are not.

---

## Data and engine

### Real orbital data replaced the generator

The seeded generator is gone. `src/data/snapshot/` holds a verbatim CelesTrak
capture — **859 objects, all from one instant, 2024-11-17T23:05:00Z** — across
five groups: ISS/CSS stations (14), ISRO LEO assets (19), Cosmos 1408 ASAT
debris (13), Iridium 33 debris (132) and Cosmos 2251 debris (681).
`manifest.json` records where each file came from and what it is, because a
snapshot with no provenance is indistinguishable from invented data.

The capture instant matters and the app respects it: the console clock is
anchored to it rather than to the wall clock, since SGP4 only tells the truth
near its epoch.

### SGP4 screening

`src/data/engine/` is the whole pipeline, and the build-time precompute, the
validation suite and the in-browser worker all run the identical code:

```
parse.ts    TLE -> SpaceObject + SatRec (satellite.js)
screen.ts   radial apogee/perigee filter, 60 s sweep, 450 km gate
refine.ts   bisection on range rate, 24 steps, to an exact TCA
pc.ts       Foster-style Pc over an assumed, disclosed covariance
run.ts      the pipeline, plus severity and risk score
```

The committed run:

```
859 objects
368,511 pairs                       every unordered pair
368,491 after the radial filter
253,010 coarse candidates           within 450 km at some 60 s step
     34 dropped as co-orbiting      docked pairs that never separate
  3,032 confirmed events            refined to a true TCA inside 25 km
```

**3,710,880 SGP4 propagations in 15.1 s.** The 450 km screening radius is
derived — 15 km/s maximum closing speed × 60 s step ÷ 2 — not tuned, and the
validation suite fails if the step changes without it.

### Consequence chain

What happens *after* a collision, from published models applied to real events:

- `impact.ts` — centre-of-mass mechanics, J2 nodal precession
- `breakup.ts` — NASA Standard Breakup Model (EVOLVE 4.0), 40 J/g threshold
- `thermal.ts` — Sutton-Graves heating, lumped-mass demise, DAS casualty area
- `decay.ts` — King-Hele drag decay, re-entry latitude distribution
- `cascade.ts` — Kessler particle-in-a-box flux on surviving assets
- `twobody.ts` — universal-variable propagation, for differential burn re-propagation

Every assumption in that chain is a control on the analysis workbench rather
than a constant, because an assumption you can sweep is a finding and one buried
in a constant is a claim.

### Validation

`npm run validate` — **49 known-answer checks, all passing.** Highlights:

- the filtered cascade against brute force: **505 candidates both ways, 0 missed,
  0 extra**, minimum distances agreeing to 1.14 × 10⁻¹³ km
- ISS propagates to its real altitude and 7.655 km/s
- the burn advisor's re-propagated displacement against the closed form: **3.9%**
- breakup against the observed catalogues: Cosmos 1408 **0.80×**, Iridium/Cosmos
  **0.53×**, Fengyun-1C **0.33×** — reported as a NOTE rather than hidden,
  because a model that always agrees with you is not being tested

### Bugs found by testing rather than inspection

Recorded because each was plausible-looking and wrong:

- **Fragments do not leave from the pair's centre of mass.** For two comparable
  masses at a large angle `|v_cm|` is far below orbital speed, so whole clouds
  appeared to de-orbit within the hour. A hypervelocity breakup is not an
  inelastic merger: each parent's cloud is modelled separately.
- **Sutton-Graves heating was out by 10⁴** (1.83e-8 for k = 1.7415e-4), so
  nothing ever demised.
- **Suppressing free-molecular heating inverted the model** — compact heavy
  fragments demising, light ones surviving. Both regimes are now bridged
  harmonically, and the suite asserts heat per unit mass rises with A/m.
- **Docked objects reported as 0.000 km conjunctions.** A pair must also
  separate past `CO_ORBIT_KM` somewhere in the window.
- **The screening horizon existed in two places** and drifted to 24 h vs 72 h,
  silently rebuilding the dashboard with a third of the events. One constant now.
- **The risk score contradicted its own severity chips** in six cases.

---

## The honesty registry

`src/data/features.ts` is the single source of truth for what this app claims.
**19 capabilities: 11 live, 6 partial, 2 not built.** It drives the sidebar's
NOT BUILT markers and the `/console/status` screen, and the rule is that
changing what a capability does means changing its status and note in the same
commit.

Alert routing and API keys stay `not-built`, and the reason is now stated on the
Thresholds screen — read from the registry itself and filtered on status, so
building either one removes it from that panel automatically. Deliberately not a
disabled form: a form that cannot submit is a worse answer than a sentence
saying what there is to submit to.

---

## Interface

### Controls

- **Sliders.** All thirteen shared a class that set `appearance: none` then
  `accent-color`, which does nothing once the native control is gone. One
  `.k-slider` now carries the control: a 3px bar in an 18px hit box, fill
  position from a `--k-fill` custom property, focus ring on the thumb rather
  than the box.
- **Fields and dropdowns.** Two selects still wore the platform's disclosure
  triangle; four text fields had three different treatments. One `.k-control`
  surface, wrapped by `TextField` and `Select`. The native dropdown list is kept
  on purpose — a hand-rolled listbox would have to re-earn keyboard behaviour,
  type-ahead and touch handling.
- **Empty states.** The glyph was a bare bordered circle above the words "no
  results", which reads as a placeholder nobody got round to. Now a reticle.

### Landing page

Three claims that contradicted the console, all predating the real-data swap:

- **"all data on this site is synthetic"** — untrue since the engine landed, and
  wrong in the worst direction. Now the README's own sentence, verbatim, so the
  two cannot drift.
- **"propagated live"** — the hero canvas imports no satellite.js. Now
  "Schematic", the word the orbital viewer already uses, with its explanation.
  The canvas's 200-point debris field was also fabricated from modular
  arithmetic on the loop index; it now draws all 859 real objects, and looks
  better for it, because real objects clump into shells and generated ones smear.
- **Decorative nav** — inert `<span>`s for pages that do not exist. Every entry
  now resolves; "API" and "Contact" are gone rather than faked.

### Accessibility

Contrast measured on the rendered page, not computed from tokens — screenshot,
re-screenshot with every glyph transparent, read the median backdrop inside each
text box. Landing page now measures **zero failures at four scroll positions in
dark theme**, worst case 4.51:1. The washed-out problem-figure card (2.89:1) was
`--panel` white-at-5% under `saturate(150%)` over the warm gradient blob; it
uses `--deep` now.

### Build

Route-split with `React.lazy`: **1,282 → 1,219 kB (392 → 373 kB gzipped)**.
`ConjunctionDetail` had to be deferred alongside `Analysis` — it reaches the
same consequence chain, so splitting Analysis alone would have left the maths in
the main chunk by the other path.

`npm run build:single` still emits exactly one file (1,696 kB) with the
JavaScript, stylesheet, font subsets, TLE snapshot and screening worker all
inlined, so the console opens by double-clicking with the wifi off.

---

## Documentation

- **`DEMO.md`** — spoken opening, the click-by-click demo path with real event
  ids, prepared answers to four judge questions, and an offline rehearsal
  checklist. Every figure names the command that reproduces it.
- **`README.md`** — the disclosure at the top is the one the landing page now
  repeats word for word.
- **`CLAUDE.md`** — the rule, the data flow, and the list of things that will
  bite the next person, each written from a bug that actually happened.

---

## Known limits, stated rather than buried

These are open. None is hidden in the UI.

- **Console contrast.** The gradient blobs live on `body`, so they sit behind
  `/console` too. Measured: dashboard 86 of 221 text nodes below AA, analysis 51
  of 89, status 27 of 61, worst 2.45:1 on column headers and NORAD ids. Neither
  remedy is small — darkening the blobs enough needs their luminance down about
  eightfold, which removes the wash the design is built on; lifting `--t3` to
  `--t2` collapses two text tiers. It is a decision about what the app should
  look like, not a patch.
- **Light theme** fails independently of any gradient: `--accent` on a light
  panel is about 3.0:1, and `--accent-ink` white on `--accent` is 3.77:1 on every
  primary button.
- **Bundle floor.** The remaining 1.2 MB is mostly not application code —
  `precomputed.json` is 632 kB and satellite.js plus the TLE parse is most of the
  rest, and the landing page pulls both. Getting it under a megabyte means giving
  the landing page a small precomputed summary: a data change, not a routing one.
- **Thermal demise altitudes are not calibrated.** They run above the 65–80 km
  ORSAT and SCARAB report. The A/m dependence and the survive/demise boundary are
  the meaningful outputs; the altitude is not, and the model was not tuned to hit
  a published number.
- **Scaling.** The radial filter rejects almost nothing on this catalogue — 20
  pairs of 368,511 — because these five groups share overlapping LEO shells. The
  right structure at 30,000 objects is spatial binning per time step, and it is
  not built.
- **Still synthetic:** the manoeuvre log's burn records. Sign-in authenticates
  nothing. Acknowledgements are localStorage only. All three say so in the app.
- **`dist/` is tracked**, so every build appears in the diff.
- **The snapshot is from 2024-11-17.** `scripts/fetch-snapshot.sh` refreshes it
  from CelesTrak; re-run `npm run screen` and re-check DEMO.md's figures after.
