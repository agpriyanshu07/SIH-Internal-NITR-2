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

Two more, both offline:

```bash
npm run screen      # re-run the screening engine and commit the result
npm run validate    # known-answer tests for the engine
```

`npm run screen` is deterministic: re-running it reproduces all 2,955 events
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
be served from any static host or subdirectory without server-side rewrites. It
is not yet a single self-contained file — Chrome blocks ES modules loaded over
`file://`, so opening `dist/index.html` directly still needs a local static
server (`npm run preview`).

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
| `/console/status` | Prototype status — what is wired up and what is not |

## What actually works

`/console/status` is the authoritative, in-app answer, generated from
`src/data/features.ts`. The short version:

**Live** — the screening engine and the orbital data behind it, the conjunction
dashboard (filters and sorts genuinely filter and sort), event detail, orbital
viewer, object catalogue, screening thresholds, Export CSV, and Run screening.

**Partial** — positional uncertainty (the 1-sigma feeding Pc is assumed, not
measured — see below), acknowledgements (remembered in your browser, sent
nowhere), and sign in. The sign-in form validates and sets a local display name
for the console avatar. There is no backend, so nothing is authenticated: no
password is requested, no credential is checked, transmitted or stored, and no
link is sent.

**Not built** — Asset register, Alert routing and API keys. These are marked
`NOT BUILT` in the sidebar rather than left looking clickable.

Screening thresholds are not a dead form: they write to shared state that the
dashboard and manoeuvre log both read, they persist across reloads, and changing
one visibly changes the dashboard's event count. Defaults admit everything, so a
fresh console shows the full set.

## How the data works

### The snapshot

`src/data/snapshot/` holds four CelesTrak GP groups as verbatim three-line TLE
files, all captured at one instant so their epochs are mutually consistent:

| Group | Objects | What it is |
| --- | --- | --- |
| `stations` | 14 | ISS and CSS modules plus visiting crew and cargo vehicles |
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
352,380 pairs
   -> 352,380 after the radial overlap filter
   -> 239,972 coarse candidates   (34 dropped as co-orbiting)
   ->   2,955 confirmed events    inside a 25 km gate
3,628,800 SGP4 propagations, ~26 s
```

The radial filter removes nothing here, and the dashboard says so. All four
groups occupy overlapping LEO shells, and the 450 km gate is wider than the gaps
between them — the filter earns its keep on a catalogue spanning LEO to GEO, not
on four debris clouds sharing an altitude band. Reporting the measured number
rather than a flattering one is the point of that panel.

The closest approach it finds is **81 m**, between an Iridium 33 fragment and a
Cosmos 2251 fragment — two pieces of the same 2009 collision, still crossing.

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

## Not built

Demo mode (a scripted CRITICAL-event replay) and a single-file static build are
not implemented. Nor is re-propagation after a manoeuvre. See "What actually
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
