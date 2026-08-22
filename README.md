# KESSLER — front-end prototype

A clickable prototype for an orbital conjunction screening console: it tracks
satellites and debris in Low Earth Orbit and ranks predicted close approaches.

> **All data in this application is synthetic.**
> There is no backend, no network access, and no orbital propagation. Object
> names, NORAD IDs, element sets, miss distances and collision probabilities are
> fabricated by a seeded generator. Nothing here should be used for any
> operational purpose.

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

**Live** — the conjunction dashboard (filters and sorts genuinely filter and
sort), event detail, orbital viewer, object catalogue, manoeuvre log, and
screening thresholds.

**Partial** — sign in. The form validates and sets a local display name for the
console avatar. There is no backend, so nothing is authenticated: no password is
requested, no credential is checked, transmitted or stored, and no link is sent.

**Not built** — Asset register, Alert routing, API keys, and the Export CSV, Run
screening and Acknowledge event buttons. These are marked `NOT BUILT` in the
sidebar rather than left looking clickable.

Screening thresholds are not a dead form: they write to shared state that the
dashboard and manoeuvre log both read, they persist across reloads, and changing
one visibly changes the dashboard's event count. Defaults admit everything, so a
fresh console shows the full set.

## How the data works

Everything lives in `src/data/` and is generated at module load from two fixed
seeds, so the catalogue is byte-identical on every reload and on every machine.
`Math.random()` is never called.

- **`objects.ts`** — ~400 objects. The sixteen named in the design mockups are
  included verbatim as anchors; the rest are generated from family templates
  (Starlink shells, OneWeb planes, the Fengyun 1C and Cosmos 2251 debris clouds,
  spent upper stages) so altitudes, inclinations and naming stay plausible.
- **`conjunctions.ts`** — 60 events over a 72-hour horizon. Pairs must pass a
  coarse apogee–perigee overlap filter before they are considered, which is the
  same first-pass screen the landing page describes.
- **Probability of collision is derived, not authored.** Miss distance, relative
  velocity and element-set age are drawn from the generator; Pc then follows from
  a Foster-style circular model. Two consequences worth knowing when demoing:
  - Relative velocity comes from the actual angle between the two orbit planes,
    so co-planar conjunctions are genuinely slow and crossing ones are fast.
  - Positional uncertainty (σ) grows with element-set age *and* with how poorly
    each object is tracked. A close approach between two large, well-tracked
    objects therefore outranks an equally close approach involving an elderly
    debris fragment — because in the second case we mostly do not know where
    anything is. This is why `ISS × COSMOS 2251 DEB` at 0.412 km sits *below*
    `ISS × ATLAS 5 CENTAUR R/B` at 0.190 km.

The generator guarantees at least two CRITICAL events and one TCA under 90
minutes away, so the dashboard always opens with something urgent on it.

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

## Not built

Demo mode (the scripted CRITICAL-event replay) and a single-file static build are
not implemented. See "What actually works" above, or `/console/status` in the
app, for the full picture.

## Structure

```
src/
  data/         seeded generator, orbital arithmetic, formatting, risk scoring
  components/   shell, primitives, charts, canvas visuals
  routes/       one file per screen
  lib/          shared orbit projection used by the hero and the viewer
  hooks/        clock and theme
```
