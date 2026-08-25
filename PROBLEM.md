# PS-04, and where each requirement is answered

Internal Hackathon 2026, modelled on the Smart India Hackathon format and the
2026 official themes. This file exists so that a judge holding the statement can
check it against the software without reconstructing the mapping in their head.

`src/data/features.ts` is the single source of truth for what this application
can claim, and the `Registry id` column below points at the entry that governs
each row.

The `Coverage` column is a different question from the registry's `status`, and
they can legitimately differ. The registry says whether a CAPABILITY is real;
this column says how completely that capability answers a REQUIREMENT as worded.
Orbital data is `live` in the registry — the TLEs are real, complete and
refreshable — while its coverage of "live/near-live tracking" is partial, because
the app screens a committed snapshot by choice. Where the two differ, the row
says why.

---

## The statement, verbatim

**PS-04 | Space Debris Tracking & Satellite Collision Risk Prediction Dashboard**

**Category** Software  **Theme** Space Technology
**Official SIH theme mapping** Space Technology — "orbital tracking / space
situational awareness, a newer, less-saturated SIH theme"

### Background

> Low Earth Orbit is increasingly congested with active satellites and debris.
> Collision risks ("conjunction events") are a growing concern for space
> agencies and satellite operators, and most existing tools are either
> expensive, closed, or not accessible for smaller institutions/students.

### Description

> Build a dashboard that ingests publicly available orbital data (e.g., TLE data
> from CelesTrak/Space-Track) to track satellites and debris objects, predict
> close-approach ("conjunction") events between objects using orbital
> propagation, and visualize collision risk with an easy-to-read risk score and
> 3D orbit view.

### Expected Outcomes

> 1. Live/near-live orbital object tracking using open TLE datasets
> 2. Conjunction (close-approach) detection between object pairs with risk scoring
> 3. 3D/2D visualization of orbits and flagged risk events
> 4. Simple alert list for "high-risk" upcoming conjunctions

### Implementation Notes

> CelesTrak publishes free, no-signup TLE data for thousands of tracked objects,
> which removes the biggest usual blocker (data access) for this theme. The core
> logic is: pull TLEs for a chosen set of objects, propagate their positions
> forward in time, and flag pairs whose predicted separation drops below a
> threshold within the next N hours. **A working 2D orbit plot with flagged
> pairs highlighted is a perfectly strong demo — a full 3D globe view is a
> nice-to-have, not required to prove the concept.**

### Round scope, judging and deliverables

> **Feasibility for Internal Round:** All 7 problem statements below are scoped
> to be realistically buildable as a prototype/MVP within a typical internal
> hackathon window. Each includes the minimum viable version judges should
> expect — anything beyond that is explicitly marked as a stretch goal, not a
> requirement.
>
> **Judging Scheme (SIH-style):** Idea/Innovation · Technical Feasibility ·
> Impact · Prototype/MVP Quality · Presentation
>
> **Deliverables:** Prototype/MVP + PPT (SIH-style) + 3-min YouTube Demo Video

---

## Requirement mapping

| # | Requirement | Where it is answered | Route | Registry id | Registry status | Coverage |
|---|---|---|---|---|---|---|
| — | Ingest publicly available TLE data (CelesTrak/Space-Track) | Five committed CelesTrak GP groups, 859 objects, verbatim three-line TLEs with a provenance manifest. `scripts/fetch-snapshot.sh` refreshes them. | — | `data` | live | **full** |
| — | Predict conjunctions using orbital propagation | Real SGP4 via satellite.js. Radial apogee/perigee filter → 60 s sweep with a 450 km gate derived from the step size → bisection on range-rate sign change for the exact TCA. 368,511 pairs → 3,032 events. | `/console` | `engine` | live | **full** |
| — | Easy-to-read risk score | 0–100 composite, banded by Pc, with the weights and each term's contribution printed on the event page. | `/console/conjunction/:id` | `detail` | live | **full** |
| 1 | Live/near-live orbital object tracking using open TLE datasets | Open CelesTrak TLEs, refreshable by one command — but the app screens a **committed snapshot**, not a live feed, and the console clock is anchored to the capture instant. See "Where we depart from the statement" below. | `/console/catalogue` | `data` | live | **partial — by choice** |
| 2 | Conjunction detection between object pairs with risk scoring | The screening cascade above, plus Foster-style Pc, severity banding, and a per-event triage verdict stating what would have to change for the event to stop mattering. | `/console` | `engine`, `detail` | live | **full** |
| 3 | 3D/2D visualization of orbits and flagged risk events | 2D orbital viewer with a time scrubber, layer toggles and a **Flagged conjunctions** layer drawn from the screening run. The statement names 2D as sufficient. | `/console/viewer` | `viewer` | live | **full** |
| 4 | Simple alert list for "high-risk" upcoming conjunctions | Editable alert rules — minimum severity, ISRO-only scope, miss distance, lead time — each showing its live match count and the events it caught, linked to their detail pages. Default rule is "ISRO fleet, HIGH and above, within 5 km, 72 h". | `/console/alerts` | `alerts` | partial | **full — the statement asks for a list, not delivery** |

Every requirement in the statement is addressed. The one that is not fully
covered — "live/near-live" — is short by a decision that is argued below, not by
an unfinished feature.

---

## Where we depart from the statement, and why

**"Live/near-live" is a committed snapshot.** This is the one place the software
deliberately does less than the words allow, and the reason is that doing more
would make the numbers worse. Every element set in `src/data/snapshot/` was
captured at one instant — 2024-11-17T23:05:00Z — so their epochs are mutually
consistent. That is what makes a screening run mean anything: SGP4 propagates
mean elements and only tells the truth near its epoch, so screening a set of
TLEs fetched at different times against each other compares positions of
differing trustworthiness and reports the difference as geometry.

The console clock is therefore anchored to the capture instant and advances in
real time from it. Countdowns tick live; absolute timestamps stay honest about
when the data is from. `scripts/fetch-snapshot.sh` re-pulls from CelesTrak on
demand, so the pipeline is live — the demo is not, on purpose, because a
prototype that depends on conference wifi is a prototype that fails in front of
judges.

**"3D orbit view" is 2D.** The statement's own implementation notes call a 2D
plot with flagged pairs "a perfectly strong demo" and a 3D globe "a nice-to-have,
not required to prove the concept", so this is a departure from the Description
line and not from the requirement. It was also a deliberate engineering call:
three.js is a large dependency that would break the single-file offline build
and add no analytical capability the 2D viewer lacks.

**Alert delivery does not exist.** Rules match real events against the current
thresholds and report what they caught. Nothing is sent anywhere, because there
is no backend to send it from, and the page says so instead of showing a dead
"Send test" button. The statement asks for an alert *list*, which exists.

---

## What this project does that PS-04 did not ask for

Listed because a judge should be able to tell scope we chose from scope we were
given, and because these are where the marks for Idea/Innovation sit.

| Capability | Where | Status |
|---|---|---|
| The honesty registry — the interface renders capability status from one source, so it cannot present something unbuilt as working | `/console/status` | live |
| Collision consequence chain — NASA Standard Breakup Model, King-Hele decay, Sutton-Graves re-entry heating, Kessler cascade rate | `/console/analysis` | partial — masses assumed |
| Manoeuvre planning by differential re-propagation of a burn | `/console/manoeuvres` | live |
| CCSDS 508.0-B-1 Conjunction Data Message export, so output enters an operator's existing pipeline | dashboard, every event | live |
| Positional uncertainty measured by successive TLE differencing | `engine/tleUncertainty.ts` | implemented, awaiting a multi-epoch history |
| Sensitivity of the whole board to the σ assumption | `/console/thresholds` | live |
| Re-entry latitude bound from inclination; longitude deliberately not predicted | `/console/analysis` | live |
| Measured scaling curve — fitted exponent 1.738 over six catalogue sizes | `npm run scaling` | live |
| Runs offline from a single file, no backend, no network at runtime | `npm run build:single` | live |

---

## Against the judging scheme

| Criterion | Where it is evidenced |
|---|---|
| **Idea / Innovation** | The registry that makes overstatement structurally impossible; the triage verdict; CDM interoperability; measuring σ rather than assuming it. Not a machine-learning model — see `DEMO.md` for why that is a deliberate, evidenced refusal. |
| **Technical Feasibility** | 62 known-answer tests, including brute-force agreement to 1.14 × 10⁻¹³ km and the breakup model checked against three real catalogued events. Runs offline on free data. |
| **Impact** | ISRO generated over 53,000 close-approach alerts in 2024 and flew ten manoeuvres. The scarce resource is triage, which is what this ranks. 20 of India's 22 active LEO satellites are formally assessed as facing elevated risk. |
| **Prototype / MVP Quality** | Every requirement addressed; nothing in the interface is a dead control; `npm run build` and `npm run validate` are clean from a fresh clone. |
| **Presentation** | `DEMO.md` — the 90-second opening, the click path with real event IDs, and prepared answers. **The PPT and the 3-minute video are not in this repository and are still to be produced.** |

---

## Deliverables status

| Deliverable | Status |
|---|---|
| Prototype / MVP | Complete — `npm run dev`, or `npm run build:single` for one offline file |
| PPT (SIH-style) | **Not started** |
| 3-min YouTube demo video | **Not started** — `DEMO.md` section 2 is the script for it |

---

## How to keep this honest

If you change what a capability does, change its `status` in `src/data/features.ts`
**in the same commit**, and check whether a row above moved with it. That rule is
the project's credibility mechanic; a judge who catches one overstatement stops
believing the rest.
