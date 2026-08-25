const pptx = require('pptxgenjs');
const p = new pptx();
p.layout = 'LAYOUT_WIDE';               // 13.3 x 7.5
const W = 13.3, H = 7.5;

/* ── Palette ──────────────────────────────────────────────────────────────
 * The console's own tokens, not a generic deck theme. Judges see the deck and
 * the demo within three minutes of each other; sharing the palette makes them
 * read as one artefact instead of a product and a slide template.        */
const INK      = '0A0E14';   // --base, near-black with a blue bias
const PANEL    = '161D27';   // raised surface
const PANEL_HI = '1F2833';
const RULE     = '2B3542';
const TEXT     = 'EEF3F9';   // --t1
const MUTED    = '9DAEC1';   // --t2
const FAINT    = '6B7F94';   // --t3
const ACCENT   = 'F2913F';   // --accent
const CRIT     = 'E0655A';
const HIGH     = 'EE9445';
const OK       = '5FB187';
const PAPER    = 'F4F6F9';   // light slides
const PAPER_INK= '111820';

const HEAD = 'Arial', BODY = 'Calibri';

/* The repeated motif: a small square swatch plus an uppercase label, lifted
 * from the console's severity chips. Used as every section marker. */
function chip(s, x, y, label, color, dark = true) {
  s.addShape(p.ShapeType.rect, { x, y: y + 0.045, w: 0.11, h: 0.11, fill: { color } });
  s.addText(label.toUpperCase(), {
    x: x + 0.22, y, w: 6.5, h: 0.2, fontFace: HEAD, fontSize: 10.5, bold: true,
    color: dark ? MUTED : '55606E', charSpacing: 1.6, margin: 0, valign: 'middle',
  });
}

function title(s, t, dark = true) {
  s.addText(t, {
    x: 0.62, y: 0.68, w: 12.1, h: 1.14, fontFace: HEAD, fontSize: 38, bold: true,
    color: dark ? TEXT : PAPER_INK, margin: 0, valign: 'top', lineSpacing: 43,
  });
}

/* A statistic, presented as a statistic. */
function stat(s, x, y, w, value, unit, label, note, color, dark = true) {
  s.addText(
    [{ text: value, options: { fontSize: 34, bold: true, color } },
     { text: unit ? ' ' + unit : '', options: { fontSize: 15, color: dark ? MUTED : '55606E' } }],
    { x, y, w, h: 0.8, fontFace: HEAD, margin: 0, valign: 'bottom' },
  );
  s.addText(label.toUpperCase(), {
    x, y: y + 0.82, w, h: 0.2, fontFace: HEAD, fontSize: 9.5, bold: true,
    color: dark ? FAINT : '6E7885', charSpacing: 1.4, margin: 0,
  });
  if (note) s.addText(note, {
    x, y: y + 1.05, w, h: 0.5, fontFace: BODY, fontSize: 11.5,
    color: dark ? MUTED : '55606E', margin: 0,
  });
}

function card(s, x, y, w, h, dark = true) {
  s.addShape(p.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.04,
    fill: { color: dark ? PANEL : 'FFFFFF' },
    line: { color: dark ? RULE : 'DCE2EA', width: 0.75 },
  });
}

/* ══ 1 · Title ══════════════════════════════════════════════════════════ */
{
  const s = p.addSlide();
  s.background = { color: INK };
  s.addText('PS-04', {
    x: 0.62, y: 0.85, w: 3, h: 0.34, fontFace: HEAD, fontSize: 13, bold: true,
    color: ACCENT, charSpacing: 3, margin: 0,
  });
  s.addText('KESSLER', {
    x: 0.62, y: 1.3, w: 12, h: 1.5, fontFace: HEAD, fontSize: 84, bold: true,
    color: TEXT, charSpacing: 1, margin: 0,
  });
  s.addText('Space debris tracking and satellite collision risk prediction', {
    x: 0.62, y: 2.78, w: 11.5, h: 0.5, fontFace: HEAD, fontSize: 23,
    color: MUTED, margin: 0,
  });
  s.addText(
    'A conjunction screening console that ranks which of fifty thousand close approaches is worth acting on — and says what would have to be true for each one to stop mattering.',
    { x: 0.62, y: 3.36, w: 9.1, h: 1.16, fontFace: BODY, fontSize: 15.5, color: MUTED, margin: 0, lineSpacing: 24 },
  );

  s.addShape(p.ShapeType.line, { x: 0.62, y: 4.72, w: 12.06, h: 0, line: { color: RULE, width: 1 } });
  stat(s, 0.62, 4.98, 2.6, '859', 'objects', 'Real CelesTrak TLEs', null, TEXT);
  stat(s, 3.6,  4.98, 2.9, '3,032', 'events', 'From 368,511 pairs', null, TEXT);
  stat(s, 6.9,  4.98, 2.6, '62/62', '', 'Known-answer tests', null, OK);
  stat(s, 9.9,  4.98, 2.8, '0', 'kB', 'Backend, and network at runtime', null, ACCENT);

  s.addText('Software  ·  Space Technology  ·  Internal Hackathon 2026', {
    x: 0.62, y: 6.82, w: 9, h: 0.28, fontFace: HEAD, fontSize: 11, color: FAINT, charSpacing: 1.2, margin: 0,
  });
  s.addNotes('Open on the ratio, not on the technology. 53,000 alerts, 10 manoeuvres. Everything on this slide is reproducible by a command in the repository.');
}

/* ══ 2 · The problem ════════════════════════════════════════════════════ */
{
  const s = p.addSlide();
  s.background = { color: PAPER };
  chip(s, 0.62, 0.42, 'The problem', CRIT, false);
  title(s, 'Detection is solved. Triage is not.', false);

  s.addText(
    'ISRO generated more than 53,000 close-approach alerts for Indian satellites in 2024 and flew ten collision avoidance manoeuvres. Nobody needs software that finds close approaches — they arrive unbidden. What is scarce is the judgement to discard the other 52,990.',
    { x: 0.62, y: 1.98, w: 6.5, h: 1.6, fontFace: BODY, fontSize: 16, color: '3A4553', margin: 0, lineSpacing: 25 },
  );
  s.addText(
    'And the tools that do this are expensive, closed, or priced for operators with a flight-dynamics team. A university group flying one cubesat has the problem and none of the access.',
    { x: 0.62, y: 3.76, w: 6.5, h: 1.1, fontFace: BODY, fontSize: 15, color: '55606E', margin: 0, lineSpacing: 24 },
  );

  card(s, 7.5, 1.94, 5.18, 4.16, false);
  s.addText('INDIA, 2024–26', {
    x: 7.85, y: 2.20, w: 4.5, h: 0.24, fontFace: HEAD, fontSize: 9.5, bold: true, color: '6E7885', charSpacing: 1.4, margin: 0,
  });
  stat(s, 7.85, 2.56, 4.5, '53,000+', '', 'Close-approach alerts generated', 'Indian Space Situational Assessment Report 2024', CRIT, false);
  stat(s, 7.85, 4.30, 2.2, '10', '', 'Manoeuvres flown', null, PAPER_INK, false);
  stat(s, 10.2, 4.30, 2.4, '5,300:1', '', 'Screened per decision', null, ACCENT, false);
  stat(s, 7.85, 5.30, 4.5, '20 of 22', '', 'Active Indian LEO satellites at elevated risk', null, PAPER_INK, false);

  s.addText('Sources: ISSAR 2024 (ISRO/IS4OM); Lok Sabha reply, August 2026.', {
    x: 0.62, y: 6.72, w: 9, h: 0.3, fontFace: BODY, fontSize: 10.5, color: '7A8492', italic: true, margin: 0,
  });
  s.addNotes('This ratio is the problem statement, whatever the official wording says. Say the two numbers slowly.');
}

/* ══ 3 · Solution ═══════════════════════════════════════════════════════ */
{
  const s = p.addSlide();
  s.background = { color: INK };
  chip(s, 0.62, 0.42, 'Proposed solution', ACCENT);
  title(s, 'Would this change your mind?');

  const rows = [
    ['Screen',   'SGP4 over public TLEs. A three-stage cascade takes 368,511 pairs to 3,032 confirmed events, each with an exact time of closest approach found by bisection — not by sampling.', ACCENT],
    ['Rank',     'Foster-style collision probability, severity bands, and a 0-100 score whose weights and per-term contributions are printed on the event, so the ranking can be defended rather than only reproduced.', HIGH],
    ['Decide',   'The counterfactual, per event: the miss distance that would drop it a band, the uncertainty multiplier that would do the same, and whether the verdict is geometry or an artefact of an assumption.', OK],
    ['Hand off', 'CCSDS 508.0-B-1 Conjunction Data Messages — the format Space-Track, ESA and NASA CARA exchange — so the output enters a pipeline instead of ending in a spreadsheet.', MUTED],
  ];
  let y = 1.98;
  rows.forEach(([h, t, c], i) => {
    s.addShape(p.ShapeType.ellipse, { x: 0.62, y: y + 0.06, w: 0.34, h: 0.34, fill: { color: c } });
    s.addText(String(i + 1), {
      x: 0.62, y: y + 0.06, w: 0.34, h: 0.34, fontFace: HEAD, fontSize: 13, bold: true,
      color: INK, align: 'center', valign: 'middle', margin: 0,
    });
    s.addText(h, { x: 1.16, y, w: 2.1, h: 0.34, fontFace: HEAD, fontSize: 19, bold: true, color: TEXT, margin: 0, valign: 'middle' });
    s.addText(t, { x: 3.3, y: y - 0.02, w: 9.38, h: 1.02, fontFace: BODY, fontSize: 14, color: MUTED, margin: 0, lineSpacing: 21 });
    y += 1.22;
  });

  s.addText(
    'Innovation: the interface renders every capability from one registry that carries its own status, so it is structurally incapable of presenting something unbuilt as working.',
    { x: 0.62, y: 6.66, w: 12.06, h: 0.44, fontFace: BODY, fontSize: 14, color: ACCENT, italic: true, margin: 0 },
  );
  s.addNotes('Point at row 3. That is the differentiator — published tools stop at row 2.');
}

/* ══ 4 · Technical approach ═════════════════════════════════════════════ */
{
  const s = p.addSlide();
  s.background = { color: PAPER };
  chip(s, 0.62, 0.42, 'Technical approach', ACCENT, false);
  title(s, 'The same cascade ISRO published for CLAPS', false);

  s.addText(
    "We built this from the physics, then found ISRO's published description of the tool it runs at MCF Hassan. The architectures match stage for stage — convergence, not reimplementation.",
    { x: 0.62, y: 1.92, w: 12.06, h: 0.6, fontFace: BODY, fontSize: 14.5, color: '55606E', margin: 0, lineSpacing: 22 },
  );

  const stages = [
    ['368,511', 'All pairs',           '859 objects, 72-hour horizon'],
    ['368,491', 'Perigee–apogee',      'Orbits that can never meet'],
    ['253,010', 'Velocity-bounded',    '60 s sweep, 450 km gate'],
    ['3,032',   'Refined to true TCA', 'Bisection on range rate'],
  ];
  stages.forEach(([n, h, sub], i) => {
    const x = 0.62 + i * 3.11;
    card(s, x, 2.46, 2.86, 1.72, false);
    s.addText(n, { x: x + 0.24, y: 2.66, w: 2.4, h: 0.5, fontFace: HEAD, fontSize: 26, bold: true, color: i === 3 ? ACCENT : PAPER_INK, margin: 0 });
    s.addText(h, { x: x + 0.24, y: 3.2, w: 2.4, h: 0.3, fontFace: HEAD, fontSize: 12.5, bold: true, color: '3A4553', margin: 0 });
    s.addText(sub, { x: x + 0.24, y: 3.5, w: 2.45, h: 0.55, fontFace: BODY, fontSize: 11, color: '6E7885', margin: 0 });
    if (i < 3) s.addText('▸', { x: x + 2.9, y: 3.02, w: 0.24, h: 0.3, fontFace: HEAD, fontSize: 15, color: 'A9B4C2', align: 'center', margin: 0 });
  });

  s.addText('The 450 km gate is derived, not tuned', {
    x: 0.62, y: 4.46, w: 5.9, h: 0.32, fontFace: HEAD, fontSize: 15, bold: true, color: PAPER_INK, margin: 0,
  });
  s.addText(
    "15 km/s maximum closing speed × 60 s step ÷ 2. Shrinking it makes the screen look faster while silently missing real approaches. CLAPS derives its own sieve the same way, from twice escape velocity — the same physical bound.",
    { x: 0.62, y: 4.82, w: 5.9, h: 1.2, fontFace: BODY, fontSize: 13.5, color: '55606E', margin: 0, lineSpacing: 21 },
  );

  s.addText('React · TypeScript · satellite.js · Web Worker', {
    x: 6.9, y: 4.46, w: 5.78, h: 0.32, fontFace: HEAD, fontSize: 15, bold: true, color: PAPER_INK, margin: 0,
  });
  s.addText(
    '3,710,880 SGP4 propagations in ~15 s. The build-time precompute and the in-browser re-run are the same module, so they cannot disagree. Measured scaling exponent 1.738 against 2.000 for pure all-pairs.',
    { x: 6.9, y: 4.82, w: 5.78, h: 1.2, fontFace: BODY, fontSize: 13.5, color: '55606E', margin: 0, lineSpacing: 21 },
  );
  s.addNotes('If asked about scale: we measured it rather than arguing it. npm run scaling.');
}

/* ══ 5 · Feasibility ════════════════════════════════════════════════════ */
{
  const s = p.addSlide();
  s.background = { color: INK };
  chip(s, 0.62, 0.42, 'Feasibility and viability', OK);
  title(s, 'Built, tested, and honest about its limits');

  card(s, 0.62, 1.94, 5.9, 4.2);
  s.addText('WHAT IS MEASURED', { x: 0.95, y: 2.18, w: 5.2, h: 0.24, fontFace: HEAD, fontSize: 9.5, bold: true, color: OK, charSpacing: 1.4, margin: 0 });
  s.addText([
    { text: 'Objects, element sets, epochs, SGP4 propagation, times of closest approach, miss distances and relative velocities', options: { bullet: true, breakLine: true } },
    { text: 'Every figure in the pair-reduction cascade', options: { bullet: true, breakLine: true } },
    { text: 'The burn advisor’s re-propagated post-burn miss distance', options: { bullet: true, breakLine: true } },
    { text: '62 known-answer tests, including brute-force all-pairs agreement to 1.14 × 10⁻¹³ km', options: { bullet: true, breakLine: true } },
    { text: 'The breakup model checked against three real catalogued events — and its Fengyun-1C disagreement printed on every run', options: { bullet: true } },
  ], { x: 0.95, y: 2.54, w: 5.24, h: 3.6, fontFace: BODY, fontSize: 13, color: MUTED, margin: 0, paraSpaceAfter: 9, lineSpacing: 19 });

  card(s, 6.78, 1.94, 5.9, 4.2);
  s.addText('WHAT IS ASSUMED, AND DISCLOSED WHEREVER USED', { x: 7.11, y: 2.18, w: 5.3, h: 0.24, fontFace: HEAD, fontSize: 9.5, bold: true, color: HIGH, charSpacing: 1.1, margin: 0 });
  s.addText([
    { text: 'The 1σ positional covariance feeding Pc — a TLE carries none', options: { bullet: true, breakLine: true } },
    { text: 'Radar cross-section class, inferred from object type', options: { bullet: true, breakLine: true } },
    { text: 'Object masses for the consequence chain, where fragment count scales as mass^0.75', options: { bullet: true, breakLine: true } },
    { text: 'Every one of these is a control you can sweep, not a constant — and every exported CDM declares COVARIANCE_METHOD = DEFAULT so the assumption survives leaving the app', options: { bullet: true } },
  ], { x: 7.11, y: 2.54, w: 5.24, h: 3.6, fontFace: BODY, fontSize: 13, color: MUTED, margin: 0, paraSpaceAfter: 9, lineSpacing: 19 });

  s.addText(
    'Risk we chose to carry: the demo screens a committed snapshot, not a live feed, because every element set must share one epoch for the run to mean anything. One command re-pulls from CelesTrak.',
    { x: 0.62, y: 6.42, w: 12.06, h: 0.5, fontFace: BODY, fontSize: 13.5, color: FAINT, italic: true, margin: 0 },
  );
  s.addNotes('The right-hand column is the slide to linger on. Volunteering the limits is the point.');
}

/* ══ 6 · Impact ═════════════════════════════════════════════════════════ */
{
  const s = p.addSlide();
  s.background = { color: PAPER };
  chip(s, 0.62, 0.42, 'Impact and benefits', ACCENT, false);
  title(s, 'One real event, taken all the way through', false);

  card(s, 0.62, 1.94, 12.06, 1.62, false);
  s.addText('CJ-34550-41599  ·  HIGH  ·  RISK SCORE 80', {
    x: 0.95, y: 2.16, w: 6, h: 0.28, fontFace: HEAD, fontSize: 10.5, bold: true, color: '6E7885', charSpacing: 1.3, margin: 0,
  });
  s.addText('CARTOSAT-2C  ×  COSMOS 2251 DEB', {
    x: 0.95, y: 2.48, w: 7.4, h: 0.44, fontFace: HEAD, fontSize: 25, bold: true, color: PAPER_INK, margin: 0,
  });
  s.addText('An ISRO earth-observation satellite against a fragment of the 2009 Iridium 33 / Cosmos 2251 collision, fifteen years later.', {
    x: 0.95, y: 2.98, w: 7.4, h: 0.42, fontFace: BODY, fontSize: 13, color: '55606E', margin: 0,
  });
  stat(s, 8.66, 2.20, 1.78, '1.911', 'km', 'Miss distance', null, PAPER_INK, false);
  stat(s, 10.46, 2.20, 2.20, '4.9×10⁻⁴', '', 'Collision probability', null, HIGH, false);

  const outs = [
    ['72',       'ISRO-involved events, of the 2,901 that pass the default thresholds', PAPER_INK],
    ['3.16 km',  'The miss distance at which this event would drop a band — 1.25 km more than SGP4 found', ACCENT],
    ['0.47×',    'The uncertainty multiplier that would do the same. A large revision, so this band is geometry, not assumption', OK],
  ];
  outs.forEach(([n, t, c], i) => {
    const x = 0.62 + i * 4.13;
    s.addText(n, { x, y: 3.72, w: 3.8, h: 0.62, fontFace: HEAD, fontSize: 34, bold: true, color: c, margin: 0 });
    s.addText(t, { x, y: 4.4, w: 3.8, h: 1.1, fontFace: BODY, fontSize: 13.5, color: '55606E', margin: 0, lineSpacing: 21 });
  });

  s.addText('Who this reaches', { x: 0.62, y: 5.66, w: 4, h: 0.3, fontFace: HEAD, fontSize: 15, bold: true, color: PAPER_INK, margin: 0 });
  s.addText(
    'It runs from a single file with the wifi off, on free no-signup data, with no licence and no analyst. A university group with one cubesat gets the same pipeline as an operator with four hundred satellites — which is the access gap the problem statement names.',
    { x: 0.62, y: 6.0, w: 12.06, h: 1.0, fontFace: BODY, fontSize: 14, color: '55606E', margin: 0, lineSpacing: 22 },
  );
  s.addNotes('Every number here is on screen in the live demo. Do not round any of them.');
}

/* ══ 7 · Research and references ════════════════════════════════════════ */
{
  const s = p.addSlide();
  s.background = { color: INK };
  chip(s, 0.62, 0.42, 'Research and references', MUTED);
  title(s, 'What we read — and what we chose not to build');

  card(s, 0.62, 1.94, 7.3, 4.2);
  s.addText('MODELS AND STANDARDS IMPLEMENTED', { x: 0.95, y: 2.18, w: 6.6, h: 0.24, fontFace: HEAD, fontSize: 9.5, bold: true, color: MUTED, charSpacing: 1.4, margin: 0 });
  s.addText([
    { text: 'Vallado & Crawford, SGP4 — AIAA 2006-6753', options: { bullet: true, breakLine: true } },
    { text: 'Foster & Estes, collision probability — NASA JSC-25898, 1992', options: { bullet: true, breakLine: true } },
    { text: 'Johnson et al., NASA Standard Breakup Model — EVOLVE 4.0, 2001', options: { bullet: true, breakLine: true } },
    { text: 'King-Hele, satellite orbital decay; Sutton–Graves stagnation-point heating', options: { bullet: true, breakLine: true } },
    { text: 'Kessler & Cour-Palais, particle-in-a-box cascade rate — JGR, 1978', options: { bullet: true, breakLine: true } },
    { text: 'CCSDS 508.0-B-1, Conjunction Data Message', options: { bullet: true, breakLine: true } },
    { text: 'Flohrer et al., TLE orbit error categorisation — AMOS 2008', options: { bullet: true, breakLine: true } },
    { text: 'Anilkumar et al., CLAPS — ISRO close-approach prediction software', options: { bullet: true } },
  ], { x: 0.95, y: 2.54, w: 6.64, h: 3.6, fontFace: BODY, fontSize: 12.5, color: MUTED, margin: 0, paraSpaceAfter: 7, lineSpacing: 18 });

  card(s, 8.18, 1.94, 4.5, 4.2);
  s.addText('WHY THERE IS NO ML MODEL', { x: 8.51, y: 2.18, w: 3.9, h: 0.24, fontFace: HEAD, fontSize: 9.5, bold: true, color: CRIT, charSpacing: 1.4, margin: 0 });
  s.addText(
    'ESA ran this exact competition on 13,154 real conjunction events. The naive baseline — predict the risk in the most recent CDM — beat almost every model submitted. A later benchmark found one model in roughly five thousand beat it, by 1.4%.',
    { x: 8.51, y: 2.56, w: 3.84, h: 1.9, fontFace: BODY, fontSize: 13, color: MUTED, margin: 0, lineSpacing: 20 },
  );
  s.addText(
    'So a model here would be decoration we could not validate, inside a project whose argument is that every claim is backed by a test.',
    { x: 8.51, y: 4.62, w: 3.84, h: 1.0, fontFace: BODY, fontSize: 13, color: TEXT, margin: 0, lineSpacing: 20 },
  );
  s.addText('We spent that effort on measuring σ instead.', {
    x: 8.51, y: 5.70, w: 3.84, h: 0.42, fontFace: BODY, fontSize: 13, color: ACCENT, italic: true, margin: 0,
  });

  s.addText('Prototype, engine and every figure in this deck: github.com/agpriyanshu07/SIH-Internal-NITR-2  ·  npm run validate reproduces all 62 checks', {
    x: 0.62, y: 6.46, w: 12.06, h: 0.4, fontFace: BODY, fontSize: 12.5, color: FAINT, margin: 0,
  });
  s.addNotes('Expect the AI question. This slide is the answer, and it scores rather than defends.');
}

p.writeFile({ fileName: 'deck/KESSLER-PS04.pptx' }).then(() => console.log('written'));
