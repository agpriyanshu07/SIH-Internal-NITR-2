# The problem statement, and where each requirement is answered

> **This file is incomplete, and deliberately so.** The statement text below is
> a placeholder. Paste the official Smart India Hackathon problem statement in
> verbatim — number, organisation, title, description, expected outcomes — and
> then check the mapping table against it. Nothing else in this repository can
> be verified against a statement that is not written down.

## Why this file exists

The judging criteria for this competition include *fit to the problem
statement* as a scored axis, and it is the one axis this repository could not
support. Everything else here is checkable: `npm run validate` runs 62 checks,
`npm run screen` reproduces every event, `/console/status` reports what is built
from a registry the interface renders from. The one thing a reader could not do
was confirm that any of it answers the question that was asked.

That is a strange gap in a project whose entire argument is that it never claims
anything it cannot back. So: the statement goes here, and every requirement in
it gets a row.

---

## Statement

**Problem statement ID —** _paste_
**Organisation —** _paste_
**Category —** _paste_
**Theme —** _paste_

### Title

_paste_

### Description

_paste verbatim, including the parts this project does not address_

### Expected outcomes / deliverables

_paste_

---

## Requirement mapping

One row per requirement in the statement above. `Status` uses the same three
values as `src/data/features.ts`, and must agree with it — the registry is the
source of truth and this table is a view onto it.

| # | Requirement (from the statement) | Where it is answered | Route | Registry id | Status |
|---|---|---|---|---|---|
| 1 | _paste_ | | | | |
| 2 | _paste_ | | | | |
| 3 | _paste_ | | | | |

### Requirements this project does NOT address

List them. A statement almost always asks for more than one prototype delivers,
and a judge who finds an unaddressed requirement you have not mentioned assumes
you missed it; one you have listed reads as scope you chose. Say which, and why.

| Requirement | Why not | What it would take |
|---|---|---|
| | | |

---

## What the project answers whether or not the statement asks for it

Written before the statement was pasted in, from what the code actually does.
If a row here has no home in the mapping table above, that is worth noticing in
both directions: either the statement asks for something this does not do, or
this does something the statement did not ask for.

| Capability | Where | Status |
|---|---|---|
| SGP4 conjunction screening over real element sets | `/console` | live |
| Filter cascade — 368,511 pairs to 3,032 events, measured at each stage | `/console` cascade panel | live |
| Exact time of closest approach by bisection on range rate | `engine/refine.ts` | live |
| Foster-style collision probability over a disclosed, assumed σ | every event | partial — σ is assumed |
| Severity banding and a 0–100 triage score, with the model printed | `/console/conjunction/:id` | live |
| The counterfactual: what would have to change for an event to stop mattering | `/console/conjunction/:id` | live |
| Sensitivity of the whole board to the σ assumption | `/console/thresholds` | live |
| Manoeuvre planning by differential re-propagation of a burn | `/console/manoeuvres` | live |
| Collision consequence — breakup, decay, re-entry survival, cascade rate | `/console/analysis` | partial — masses assumed |
| Re-entry latitude bound from inclination; longitude deliberately not predicted | `/console/analysis` | live |
| Object catalogue with annotated element sets | `/console/catalogue` | live |
| ISRO fleet filter | `/console/catalogue?isro=1` | partial — one fixed register |
| Alert rules matched against live screening results | `/console/alerts` | partial — no delivery |
| Export: CSV, and CCSDS 508.0-B-1 Conjunction Data Messages | dashboard and every event | live |
| Positional uncertainty measured by successive TLE differencing | `engine/tleUncertainty.ts` | implemented, not fed — see registry |
| Runs offline from one file, no backend, no network at runtime | `npm run build:single` | live |

---

## How to keep this honest

`src/data/features.ts` is the single source of truth for what this application
can claim. If a row above disagrees with the registry, the registry is right and
this file is stale. The same rule applies here as everywhere else in the
project: **if you change what a capability does, change its status in the same
commit.**
