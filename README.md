# KESSLER — front-end prototype

A clickable prototype for an orbital conjunction screening console: it tracks
satellites and debris in Low Earth Orbit and ranks predicted close approaches.

> **The orbital data and the screening are real. The operational trappings are
> not.**
>
> Objects, element sets, propagation, times of closest approach, miss distances
> and relative velocities all come from a committed CelesTrak snapshot screened
> with SGP4 — none of them are invented. Probability of collision is derived
> from those measurements through a Foster-style model whose one assumed input,
> the positional covariance, is stated wherever it is used, because a TLE does
> not carry one.
>
> There is still no backend and no network access: the snapshot is bundled into
> the build. The manoeuvre log's burn records remain synthetic, sign-in
> authenticates nothing, and acknowledgements live in your own browser. See
> `/console/status` for the per-feature breakdown. Nothing here should be used
> for any operational purpose.

`CHANGELOG.md` records what changed and why, and — at the end — the limits this
console has not solved, stated rather than buried.

Presenting this? `DEMO.md` has the spoken opening, the demo path with the event
ids and figures to point at, and prepared answers to the questions that get
asked. Every number in it is one a command in this repository reproduces.

## Running it

```bash
npm install
```

```bash
npm run dev
```

The dev server prints a local URL — <http://localhost:5173> by default.

To produce static files:

```bash
npm run build
```

Three more, all offline:

```bash
npm run screen        # re-run the screening engine and commit the result
npm run validate      # known-answer tests for the engine
npm run build:single  # one self-contained file — see below
```

`npm run screen` is deterministic: re-running it reproduces all 3,032 events
byte for byte. The one field that changes is `cascade.elapsedMs`, which is how
long the run took on *your* machine — it is a measurement, not a constant, and
the dashboard shows it as the screening latency. So a one-line diff on
`src/data/precomputed.json` after re-screening is expected, and a diff of any
other field is not.

`KESSLER_HOURS=24 npm run screen` overrides the horizon. Note that the console
also defaults its screening window to `DEFAULT_HORIZON_HOURS`, so committing a
run at a shorter horizon leaves the dashboard's window filter offering more
than the data covers — `npm run validate` checks for exactly that.

The output in `dist/` uses relative asset paths and hash-based routing, so it can
be served from any static host or subdirectory without server-side rewrites.
Opening `dist/index.html` straight off the disk still needs a local static server
(`npm run preview`), because it loads its JavaScript as a separate module file.
For a copy that opens with no server at all, see the single-file build below.

## Screens

| Route | What it is |
| --- | --- |
| `/` | Marketing landing page, with an animated wireframe-orbit hero |
| `/signin` | Sign in — see the caveat below |
| `/console` | Conjunction dashboard — the primary screen |
| `/console/conjunction/:id` | Event detail: separation chart, object specs, data-quality disclosure |
| `/console/catalogue` | Searchable object catalogue with an annotated element-set drawer |
| `/console/viewer` | 2D orbital viewer with a time scrubber and layer toggles |
| `/console/thresholds` | Screening thresholds — the floor applied before anything reaches the console |
| `/console/manoeuvres` | Manoeuvre log — burns against screened events |
| `/console/analysis` | Consequence analysis workbench — every assumption is a control |
| `/console/status` | Prototype status — what is wired up and what is not |

## What actually works

`/console/status` is the authoritative, in-app answer, generated from
`src/data/features.ts`. The short version:

**Live** — the screening engine and the orbital data behind it, the conjunction
dashboard (filters and sorts genuinely filter and sort), event detail, orbital
viewer, object catalogue, screening thresholds, Export CSV, and Run screening.

**Partial** — positional uncertainty (the 1-sigma feeding Pc is assumed, not
measured — see below), the asset register (one fixed register — the ISRO fleet —
is real and filterable; declaring an arbitrary set of objects as yours is not),
acknowledgements (remembered in your browser, sent nowhere), and sign in. The sign-in form validates and sets a local display name
for the console avatar. There is no backend, so nothing is authenticated: no
password is requested, no credential is checked, transmitted or stored, and no
link is sent.

**Not built** — Alert routing and API keys. These are marked
`NOT BUILT` in the sidebar rather than left looking clickable.

Screening thresholds are not a dead form: they write to shared state that the
dashboard and manoeuvre log both read, they persist across reloads, and changing
one visibly changes the dashboard's event count. Defaults admit everything, so a
fresh console shows the full set.

## How the data works

### The snapshot

`src/data/snapshot/` holds five CelesTrak GP groups as verbatim three-line TLE
files, all captured at one instant so their epochs are mutually consistent:

| Group | Objects | What it is |
| --- | --- | --- |
| `stations` | 14 | ISS and CSS modules plus visiting crew and cargo vehicles |
| `indian-assets` | 19 | ISRO-operated spacecraft in LEO — Cartosat, Resourcesat, Oceansat, RISAT, Astrosat, SARAL |
| `cosmos-1408-debris` | 13 | Fragments of the 2021 Russian ASAT test |
| `iridium-33-debris` | 132 | Fragments of the 2009 Iridium 33 / Cosmos 2251 collision |
| `cosmos-2251-debris` | 681 | The other half of that collision |

`manifest.json` records where they came from and when. The files are bundled
into the build, so the app makes no network request at any point — a demo must
not depend on conference wifi. `scripts/fetch-snapshot.sh` refreshes them from
CelesTrak by hand; it is the only thing in the repo that touches the network.

Because every element set was captured at one moment, **the console clock is
anchored to that moment** and advances in real time from it. Screening from
today's wall clock would mean propagating these elements far past their epoch,
where SGP4 stops telling the truth. Countdowns tick live and absolute
timestamps stay honest about when the data is from.

### The engine

`src/data/engine/` — about 400 lines, no backend, runs in the browser.

- **`parse.ts`** reads the TLEs. Every element, the epoch, and therefore the
  element-set age come off the file. Two fields the UI wants are *not* in a TLE
  and are marked as assumptions in the code and in the UI: radar cross-section
  class (real RCS lives in the SATCAT) and launch day (a designator gives only
  the year).
- **`screen.ts`** is the coarse cascade: a radial apogee–perigee overlap filter,
  then a 60-second SGP4 sweep of every surviving pair with a 450 km distance
  gate. **That radius is derived, not tuned.** Objects close at up to ~15 km/s,
  so between two samples 60 s apart their separation can change by 900 km — a
  pass can dip to zero and recover entirely between samples unless the gate is
  at least half of that. Shrinking it does not make the screen faster in any
  honest sense; it makes it silently miss real close approaches while reporting
  a tidier number of events.
- **`refine.ts`** finds the exact time of closest approach by bisecting on the
  sign change of range rate, which is negative while two objects close and
  positive once they recede. Miss distance and relative velocity are then read
  off a single propagation at that instant rather than approximated.
- **`run.ts`** is the pipeline, shared verbatim by the build-time precompute and
  the in-browser worker, so a live re-run cannot disagree with the committed
  result.

A pair also has to *separate* somewhere in the window to count. Without that,
the most urgent "conjunctions" on the board are ISS modules and a docked
Progress sitting 0 km apart — physically attached, not about to collide.

### What the run measures

Over the committed snapshot, 72-hour horizon:

```
368,511 pairs
   -> 368,491 after the radial overlap filter   (20 removed)
   -> 253,010 coarse candidates                 (34 dropped as co-orbiting)
   ->   3,032 confirmed events                  inside a 25 km gate
3,710,880 SGP4 propagations, ~25 s
```

The radial filter barely earns its keep here, and the dashboard says so rather
than rounding it up: nearly every group occupies overlapping LEO shells, and the
450 km gate is wider than the gaps between them. It removes 20 pairs, all of
them an ISRO asset against debris at an altitude it never reaches. A filter like
this pays for itself on a catalogue spanning LEO to GEO, not on debris clouds
sharing a band — and reporting the measured number rather than a flattering one
is the entire point of that panel.

**77 of the events involve an ISRO-operated asset**, the most serious being
`CARTOSAT-2C` against a Cosmos 2251 fragment at 1.911 km; both the dashboard and
the catalogue filter to them. Every high-severity event in the run involves
debris from one of the two real destruction events in the snapshot.

The closest approach it finds is **81 m**, between an Iridium 33 fragment and a
Cosmos 2251 fragment — two pieces of the same 2009 collision, still crossing.

### Planning a burn

The manoeuvre advisor applies a delta-v to the asset's real state vector and
re-propagates. SGP4 propagates a TLE's *mean* elements and is not invertible, so
a burned state cannot be turned back into a TLE; the way round it is
differential. Both the burned and the unburned state are propagated with the
same two-body integrator from the burn epoch, and their difference is the effect
of the burn — the model error, drag and J2 are common to both arms and cancel,
while the absolute trajectory stays SGP4's.

That gives one post-burn miss distance instead of a range, and the new time of
closest approach is searched for rather than assumed unchanged. It matters more
than it sounds: on the event the panel opens with, the closed-form estimate
`Δs ≈ 3·Δv·t` says 10.5 mm/s clears the LOW band, and re-propagating says
21.7 mm/s. The approximation is optimistic by a factor of two because it assumes
the displacement lands square across the miss vector. The console shows both.

It is still not a re-screen: nothing checks whether the burn creates a new
conjunction with a third object.

### If the pass were a collision

Every event carries a consequence analysis, chaining three published models onto
the real screened encounter:

- **NASA Standard Breakup Model** (Johnson et al., EVOLVE 4.0, 2001) — the same
  model used to reconstruct the Iridium 33 / Cosmos 2251 and Fengyun 1C clouds
  this catalogue is built from. It decides whether the impact is catastrophic
  (the 40 J/g specific-energy threshold), then draws fragments from
  `N(L) = 0.1·M^0.75·L^-1.71` with the model's own bimodal area-to-mass and
  ejection-velocity distributions.
- **Isotropic ejection** onto the parent's real SGP4 state at TCA, giving each
  fragment its own orbit.
- **King-Hele drag decay** for how long each one stays up.

Three limits, all stated in the panel itself. Object **masses are assumed** from
class — a TLE carries no mass — and fragment count scales as mass^0.75, so that
assumption propagates into every figure. Only fragments **≥ 10 cm** are modelled:
the real cloud holds orders of magnitude more debris than any catalogue tracks.
And lifetimes are order-of-magnitude only, because atmospheric density swings by
more than a factor of ten across the solar cycle and solar activity is not
modelled — so they are reported in bands, never as dates.

### Impact mechanics, and one error worth recording

Energy is taken in the **centre-of-mass frame**, which is the only frame in
which it means anything — in Earth-centred coordinates each object carries tens
of gigajoules simply by being in orbit, and almost none of that can break
anything. What is available is `E = ½·μ·|v_rel|²` with the reduced mass
`μ = m₁m₂/(m₁+m₂)`.

The obvious next step is wrong, and the model got it wrong first. Launching the
whole fragment cloud from the pair's centre of mass looks right — that is where
the combined momentum goes — but for two comparable masses meeting at a large
angle `|v_cm|` is far *below* orbital speed. A 139° encounter between equal
masses leaves the centre of mass at about 2.6 km/s, so every fragment lands on a
sub-orbital trajectory and the model cheerfully reports that the entire cloud
de-orbits within the hour. Iridium 33 and Cosmos 2251 met at 102° with
comparable masses and produced thousands of fragments still in orbit fifteen
years later.

A hypervelocity breakup is not an inelastic merger: each body shatters and its
pieces keep *its* momentum. So the two parents' clouds are modelled separately,
each ejected about its own parent's state, with momentum conserved within each
sub-cloud. The result is bimodal, which is what is actually observed.

Differential **J2 nodal precession** then spreads the cloud: each fragment
precesses at a slightly different rate, and the spread across the cloud sets how
long a compact debris ellipsoid takes to smear into a shell around the Earth —
months to a few years, and the analysis reports it per event.

### Re-entry survival — which fragments reach the ground at all

Most debris never lands. It is destroyed by aerodynamic heating in the upper
atmosphere, and skipping that step overstates ground risk by one to two orders
of magnitude.

Each fragment is flown down an Allen-Eggers shallow ballistic entry, heated by
Sutton-Graves stagnation-point flux bridged harmonically against free-molecular
heating, averaged for a tumbling body, and demised on a lumped-mass melt
criterion — roughly what NASA's DAS does at object-level fidelity.

The bridging is not a detail. Suppressing free-molecular heating deletes exactly
the heat that light, high-area fragments experience, because they decelerate too
high to reach continuum flow at speed. That inverts the model's central result:
it makes compact heavy fragments demise and light ones survive, when the
standard scaling is that heat absorbed per unit mass goes as `√(A/m)`. A test
now asserts that scaling.

Demise altitudes come out higher than the 65–80 km that ORSAT and SCARAB report.
The A/m dependence and the survive/demise boundary near 0.15 m²/kg are the
meaningful outputs; the absolute altitude is not calibrated against flight data
and the UI says so.

### The cloud, as the field draws it

Every fragment is plotted twice at its own orbital period — once at apogee, once
at perigee. That is a **Gabbard diagram**, the standard published view of a
breakup, and the X it produces is geometry rather than coincidence: a fragment
ejected prograde raises its apogee while keeping perigee near the collision
point, and a retrograde one does the reverse, so both arms cross at the parent
orbit. Horizontal spread is the energy imparted; vertical spread is the
eccentricity it produced. Fragments whose perigee has been driven into the
atmosphere sit on the floor of the plot and are the same population counted as
immediate re-entries.

### Cascade risk — what the cloud does to everything else

The consequence analysis would otherwise stop at *here are 1,400 new objects*,
which is a fact without a consequence. The cloud is therefore fed back as an
environment, and the **added** collision rate on every crewed station and ISRO
asset is reported.

This is deliberately **not** a conjunction screen. Days after a breakup a
fragment's position *around* its orbit is no longer known — the period error
wraps within weeks — so naming specific future close approaches would invent
precision the model does not contain. What survives is the orbit's shape, so the
spread cloud is treated as a gas and a rate is computed by the particle-in-a-box
formulation of Kessler & Cour-Palais (1978), the paper this console is named
after:

```
rate = n · v · A          [collisions per second]
```

with *n* the fragment number density, *v* the mean closing speed and *A* the
asset's cross-section. It yields a rate, not a schedule.

Two details are easy to get wrong and are checked rather than assumed. Shell
occupancy is weighted by the time a fragment actually spends at each altitude
(d*t* ∝ *r*² d*ν*, so an eccentric orbit lingers near apogee) rather than by its
perigee–apogee span. And closing speed is averaged over a uniform node
distribution rather than taken as a constant — co-planar, co-altitude objects
genuinely do close slowly, which is why a constellation is safer against its own
debris than against anybody else's.

What bounds it: the gas picture needs the cloud spread around the Earth, which
nodal precession takes the reported number of days to do, so these figures are a
floor for the first weeks. Cross-sections are assumed by size class because a
TLE carries no geometry, and rate is linear in cross-section. Only fragments at
or above 10 cm are modelled. What is reported is the *increment* from one event,
never total environmental risk.

### Where the debris comes down

This is the part where a prototype is most tempted to draw a dot on a map, and
it does not.

**The longitude is not predictable.** A re-entry prediction carries roughly
±10–20% error on the remaining lifetime; applied to the final orbit that is
minutes of uncertainty, and an object at 7.7 km/s crosses a quarter of the
planet in ten. No tool can name the country, and one that does is decorating.

**The latitude is exactly predictable, and more interesting than it sounds.** An
orbit of inclination *i* never crosses ±*i* — a hard geometric bound, not a
confidence interval. Within that band the time spent at each latitude is

```
p(φ) ∝ cos φ / √(sin²i − sin²φ)
```

which says something counter-intuitive: debris is *least* likely to come down
over the equator and *most* likely near its turning latitudes, where its motion
is momentarily parallel to a line of latitude. For a 97.5° sun-synchronous
orbit, 17.7% of the re-entry probability sits in each of the two bands around
±83°, against about 2% per band through the tropics.

### Probability of collision

Derived, not authored. Miss distance and relative velocity are measured; Pc then
follows from a Foster-style circular model. The one input that is *assumed* is
the positional covariance, because a TLE does not carry one — σ grows with real
element-set age and with how well each object's size class is tracked. A close
approach between two large, well-tracked objects therefore outranks an equally
close approach involving an elderly fragment, because in the second case we
mostly do not know where anything is. The detail view discloses this, and the
Thresholds screen lets you scale σ and watch the severity banding move.

Nothing is scripted. There is no guaranteed CRITICAL event: what is on the
dashboard is what the propagator found.

## Design tokens

The palette, type scale and spacing come from the design's artboards (rev 05,
"glass"). Colours are declared once as CSS custom properties in `src/index.css`
and exposed to Tailwind as semantic tokens in `tailwind.config.js` (`bg-panel`,
`text-secondary`, `border-hairline`, `text-risk-critical`). Components never name
a raw hex.

Severity is carried down the tree by a `data-sev` attribute that sets a `--sev`
variable, so a chip, a table row and an SVG point all read the same colour
without prop-drilling. The light theme is a variable swap on
`<html data-ktheme="light">` and required no component changes.

### The glass treatment

Surfaces are white at low alpha over an opaque base, blurred. Three things have
to hold or it collapses into flat grey:

- `html` carries the only opaque background (`--base`). `body` is transparent.
- Two very large, slow-drifting radial gradients sit behind everything at
  `z-index: -2`. They are what the panels actually refract — without them the
  blur has nothing to work with.
- Every panel carries `backdrop-filter` (the `.glass` class) alongside its
  translucent background. `.lift` adds the inset top highlight and drop shadow.

One consequence worth knowing: canvas visuals cannot use `--deep` as an occluder
any more, because it is translucent. The orbital viewer fills the Earth with a
dedicated opaque `--globe` token instead, or orbit arcs show straight through it.

All ambient motion — the drifting field lighting, the CRITICAL chip pulse, the
top-bar sweep — is disabled under `prefers-reduced-motion`.

## Deliberate departures from the artboards

- **The separation chart uses a logarithmic y-axis.** Separation runs from a few
  hundred metres at TCA to ~30,000 km forty minutes either side. On a linear
  axis the miss distance, the 1 km threshold and the shape of the dip all
  collapse onto the baseline. The chrome is unchanged.
- **Charts are hand-authored SVG rather than Recharts**, because the artboards
  specify exact tick positions, dash patterns and annotation offsets that are
  quicker to hit directly than to override. Icons are geometric primitives drawn
  to match the design's hairline weight, rather than an icon library.
- **The catalogue's columns are slightly tighter** than the mockup's: the design's
  catalogue artboard is full-bleed, while this one sits inside the 196px console
  shell.

## Validating the engine

`npm run validate` runs known-answer tests, because the two ways this engine can
be wrong are both silent — a coordinate-frame mistake makes every number wrong
while every number still looks plausible, and an over-aggressive coarse filter
makes the engine faster and quieter while dropping real close approaches.

1. The ISS TLE propagates to a 380–440 km altitude band at ~7.66 km/s.
2. An object screened against itself is exactly 0 km apart at every timestep.
3. Every TCA `refine()` returns is a true local minimum of separation, checked
   by sampling either side — a range-rate sign change alone could in principle
   bracket a maximum.
4. Brute-force all-pairs, with no filtering at all, finds exactly the same
   candidates and the same distances as the filtered cascade.
5. The screening radius covers the step size at the maximum closing speed.
6. Derived perigee/apogee agree with the filter's own geometry.
7. A circular orbit spends all of its time in its own altitude shell and none in
   any other; an eccentric one demonstrably lingers near apogee.
8. Closing speed rises with plane angle and stays inside physical bounds.

It also checks the breakup model against the **observed catalogues** of three
real hypervelocity events, rather than only against its own published form.
Cosmos 1408 comes out at 0.80× the catalogued fragment count and Iridium 33 ×
Kosmos 2251 at 0.53×, both inside the factor of three the model claims for
itself. Fengyun-1C lands at 0.33× and is **reported rather than asserted**: it
fragmented well beyond what a statistical fit to the average event predicts.
Widening the band until it passed would have been tuning away a real result, and
dropping the case would have meant quoting the agreement while hiding the
disagreement — so it prints every run, with the reason.

## The single-file build

```bash
npm run build:single    # -> dist-single/index.html
```

One file, about 1.7 MB, with everything inlined: the JavaScript, the stylesheet,
the Latin font subsets, the committed orbital snapshot and the screening worker.
No server, no network, no build step at the far end — open it and the console
runs, with all 3,032 events already screened.

One caveat, and the app states it rather than failing silently: a browser will
not start a Web Worker on a page opened straight from disk (`file://` is a null
origin), so the **Run screening** button cannot re-run live there. Everything
else works, and the events on screen are a real screening run either way — they
were computed at build time by the same engine. Serve the file over http and the
live re-run works too.

## Not built

Demo mode (a scripted CRITICAL-event replay) is not implemented. Nor is
re-propagation after a manoeuvre. See "What actually
works" above, or `/console/status` in the app, for the full picture.

## Structure

```
src/
  data/         snapshot, screening engine, orbital arithmetic, risk scoring
    snapshot/   committed CelesTrak TLE files + provenance manifest
    engine/     TLE ingest, coarse screen, TCA refinement, the run pipeline
  workers/      the screening engine, off the main thread
  components/   shell, primitives, charts, canvas visuals
  routes/       one file per screen
  lib/          shared orbit projection used by the hero and the viewer
  hooks/        clock and theme
```
