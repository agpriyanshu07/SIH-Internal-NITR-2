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
- **`e.currentTarget` read inside a functional `setState`.** React clears it when
  the handler returns and the updater runs after that, so the viewer's drag read
  null on the first pointermove and took the whole route down — the canvas
  vanished mid-drag. Caught by counting canvases across a scripted drag, not by
  reading the diff.
- **`releasePointerCapture` throws when the element does not hold capture**, and
  the browser releases implicitly on pointerup, so the unguarded call threw on
  every release.
- **The manoeuvre log's event-driven branch was dead code.** It sliced the
  twenty-six soonest events under a comment claiming "most severe first", found
  no flyable asset among them, and produced nothing — so a filter chip in the UI
  could never match.

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

### Layout and labelling

- **The catalogue's provenance line bled through the table header.** It sat in
  the toolbar row — a fixed `h-[52px]` already holding a 400px search field and
  the ISRO toggle — so its source line, capture instant, object count and five
  group counts wrapped to three lines inside a 52px box and, with nothing
  clipping the overflow, drew straight through the sticky header below. At a
  full desktop width, not only when narrow. It has its own row now, the way the
  dashboard has always laid it out.
- **The sidebar badge asked the router, not the registry.** `NavItem` rendered
  "Not built" from `!feature.to` — whether a feature had a route — and never
  read `feature.status`. The asset register, whose ISRO fleet filter is real and
  works, wore the same NOT BUILT label as alert routing and API keys. The chip
  now comes from `STATUS_LABEL` coloured through `STATUS_SEV`, the same pair
  Status and Thresholds use, and the asset register points at
  `/console/catalogue?isro=1` so it lands on the fleet it describes.
- **The dashboard's severity filter was right and its label was wrong.**
  `SEVERITY_RANK[r.sev] >= SEVERITY_RANK[minRisk]` is a floor, so picking MED
  showed MEDIUM, HIGH and CRITICAL — which under a heading reading "Risk" beside
  a chip reading "MED" looks like a broken equality filter. Now "Min severity",
  with `MED+` / `HIGH+` chips and a hint. Counted at each setting: ALL 2,901
  rows, MED+ 104 (77 MEDIUM + 27 HIGH), HIGH+ 27, CRIT+ 0.

### Accessibility

Contrast measured on the rendered page, not computed from tokens — screenshot,
re-screenshot with every glyph transparent, read the median backdrop inside each
text box. Landing page now measures **zero failures at four scroll positions in
dark theme**, worst case 4.51:1. The washed-out problem-figure card (2.89:1) was
`--panel` white-at-5% under `saturate(150%)` over the warm gradient blob; it
uses `--deep` now.

The console had the same defect and worse — the blobs are on `body`, so they sit
behind `/console` too. Both remedies were measured rather than argued about,
across five console routes:

| | below AA |
| --- | --- |
| baseline | 233 / 668 (34.9%) |
| blob alpha 0.30 → 0.12 | 187 / 668 (28.0%) |
| blob alpha 0.30 → 0.06 | 172 / 668 (25.7%) |
| `--t3 := --t2` | 14 / 668 (2.1%) |

Darkening the blobs is the expensive option and the ineffective one: most of the
failing backdrop is the panel's own white overlay rather than the blob behind
it, so an eightfold luminance cut would have cost the wash the design is built
on and bought six points. The token lift is scoped to the console via
`:root[data-ksurface='console']`; the blobs are untouched and the landing page
keeps its quieter tier. **Shipped: 4 / 668 on the console, 0 / 269 on the
landing page.**

It costs one thing, stated plainly: tertiary and secondary text are the same
colour inside the console now. Intermediate values were measured (`#8494a6` →
60 failures, `#8ea0b4` → 23, `#96a7bb` → 19) and the only ones approaching AA
are already indistinguishable from `--t2`.

### Performance

- **The landing page loaded the whole engine to print three numbers.** It
  imported `CASCADE` and `OBJECTS`, which reach 632 kB of screening result plus
  satellite.js parsing every TLE at import time. It now reads a 44 kB summary
  generated alongside `npm run screen`, and the entire `/console` subtree is
  lazy. Median of three loads: **JS 1,191.9 → 225.7 kB; first contentful paint
  776 → 556 ms unthrottled, and 3,232 → 784 ms at 4 Mbps.**
- **A 1 Hz clock re-rendered whole routes.** `useNow()` at a route's top level
  reconciled the entire dashboard every second to move a few digits. Countdowns
  are their own components now, and `useNow` is one module-level ticker behind
  `useSyncExternalStore` rather than a timer per caller — which matters because
  the dashboard renders a countdown on every screened event. **Scripting over
  10 s idle: 856 → 263 ms.**
- **Six `.glass` uses removed** where the blur could not be seen: nav rows
  (including a `hover:glass` that allocated a compositing layer per row
  crossed), the 30px search field, the 26px avatar, the selected table row on
  two screens. 14 → 10 backdrop-filter surfaces. Not claimed as a measured win —
  see Known limits.

### The catalogue became an instrument

It was the weakest screen and the one this app opens on: 859 rows of numbers
with no visual encoding at all. To see that the Cosmos 2251 cloud sits in a band
around 700 km you had to read two columns of four-digit numbers and hold them in
your head.

- **A shell histogram, and it is the filter.** Mean altitude binned across
  300–1700 km, each bin stacked by class. The debris clouds show up as what they
  are — one bin at 671–712 km holds **145 objects, a sixth of the catalogue in a
  41 km band**. Clicking a bin filters the table to it, which is the question you
  have the moment you see a spike and previously had no way to ask. Square-root
  heights, because that spike flattens everything else on a linear scale and
  hides precisely the smaller shells someone is hunting for.
- **Per-row marks**, none of which adds a figure: perigee-to-apogee as a bullet
  chart on one shared scale, class as a mark plus its word, element-set age as a
  pip against the screening threshold. Sort by shell and the clouds stack into
  visible bands.
- **Density**: rows 42px → 36px with a two per cent zebra, page size 25 → 38.
  Eccentricity left the table — at four decimals it is the one column nobody can
  scan, and the drawer already carries it with a full explanation.

The scale is 300–1700 km, not the textbook 160–2000: this catalogue runs 340 km
to 1,627 km, and a full-LEO scale squeezed every bar into the middle third of
the column.

### Motion

Table rows arrive with a 240 ms fade and 4px lift, staggered 11 ms by index and
capped at fourteen — shallower than the panel `.rise`, because it plays on thirty
rows at once. Rows are keyed on the filter as well as the object, or React reuses
the DOM and a new population appears with no transition at all. The drawer slides
from the edge it is docked to.

A real hole in the reduced-motion guard, found while adding them: it zeroed
`animation-duration` but not `animation-delay`, so a staggered list still arrived
late — just late and instant instead of late and animated.

### Interrogating the assumption

The conjunction detail carries a sensitivity chart: Pc swept against the assumed
sigma across the same 0.25×–4× range the Thresholds slider offers, with the
severity bands as background zones and every band crossing named. The app always
disclosed that Pc rests on an assumed covariance — a TLE carries none — in a
sentence. This makes the sentence something a researcher can interrogate per
event: a conjunction that holds one band across the whole sweep does not depend
on the assumption, and one that crosses is one where the assumption *is* the
answer.

The demo event answers it interestingly. CARTOSAT-2C × COSMOS 2251 DEB crosses
four times — LOW beyond 0.29×, MEDIUM beyond 0.37×, HIGH beyond 0.49×, back to
MEDIUM beyond 3.37×. The non-monotonic shape is the Foster model behaving
correctly: Pc peaks where sigma is comparable to the miss distance. Nothing was
tuned; the curve is 96 calls to the same `reband()` the slider drives.

Built to the dataviz method, and two of its checks changed the design. It flags
the severity palette used categorically — HIGH against MEDIUM measures ΔE 9.7
for normal vision, 5.5 under deuteranopia, below the floor where colour alone
can carry identity — so every band is directly labelled, every crossing is named
in prose, and the aria-label states the whole finding; colour only reinforces.
And it calls for a hover layer on a line chart by default, so there is a
crosshair reading sigma, Pc and band under the cursor.

### Orbital viewer

**The render loop is out of React.** Both the playback clock and the camera
azimuth were React state advanced inside requestAnimationFrame, so every frame
re-rendered the route and re-ran a 165-line draw effect to repaint a canvas —
reconciliation between frames, which is what the choppiness was. Both are refs
now; one loop mutates them and draws directly, and the text readouts run on
their own 200 ms tick. Measured with a temporary render counter, playback
paused: **idle re-renders 23 per 6 s → 0, and a 40-move drag 43 → 3.** Under an
unthrottled frame rate, layout over ten seconds of idle rotation drops 119 ms →
17 ms and style recalculation 372 ms → 158 ms.

Auto-rotation when idle and drag-to-rotate, both as one extra term on the
`spin` that `lib/projection` already takes — no rendering engine, and the label
still says SCHEMATIC PROJECTION. Two bugs found by probing rather than reading:
`e.currentTarget` read inside a functional `setState` (React clears it when the
handler returns, so the canvas vanished on the first pointermove), and
`releasePointerCapture` throwing on every release because the browser had
already released it implicitly.

The viewer's debris layer was also fabricated — 260 points from modular
arithmetic on the loop index, under a toggle labelled "Debris". The same
generator removed from the landing hero, still running in the console. It draws
real catalogue objects now.

### Layout that fits

The manoeuvre log's table demanded 900px inside a column squeezed against a
fixed 400px advisor, so the last two columns sat behind a horizontal scroll at
every common laptop width. Δv and axis share a cell (one quantity written two
ways), "prompted by" is one line with the miss change in its title, and the
side-by-side split moved from `xl` to `min-[1420px]` so the advisor stacks
below rather than starving the table. **900px → 748px; no horizontal scroll at
any of nine widths from 1024 to 1920.**

While measuring it: the log's "prompted by an event" chip matched 0 of 16
burns. Not a filter fault — no burn had a cause. `RESOLVED` is ordered by time
of closest approach and the generator took `.slice(0, 26)` under a comment
reading "most severe first", so it took the twenty-six *soonest* events, all of
them debris against debris, found no controllable side, and pushed nothing. The
whole event-driven branch was dead code. Now ranked by score, with the cap
applied after filtering to events that have a flyable asset. Two of eighteen
burns are event-prompted — two, because that is how many events in the run
involve an asset anyone could fly.

### Landing page motion

The three hero figures count up from zero on an ease-out cubic, with the last
frame writing the exact target so what is read is the measured number. Sections lift in on
scroll — `opacity-0 translate-y-3` to `opacity-100 translate-y-0` over 300 ms,
with children staggered 40 ms apart by index — using an IntersectionObserver and
`transition-delay`. No animation library: the initial chunk is unchanged. A live countdown to the soonest
screened approach ticks on the console clock, from the same run and the same
`DEFAULT_THRESHOLDS` the dashboard uses, so the two cannot disagree. Under
`prefers-reduced-motion` the figures are final on first paint and the sections
are visible immediately, rather than hidden waiting for an animation that will
never run.

### Build

Route-split with `React.lazy`. `ConjunctionDetail` had to be deferred alongside
`Analysis` — it reaches the same consequence chain, so splitting Analysis alone
would have left the maths in the main chunk by the other path.

`npm run build:single` still emits exactly one file with the JavaScript,
stylesheet, font subsets, TLE snapshot and screening worker all inlined, so the
console opens by double-clicking with the wifi off.

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

- **Four contrast failures remain on the console**, each needing a severity
  token moved rather than a legibility fix: `"0 CRIT"` at 3.35:1 and the status
  page's not-built count at 2.79:1 are semantic colours doing their job, and the
  `"Primary"` / `"Secondary"` column headers sit at 4.40:1 and 4.42:1, close
  enough to threshold to be inside the measurement's own error. Changing a
  severity colour changes what it means, which is a larger decision than making
  it readable.
- **Tertiary and secondary text are the same colour inside the console.** The
  price of the fix above, and a real loss of one level of hierarchy.
- **Light theme** fails independently of any gradient: `--accent` on a light
  panel is about 3.0:1, and `--accent-ink` white on `--accent` is 3.77:1 on every
  primary button. Flat-surface token failures, untouched.
- **Hardcoded pixel spacing is not normalised.** There is a lot of it and it is
  not drift — it comes from the design's artboards, which are the validated
  reference. Normalising `py-[13px]` to a scale step would be a large diff that
  changes the design to satisfy a rule the design never followed.
- **Smoothness of the viewer's rotation is argued, not measured.** The
  architectural fix is measured — re-renders to zero — but this container
  throttles requestAnimationFrame to about 4 Hz for a headless page, and both
  builds repaint at 3.5–3.9 fps under it. The frame-rate claim needs a real
  display.
- **The dashboard renders all 2,901 screened events at once**, each with a live
  countdown, so 2,901 text nodes change every second and the browser lays them
  out: about 1.1 s of layout per 10 s idle, unchanged by isolating the clock.
  Fixing it means pagination or virtualisation — a change to how the table
  works, not to how the clock works.
- **The `.glass` reduction is not a measured win.** Chrome's Performance metrics
  expose script, layout and style time but not compositing or GPU time, which is
  where `backdrop-filter` actually costs; and what they do expose is swamped by
  the layout above. Four paired hover-sweep runs came back inside the
  run-to-run drift, in both directions. Fewer compositing surfaces is less work
  by construction, and the blur was invisible at those sizes, so the change is
  kept on that argument rather than on a number.
- **First console entry still costs 1,187 kB.** The landing route is down to
  225.7 kB, but `precomputed.json` is 632 kB and satellite.js plus the TLE parse
  is most of the rest, and the console genuinely needs both.
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
