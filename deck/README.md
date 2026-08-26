# Decks

## `KESSLER-SIH-2026-Idea.pptx` — the design standard

This is what a deck for this project should look like, and
[`DESIGN-NOTES.md`](DESIGN-NOTES.md) records its palette, type scale and the ten
devices that make it work. Build to it. It also lists two things to fix in it
before submitting: a leftover **SIH 2022** logo on the title slide, and `1.738`
quoted to three decimals when that figure moves run to run.

## `KESSLER-SIH-PS04.pptx` — an earlier, plainer attempt

Built on the **official SIH Idea Presentation template** and matched to it
exactly: 842 x 474 pt canvas, heading blue `1F497D`, footer bar `0070C0`,
team-name oval, SIH emblem top right. The template's own instruction slide is
obeyed on all three counts — **six slides maximum including the title**, the
idea-detail pointers left unchanged, points and diagrams rather than paragraphs.

Regenerate with:

```bash
cd deck && npm i pptxgenjs && node sih.cjs
```

`sih-emblem.png` is the SIH bulb mark rendered out of the template PDF at
900 dpi on white. Do not substitute a transparent-background copy — a PNG whose
alpha channel is opaque black paints a black box on a white slide.

### Two placeholders, on purpose

Slide 1 carries `<< enter your Team ID >>` and `<< enter your Team Name >>` in
red italic, and the team-name oval on every slide still reads "Team Name". They
are the only unfilled fields in the deck. Fill them before submitting.

### Export to PDF

The portal wants a PDF. Open the `.pptx` in PowerPoint or LibreOffice and
export; nothing in the deck needs a font beyond Calibri and Arial.

### Every figure is reproducible

No figure in the deck is estimated, projected or illustrative. Each one is
either measured by this repository or cited on slide 6.

| Figure | Where it comes from |
| --- | --- |
| 859 objects; 368,511 / 368,491 / 253,010 / 3,032; 3,710,880 propagations | `cascade` in `src/data/precomputed.json`, written by `npm run screen` |
| 62 / 62 engine checks | `npm run validate` |
| 1.14 x 10^-13 km cascade-vs-brute-force agreement | `npm run validate` |
| ~1.73 scaling exponent | `npm run scaling` — fitted to elapsed **times**, so it moves run to run (1.70-1.74 observed). The deck says so; do not quote a third decimal. |
| CARTOSAT-2C x COSMOS 2251 DEB: 1.911 km, 4.834 km/s, Pc 4.9 x 10^-4 | event `CJ-34550-41599` in `precomputed.json` |
| 3.16 km "would drop it a band" | `triageMargin()` in `src/data/triage.ts` on that event |
| 19 trackable fragments; 33 assets assessed | `analyseConsequence()` and `assessCascade()` on that event |
| 813 Iridium 33 / Cosmos 2251 fragments still tracked | line count of the committed snapshot files |
| 1.7 MB single file | `npm run build:single` |
| 813 fragments of the 2009 collision still tracked | line count of `src/data/snapshot/{cosmos-2251,iridium-33}-debris.txt` |
| MIT licence | `LICENSE` at the repository root |
| 53,000+ alerts, 10 CAMs (2024) | ISSAR 2024 |
| 20 of 22 active Indian LEO satellites; 20 CAMs in 2025 | Lok Sabha reply, August 2026 |

### Two flowcharts, and why they are drawn rather than listed

Slide 2 carries the **decision loop**: screen, rank, then a diamond asking
whether the severity band survives the sigma sweep, with two exits. The branch
is the pitch — two events with the same collision probability leave through
different exits — and a bulleted list cannot show a fork.

Slide 3 carries the **architecture**: five nodes from CelesTrak data to CDM
export, each labelled with the technology that does that stage, so the
template's "Technologies to be used" pointer is answered and the reader also
learns the order. The note under it is the claim the diagram makes: no server
appears anywhere in it.

Node badges are filled circles with a digit, not pictographs. Calibri and Arial
are the only fonts this deck can assume and neither carries the gear/database
glyphs a flow diagram usually reaches for; a judge opening this on their own
laptop gets the shapes we drew.

**The slide-3 funnel encodes its data.** Bar length is `log10(count)`, mapped so
the last stage stays legible, and the slide says so. It used to narrow by a
fixed step per row, which drew 368,491 visibly shorter than 368,511 — a chart
whose geometry contradicted its own numbers. Do not reintroduce that.

## `KESSLER-PS04.pptx` — the longer technical deck

Not the SIH submission and not on the SIH template. Built by `build.cjs`. Useful
for a technical walkthrough where six slides is not the constraint.
