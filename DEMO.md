# KESSLER — demo, pitch and Q&A

Everything in this file is a number the repository can produce on demand. Where
a figure comes from a command, the command is named. Nothing here is rounded up
for effect, and nothing is a placeholder — if a figure changes because the
snapshot is refreshed, re-run the command and change it here too.

Sources used throughout:

| Figure | Where it comes from |
| --- | --- |
| Cascade counts, raw event counts | `src/data/precomputed.json` |
| Screened counts, severity split | the same file after `DEFAULT_THRESHOLDS` — what the dashboard displays |
| Engine claims | `npm run validate` (49/49) |
| Historical breakup comparisons | `npm run validate`, section 15 |
| Hero stats | `HERO_STATS` in `src/routes/Landing.tsx`, read from the run |

Snapshot under demo: **CelesTrak, captured 2024-11-17T23:05:00Z, 859 objects**
across five groups — stations, ISRO assets, Cosmos 1408 debris, Iridium 33
debris, Cosmos 2251 debris.

---

## 1. The 90-second opening

Timings are for speaking at a normal pace. Do not rush the numbers; they are
the argument.

> **[0:00 — the event, 20 s]**
>
> In February 2009, the Iridium 33 communications satellite struck the derelict
> Cosmos 2251 at a closing speed of about **11.7 km per second**. The collision
> produced more than **1,800 catalogued fragments**, and most of them are still
> up there. Every one is now something else that has to be screened against.
>
> **[0:20 — why it is India's problem, 20 s]**
>
> We screened a real slice of that catalogue — 859 objects, real element sets,
> nothing invented. In a 72-hour window it found **3,032 close approaches**, and
> the console shows the **2,901** that pass its default quality filter.
> **72 of those involve an ISRO-operated asset.** The single highest-ranked event
> in the entire run is **CARTOSAT-2C passing 1.911 km from a fragment of Cosmos
> 2251**, closing at 4.834 km/s, with a collision probability of **4.9 × 10⁻⁴**
> — about one in two thousand. That is a fragment of a 2009 American-Russian
> collision, on a course with an Indian earth-observation satellite, fifteen
> years later.
>
> **[0:40 — what we built, 30 s]**
>
> KESSLER is a conjunction screening console that runs entirely in the browser.
> Public two-line element sets, SGP4 propagation, a filtering cascade that takes
> **368,511 pairs down to 3,032 confirmed events**, and then a ranked list an
> operator can act on. No backend, no network at runtime, no licensed data. A
> university team with one cubesat gets the same pipeline as an operator with
> four hundred satellites.
>
> **[1:10 — the part we want to be judged on, 20 s]**
>
> The thing we are proudest of is a page that lists what this software *cannot*
> do. Every capability carries a status — live, partial, or not built — and the
> app refuses to render a claim that is not backed by code. We would rather show
> you the boundary than let you find it.

**Do not say** "real-time", "AI-powered", or any object count larger than 859.
The catalogue holds tens of thousands; we screen 859 and the UI says so.

---

## 2. The live demo path

Roughly six minutes at a walking pace; the three-minute video should cut steps
4 and 6. Run it from `dist-single/index.html` (see §5).

### Landing → `/`

Point at the hero canvas for one sentence only: *"every object on that globe is
a real element set — it is a schematic, not a propagation, and the label says
so."* Then scroll straight past. The landing page is context, not the product.

### Dashboard → `/console`

This is the screen that earns the pitch. Point at the **pair-reduction cascade**
panel and read the funnel out loud:

```
859 objects
368,511 pairs                        every unordered pair
368,491 after the radial filter      apogee/perigee bands cannot overlap
253,010 coarse candidates            within 450 km at some 60 s step
     34 dropped as co-orbiting       docked/formation pairs, never separate
  3,032 CONFIRMED EVENTS             refined to a true TCA inside 25 km
```

with **3,710,880 SGP4 propagations in 15.1 seconds**.

Say the sentence that matters: *"450 km is not a tuning knob. It is 15 km/s
maximum closing speed times the 60-second step, halved. Change the step and the
radius has to change with it, and the validation suite fails if it does not."*

**Know which number is on screen.** The run produced 3,032 events; the
dashboard says **2,901**, because the default thresholds exclude any pair whose
older element set is more than 10 days stale. Those 131 events are not hidden,
they are *disqualified* — and that is a talking point, not an awkwardness: a
prediction from a stale TLE should be withheld, not displayed. Raise the age
limit on the Thresholds screen and watch them come back.

Severity split at the default thresholds: **27 HIGH, 77 MEDIUM, 149 LOW,
2,648 NOMINAL.** Note that **all 27 HIGH events involve debris from a deliberate
or accidental destruction** — that line is already on the dashboard.

Then hit **ISRO assets · 72** to filter, and **Run screening** to show the same
engine re-running live in a Web Worker rather than replaying a cached answer.

### One real event → `/console/conjunction/CJ-34550-41599`

**CARTOSAT-2C × COSMOS 2251 DEB.** The top-ranked event in the run, and the
right one to open because it is an Indian asset.

- miss **1.911 km**, relative velocity **4.834 km/s**
- Pc **4.9 × 10⁻⁴**, severity **HIGH**, score **80**
- oldest element set in the pair **1.29 days**, σ **1.41 km**

Show the **separation chart** — it is computed on demand, 242 SGP4 calls, not a
stored curve — and then the **risk model breakdown**. Say: *"miss distance and
relative velocity are measured. Pc is derived from them. The one assumed input
is the positional covariance, because a TLE does not carry one — and σ is on
screen, not buried."*

### Manoeuvre log → `/console/manoeuvres`

Open the **burn advisor**. Drag delta-v and watch the post-burn miss distance
move. The line to deliver: *"this is not `3 · Δv · t` printed as if it were a
simulation. Both the burned and the unburned state go through the same
universal-variable integrator and only their difference is used, because SGP4
propagates mean elements and is not invertible. The validation suite checks the
re-propagated displacement against the closed form and they agree to 3.9%."*

### Analysis workbench → `/console/analysis`

Two panels to show, in this order:

1. **Gabbard diagram** — the fragment cloud in period-versus-altitude space, the
   shape a real breakup makes.
2. **Cascade risk** — the added collision rate the cloud imposes on everything
   still flying, with the debris shell forming in a few years through J2 nodal
   precession.

Then drag the **target mass** slider and let the fragment count move. The
sentence: *"fragment count scales as mass to the 0.75, and a TLE carries no
mass. So mass is a control, not a constant. An assumption you can sweep is a
finding; one buried in a constant is a claim."*

### Status → `/console/status`

Finish here, deliberately. This is a feature, not an apology.

*"Every capability in this console has a status in one registry file, and that
file drives the sidebar markers and this page. Alert routing: not built — there
is no backend to deliver anything. API keys: not built — there is no API. The
manoeuvre log's burn records are synthetic and it says so. We built the thing
that tells you what we did not build."*

---

## 3. Judge Q&A

### Q. TLEs and SGP4 are not precise enough for collision avoidance. How do you justify a 1.9 km miss distance?

We do not claim operational precision, and the app does not either.

SGP4 on public TLEs carries roughly kilometre-scale along-track error that grows
with element-set age — comparable to the miss distances we are reporting. That
is exactly why the console never shows a miss distance without its **element-set
age** beside it, and why age feeds the uncertainty directly:

```
σ = 0.9 km + 0.055 · (age_A + age_B) days + a per-size-class tracking penalty
```

so a pair of elderly fragments is scored as *less* alarming than an equally
close pass between two well-tracked large objects — because in the second case
we mostly do not know where anything is. On the demo event, σ is 1.41 km against
a 1.911 km miss: the console is telling you the uncertainty is the same size as
the answer, which is the honest thing to say.

Three concrete guards: the console clock is anchored to the snapshot capture
instant rather than the wall clock, because SGP4 only tells the truth near its
epoch; the Thresholds screen lets you scale σ and watch the severity bands move
live; and there is a maximum element-set age filter, because a prediction from a
stale TLE should be excluded rather than displayed.

What a real operator does next is get a CDM from the 18th/19th Space Defense
Squadron with an actual covariance. This tool tells you **which pair to go ask
about** — it is a triage layer over public data, not a replacement for tracking.

### Q. This is 859 objects. The real catalogue is tens of thousands. Does it scale?

The cascade is the answer, and we measured it rather than asserting it.

All-pairs is O(n²): 859 objects is 368,511 pairs, and 30,000 objects would be
about 450 million. What matters is the **rejection rate at each stage**, which
is a property of orbital geometry, not of catalogue size:

| Stage | Pairs | Cost |
| --- | --- | --- |
| all pairs | 368,511 | — |
| after radial apogee/perigee filter | 368,491 | O(1) per pair, no propagation |
| coarse 60 s sweep, 450 km gate | 253,010 | the propagation cost |
| refined to a true TCA inside 25 km | 3,032 | bisection, 24 steps per candidate |

**3,710,880 SGP4 propagations in 15.1 seconds** — about 245,000 propagations
per second, single-threaded, in Node. The sweep is the O(n·steps) part and it
parallelises across objects trivially; the pair test is what scales quadratically
and it is the cheap half.

Two honest caveats. First, our radial filter rejects almost nothing on *this*
catalogue — 20 pairs out of 368,511 — because these five groups occupy
overlapping LEO shells by construction. On a full catalogue spanning LEO to GEO
it does most of the work, so this number would improve, not degrade. Second, the
right structure at 30,000 objects is spatial binning per time step rather than a
pair loop, and we have not built that.

And `npm run validate` proves the cascade is not cheating: it screens a subset
by brute force and by cascade and requires them to agree — **505 candidates
both ways, 0 missed, 0 extra, minimum distances agreeing to 1.14 × 10⁻¹³ km.**
A faster filter that quietly drops real conjunctions is worse than no filter.

### Q. CelesTrak already publishes SOCRATES. Why does this exist?

SOCRATES is excellent and we are not competing with it. Three differences:

1. **It is a report; this is an instrument.** SOCRATES gives you a ranked table
   on a schedule. Here every assumption is a control: scale σ and watch the
   severity banding move, change the horizon, change the miss threshold, sweep
   the fragment mass. You can ask "what would have to be true for this to be
   serious" and get an answer in the same session.

2. **It stops at the conjunction; this continues past it.** Nothing published
   answers "and then what". This console takes a real event through the NASA
   Standard Breakup Model to a fragment cloud, King-Hele decay to orbital
   lifetimes, Sutton-Graves heating to which fragments survive re-entry and a
   ground casualty area, and a Kessler particle-in-a-box to the added collision
   rate on everything still flying. Published models, applied to a real event.

3. **It runs with no network, and it shows its work.** The snapshot is committed
   and bundled; the console opens from a single file with the wifi off. The
   engine is in the repository, the screening run is one command, and the
   dashboard's precomputed result and a live in-browser re-run are the same code
   — so they produce the same numbers by construction.

The honest framing: SOCRATES is upstream truth we would happily consume. What we
add is *interrogability* and the consequence chain.

### Q. Why not just buy a commercial conjunction-assessment tool?

Because the people who most need screening cannot.

Commercial CA services are priced for constellation operators. A university
group flying one 3U cubesat, or an early-stage Indian startup with a first
launch, is exactly the operator who has no flight-dynamics team, no procurement
budget, and — because they are small and in a crowded shell — a real
conjunction problem. The entry cost is not the licence, it is the licence *plus*
the analyst.

So this is deliberately built on inputs anyone can obtain: public catalogue data,
no licence negotiation, no minimum contract, no data you are contractually
barred from inspecting. The engine is open, and every assumption is stated where
it is used rather than hidden behind a vendor's model.

There is also a sovereignty argument worth making plainly: an Indian operator
depending on a foreign commercial provider for the question "is my satellite
about to be hit" is depending on it for something that is not commercially
negotiable in a crisis. A screening layer you can run yourself, on open data, is
strategic infrastructure regardless of whether it is as good as the paid tool.

And to be clear about what we are not claiming: this is not certified, not
operational, and not a replacement for a CDM with a real covariance. It is the
triage step that tells a small operator which pair is worth escalating.

---

## 4. If a judge pushes on a number

Answers we should have ready, with the honest version first.

- **"Your breakup model under-predicts Fengyun-1C by 3×."** Yes, and the
  validation suite says so in those words rather than hiding it. Predicted 1,142
  against roughly 3,500 catalogued. Cosmos 1408 comes in at 0.80× and
  Iridium/Cosmos at 0.53×. The NASA model is statistical and Fengyun-1C
  fragmented well beyond what it predicts. We report the discrepancy as a NOTE
  in the test output because a model that always agrees with you is not being
  tested.
- **"Your re-entry demise altitudes look high."** They are. They run above the
  65–80 km that ORSAT and SCARAB report, and CLAUDE.md says not to quote them as
  validated. The meaningful outputs are the *area-to-mass dependence* and the
  survive/demise boundary, both of which the suite checks. We did not tune the
  model to hit a published number.
- **"Where does the radar cross-section come from?"** A TLE does not carry one.
  It is inferred from object class — fragments small, stages and crewed modules
  large — and it moves Pc through the hard-body radius and the σ penalty. The
  detail view's data-quality panel discloses it.
- **"You say 1,800 fragments; I have read 2,300."** Both are in this repo and
  they do not contradict: the landing page says "more than 1,800 catalogued
  fragments", and the validation suite's historical check uses ~2,300 across
  both clouds as the comparison figure. Published counts for the 2009 collision
  vary with the epoch of the catalogue and whether both parents are counted
  together. Say "more than 1,800, and roughly 2,300 across both clouds by later
  counts" and move on — do not defend a single number nobody agrees on.
- **"Is any of this hard-coded?"** The dashboard's numbers come from
  `precomputed.json`, which `npm run screen` regenerates from the committed TLEs
  in one command, deterministically — the only field that changes between runs
  is the elapsed time, because that is a measurement of the machine. Press
  **Run screening** and the same engine runs live in a worker.

---

## 5. Rehearse offline. Campus wifi will betray you.

```bash
npm run build:single
```

That writes **one** file, `dist-single/index.html`, with the JavaScript, the
stylesheet, the font subsets, the committed TLE snapshot and the screening
worker all inlined. Open it by double-clicking. No dev server, no static host,
no network.

**Do the full run-through from that file at least once before presenting**, not
from `npm run dev`. It is the same application, but it is the artefact you will
actually be standing in front of, and the only way to find out that something
depends on the dev server is to try it without one.

Checklist for the morning of:

- [ ] `npm run build` and `npm run validate` both clean (validate must say 49/49)
- [ ] `npm run build:single`, then open `dist-single/index.html` **with wifi off**
- [ ] Walk the whole path in §2 from that file, out loud, timed
- [ ] Copy `dist-single/index.html` to a USB stick and to a second laptop
- [ ] Confirm the event id in §2 still resolves — if the snapshot was refreshed,
      re-run the numbers in this file and pick the new top-ranked ISRO event
- [ ] Decide who says the `/console/status` line. It is the closing argument and
      it should not be improvised.
