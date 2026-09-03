# Deck design notes — the standard to build to

`KESSLER-SIH-2026-Idea.pptx` in this directory is the reference. It is what a
deck for this project should look like. Anything built here from now on matches
it; do not fall back to the plainer style of `KESSLER-SIH-PS04.pptx`, which is
kept only as the earlier attempt.

Read this file before touching a deck.

## Canvas and chrome

- **13.333 x 7.5 in** (12192000 x 6858000 EMU) — standard 16:9, NOT the SIH
  template PDF's 842 x 474 pt. The template's own footer bar and logo are
  carried over onto that wider canvas.
- Slide 1 is **full-bleed dark** (`152233`). Slides 2-6 are white with dark
  panels. The dark/light sandwich is deliberate.
- `<TEAM NAME>` sits top-left on every content slide; the SIH 2026 logo lockup
  top-right; the blue `@SIH Idea submission- Template` bar at the foot.

## Palette (sampled from the file, most-used first)

| Hex | Role |
| --- | --- |
| `44546A` | body text, the dominant ink |
| `152233` | dark panel and slide-1 background |
| `F2913F` | **orange accent** — kickers, key figures, the one highlighted mark |
| `D9741F` | deeper orange, inline emphasis on light ground |
| `7F8FA2` `6B7F94` `9DAEC1` | muted greys, three steps |
| `D8E0E9` `EEF3F9` `F3F6FA` | hairlines and panel tints |
| `2E9E6B` | green — pass, mitigation, "it works" |
| `D8544A` | red — risk rules |
| `0070C0` | the template's footer blue, unchanged |

Orange is the accent and it is used sparingly — one figure, one kicker, one
mark. Everything else is navy/grey. **Arial throughout** (292 runs); a
letterspaced mono-ish treatment carries the micro-labels.

## Type scale

Body sits at **8.4-9 pt** — much smaller than a normal deck, which is what buys
the density. 12-14.5 pt for card headlines. Big figures run large and bold.

## The devices that make it work

1. **A dark hero band across the top of every content slide.** Inside it: the
   template's own pointer text as an orange uppercase letterspaced kicker
   (`PROPOSED SOLUTION · DESCRIBE YOUR IDEA / SOLUTION / PROTOTYPE`), then a
   one-sentence thesis with the second half bold white, then 2-3 KPI figures
   right-aligned in the same band. It answers the template pointer AND states
   the argument AND shows the numbers, in one object.
2. **Cards with a coloured left accent bar** — one card per template pointer,
   blue / orange / green.
3. **Uppercase letterspaced micro-labels** as group headers over bracketed
   container frames (`OPEN DATA`, `SCREENING ENGINE · ~400 LINES`, `RISK MODEL`,
   `DELIVERY`). This is the main hierarchy device; there are 3-4 levels on a
   slide.
4. **Real product screenshots**, captioned in the same micro-type
   (`2D ORBITAL VIEWER · FLAGGED-CONJUNCTION LAYER · REAL ELEMENT SETS`). The
   deck shows the console rather than describing it.
5. **Real charts.** A tapered funnel ribbon on dark, blue fading to orange, with
   counts above each stage and a sentence below. A log-log scaling plot with a
   measured series and a dashed n^2 baseline. Not bars.
6. **A dot-matrix figure**: 5,300 marks, one of them orange, labelled
   `THE ONE THAT BECAME A DECISION`. It makes the alerts-per-manoeuvre ratio
   visceral in a way a number cannot.
7. **Technology logos** as actual icons (React, TypeScript, Vite, Tailwind,
   Node, satellite.js) rather than names in a table.
8. **Code identifiers in mono, in orange** — `parse.ts`, `screen.ts`,
   `COVARIANCE_METHOD = DEFAULT`, `npm run build:single`, `src/data/engine/`.
9. **Risk cards** with a red top rule, a `RISK 01 · DATA` kicker, then a
   hairline and a green `MITIGATION` sub-block.
10. **Numbered reference list** with orange `01`-`10` and the citation greyed
    after the title.

## Two things in the reference to fix before submitting

Both are factual, both are small:

- **Slide 1 carries the SIH 2022 logo.** `ppt/media/image1.png` is the
  `SMART INDIA HACKATHON 2022` lockup, placed at x=7.50 y=1.88, 3.50 x 3.75 in
  — a large graphic in the middle-right of the title slide. It is the SIH
  template's own leftover art. The correct 2026 lockup (`image2.png`) is
  already on the same slide, top-right. Delete the 2022 one.
- **`1.738` is quoted to three decimals** on slides 4 and 6. That figure is
  fitted to elapsed *times*, so it moves with the machine and the run: 1.702,
  1.734 and 1.742 came out of three runs here. A judge running
  `npm run scaling` will not get 1.738. Quote it as ~1.73 with the 1.70-1.74
  range, or state that it is machine-dependent. The shape of the curve and the
  gap from n^2 is the real finding; the third decimal is not.

## The rule that outranks the design

`src/data/features.ts` and the honesty rule it enforces (see the capability
section of the root [`README.md`](../README.md)) still apply to every
figure a deck prints. A better-looking slide does not get to make a looser
claim. Every number in the reference deck maps to a command in
[`README.md`](README.md) in this directory — keep that table current.
