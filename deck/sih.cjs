/* ─────────────────────────────────────────────────────────────────────────
 * KESSLER — SIH Idea Presentation, PS-04
 *
 * Built on the OFFICIAL SIH Idea Presentation template, matched to it exactly:
 * canvas 842x474pt, heading blue 1F497D, footer bar 0070C0, team-name oval,
 * emblem top right. The template's own instruction slide is explicit — six
 * slides maximum including the title, keep the idea-detail pointers unchanged,
 * points and diagrams rather than paragraphs. All three are obeyed.
 *
 * Every figure is one this repository reproduces, or a cited public source.
 * Nothing here is estimated, rounded up, or invented.
 * ───────────────────────────────────────────────────────────────────────── */
const pptx = require('pptxgenjs');
const fs = require('fs');
const p = new pptx();

/* The official template is 842 x 474 pt, which is not a standard pptxgenjs
 * layout — defining it means our slides drop straight into the same deck as
 * the template without rescaling. */
p.defineLayout({ name: 'SIH', width: 11.694, height: 6.583 });
p.layout = 'SIH';
const W = 11.694, H = 6.583;

/* ── Template palette, sampled from the PDF, not guessed ───────────────── */
const NAVY   = '1F497D';   // section headings + title-slide header
const BLUE   = '0070C0';   // footer bar
const INK    = '111111';
const BODY   = '333333';
const MUTE   = '5A6673';
const RULE   = 'D4DAE2';
const WASH   = 'F2F6FA';   // panel tint — a tint, never an edge stripe
const OK     = '1E7A4C';
const WARN   = 'B25E00';
const RISK   = 'B3261E';
const OVAL   = 'B4A3C8';

const F = 'Calibri', FH = 'Calibri', FN = 'Arial';
const EMBLEM = fs.readFileSync(__dirname + '/sih-emblem.png').toString('base64');

/* ── Chrome ────────────────────────────────────────────────────────────── */
function emblem(s, x, y, h) {
  s.addImage({ data: 'image/png;base64,' + EMBLEM, x, y, w: h * (805 / 882), h });
}

/** Content-slide furniture: oval, centred title, emblem, footer bar. */
function frame(s, titleText, n) {
  s.addShape(p.ShapeType.ellipse, {
    x: 0.24, y: 0.16, w: 1.16, h: 0.62,
    fill: { color: 'FFFFFF' }, line: { color: OVAL, width: 1 },
  });
  s.addText('Team\nName', {
    x: 0.24, y: 0.16, w: 1.16, h: 0.62, fontFace: F, fontSize: 10.5,
    color: INK, align: 'center', valign: 'middle', margin: 0, lineSpacing: 12,
  });
  /* The header band is 0.6in tall and a wrapped title spills into the first
     section heading. Step the size down once for the one title long enough
     to need it, rather than letting PowerPoint reflow it. */
  s.addText(titleText, {
    x: 1.52, y: 0.16, w: 7.72, h: 0.64, fontFace: FH,
    fontSize: titleText.length > 30 ? 22 : 27, bold: true,
    color: INK, align: 'center', valign: 'middle', margin: 0,
  });
  emblem(s, 9.62, 0.15, 0.62);
  s.addText('SMART INDIA\nHACKATHON 2026', {
    x: 10.28, y: 0.16, w: 1.22, h: 0.60, fontFace: FH, fontSize: 9.5, bold: true,
    color: '3E4A56', valign: 'middle', margin: 0, lineSpacing: 11,
  });
  s.addShape(p.ShapeType.rect, { x: 0, y: H - 0.34, w: W, h: 0.34, fill: { color: BLUE } });
  s.addText('@SIH Idea submission- Template', {
    x: 3.5, y: H - 0.34, w: 4.7, h: 0.34, fontFace: F, fontSize: 10.5,
    color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0,
  });
  s.addText(String(n), {
    x: W - 0.85, y: H - 0.34, w: 0.5, h: 0.34, fontFace: F, fontSize: 11, bold: true,
    color: 'FFFFFF', align: 'right', valign: 'middle', margin: 0,
  });
}

/** The template's own section heading: diamond bullet, navy, underlined. */
function heading(s, text, y) {
  s.addText('❖', {
    x: 0.34, y, w: 0.32, h: 0.32, fontFace: F, fontSize: 15, color: NAVY,
    margin: 0, valign: 'middle',
  });
  s.addText(text, {
    x: 0.68, y, w: 10.6, h: 0.32, fontFace: FH, fontSize: 16.5, bold: true,
    color: NAVY, underline: true, margin: 0, valign: 'middle',
  });
}

/** A quiet panel. Background tint and a hairline — no edge stripes. */
function panel(s, x, y, w, h, fill) {
  s.addShape(p.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.03,
    fill: { color: fill || WASH }, line: { color: RULE, width: 0.75 },
  });
}

/** Small uppercase label. */
function label(s, x, y, w, t, color) {
  s.addText(t.toUpperCase(), {
    x, y, w, h: 0.2, fontFace: FH, fontSize: 8.5, bold: true,
    color: color || MUTE, charSpacing: 0.9, margin: 0, valign: 'middle',
  });
}

/** A number that is meant to be read as a number. */
function figure(s, x, y, w, val, unit, cap, color) {
  s.addText(
    [{ text: val, options: { fontSize: 21, bold: true, color: color || NAVY } },
     { text: unit ? ' ' + unit : '', options: { fontSize: 10, color: MUTE } }],
    { x, y, w, h: 0.34, fontFace: FN, margin: 0, valign: 'middle' },
  );
  s.addText(cap, {
    x, y: y + 0.32, w, h: 0.38, fontFace: F, fontSize: 9.5, color: BODY,
    margin: 0, lineSpacing: 11,
  });
}

/* ══════════════ SLIDE 1 · TITLE PAGE ══════════════════════════════════ */
{
  const s = p.addSlide();
  s.addText('SMART INDIA HACKATHON 2026', {
    x: 0.5, y: 0.3, w: 8.9, h: 0.66, fontFace: FH, fontSize: 33, bold: true,
    color: NAVY, align: 'center', margin: 0, valign: 'middle',
  });
  emblem(s, 9.64, 0.16, 0.95);
  s.addText('SMART INDIA\nHACKATHON\n2026', {
    x: 10.62, y: 0.2, w: 0.95, h: 0.88, fontFace: FH, fontSize: 10, bold: true,
    color: '3E4A56', valign: 'middle', margin: 0, lineSpacing: 11.5,
  });
  s.addText('TITLE PAGE', {
    x: 0.5, y: 1.08, w: 8.9, h: 0.48, fontFace: FH, fontSize: 22, bold: true,
    color: INK, align: 'center', margin: 0, valign: 'middle',
  });

  const rows = [
    ['Problem Statement ID', 'PS-04'],
    ['Problem Statement Title', 'Space Debris Tracking & Satellite Collision Risk Prediction Dashboard'],
    ['Theme', 'Space Technology'],
    ['PS Category', 'Software'],
    ['Team ID', '<< enter your Team ID >>'],
    ['Team Name (Registered on portal)', '<< enter your Team Name >>'],
  ];
  let y = 1.80;
  rows.forEach(([k, v]) => {
    /* One row wraps to two lines. Its bullet has to sit on the FIRST line, so
       both boxes are top-aligned and the row's own height sets the pitch —
       a middle-aligned bullet on a two-line row lands in the gap between. */
    const twoLine = (k + v).length > 62;
    const h = twoLine ? 0.56 : 0.30;
    s.addText('\u2022', { x: 0.42, y: y + 0.02, w: 0.2, h: 0.24, fontFace: F, fontSize: 14, color: INK, margin: 0, valign: 'middle' });
    s.addText(
      [{ text: k + ' \u2013 ', options: { bold: true, color: INK } },
       { text: v, options: { color: v.startsWith('<<') ? RISK : BODY, italic: v.startsWith('<<') } }],
      { x: 0.66, y, w: 6.55, h, fontFace: F, fontSize: 13.5, margin: 0,
        valign: 'top', lineSpacing: 19 },
    );
    y += h + 0.14;
  });

  /* The prototype's own headline figures, so the title page carries evidence
     rather than only labels. All four are reproduced by a command in the repo. */
  panel(s, 7.5, 1.78, 3.86, 2.72);
  label(s, 7.76, 1.96, 3.5, 'Working prototype — measured, not projected', NAVY);
  const st = [
    ['859',     'real tracked objects screened'],
    ['3,032',   'close approaches found in 72 h'],
    ['62 / 62', 'known-answer engine tests pass'],
  ];
  let sy = 2.30;
  st.forEach(([n, c]) => {
    s.addText(n, { x: 7.76, y: sy, w: 1.30, h: 0.34, fontFace: FN, fontSize: 19, bold: true, color: NAVY, margin: 0, valign: 'middle' });
    s.addText(c, { x: 9.10, y: sy - 0.02, w: 2.14, h: 0.38, fontFace: F, fontSize: 10, color: BODY, margin: 0, valign: 'middle', lineSpacing: 11.5 });
    sy += 0.50;
  });
  s.addText('Runs entirely in the browser — no backend, no network at runtime.', {
    x: 7.76, y: 3.84, w: 3.40, h: 0.44, fontFace: F, fontSize: 10, color: MUTE, italic: true, margin: 0, lineSpacing: 12,
  });

  panel(s, 0.34, 4.86, 11.02, 1.02, WASH);
  s.addShape(p.ShapeType.rect, { x: 0.34, y: 4.86, w: 0.07, h: 1.02, fill: { color: NAVY } });
  s.addText('A conjunction screening console that ranks close approaches AND states what would change the verdict.', {
    x: 0.62, y: 4.98, w: 10.6, h: 0.30, fontFace: FH, fontSize: 13.5, bold: true, color: INK, margin: 0, valign: 'middle',
  });
  s.addText('Real element sets \u00b7 real SGP4 \u00b7 real times of closest approach. Every capability in the interface declares its own build status, so nothing unfinished can appear as working.', {
    x: 0.62, y: 5.32, w: 10.6, h: 0.30, fontFace: F, fontSize: 10.5, color: BODY, margin: 0, valign: 'middle',
  });

  s.addShape(p.ShapeType.rect, { x: 0, y: H - 0.34, w: W, h: 0.34, fill: { color: BLUE } });
  s.addText('@SIH Idea submission- Template', {
    x: 3.5, y: H - 0.34, w: 4.7, h: 0.34, fontFace: F, fontSize: 10.5, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0,
  });
  s.addNotes('PS-04. Fill in Team ID and Team Name before submitting — they are the only placeholders in this deck.');
}

/* ══════════════ SLIDE 2 · IDEA TITLE / PROPOSED SOLUTION ═════════════ */
{
  const s = p.addSlide();
  frame(s, 'KESSLER — Collision Risk Triage Console', 2);
  heading(s, 'Proposed Solution (Describe your Idea/Solution/Prototype)', 0.98);

  /* How it addresses the problem — the ratio, stated first because it IS the
     problem. Source: ISRO/IS4OM, ISSAR 2024. */
  panel(s, 0.34, 1.44, 4.42, 1.36, 'FDF3F2');
  label(s, 0.58, 1.6, 4.0, 'How it addresses the problem', RISK);
  s.addText(
    [{ text: '53,000+', options: { fontSize: 22, bold: true, color: RISK } },
     { text: '  alerts   →   ', options: { fontSize: 12, color: MUTE } },
     { text: '10', options: { fontSize: 22, bold: true, color: NAVY } },
     { text: '  manoeuvres', options: { fontSize: 12, color: MUTE } }],
    { x: 0.58, y: 1.86, w: 4.0, h: 0.42, fontFace: FN, margin: 0, valign: 'middle' },
  );
  s.addText('ISRO, 2024. Detection is not the bottleneck — deciding which 10 of 53,000 matter is. KESSLER ranks and justifies that choice.', {
    x: 0.58, y: 2.3, w: 3.96, h: 0.44, fontFace: F, fontSize: 10.5, color: BODY, margin: 0, lineSpacing: 12.5,
  });

  /* Detailed explanation — the pipeline, as four steps rather than prose. */
  label(s, 4.98, 1.5, 6.4, 'Detailed explanation — what the prototype does', NAVY);
  const steps = [
    ['1', 'INGEST',  'Public CelesTrak TLEs\n859 real objects', NAVY],
    ['2', 'SCREEN',  'SGP4 + 3-stage cascade\n368,511 pairs → 3,032', BLUE],
    ['3', 'RANK',    'Collision probability,\nseverity band, 0–100 score', WARN],
    ['4', 'DECIDE',  'What would change\nthe verdict + CDM export', OK],
  ];
  steps.forEach(([n, t, d, c], i) => {
    const x = 4.98 + i * 1.66;
    panel(s, x, 1.78, 1.5, 1.02, 'FFFFFF');
    s.addShape(p.ShapeType.ellipse, { x: x + 0.12, y: 1.88, w: 0.26, h: 0.26, fill: { color: c } });
    s.addText(n, { x: x + 0.12, y: 1.88, w: 0.26, h: 0.26, fontFace: FH, fontSize: 10, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0 });
    s.addText(t, { x: x + 0.44, y: 1.88, w: 1.0, h: 0.26, fontFace: FH, fontSize: 10.5, bold: true, color: c, margin: 0, valign: 'middle' });
    s.addText(d, { x: x + 0.12, y: 2.2, w: 1.28, h: 0.52, fontFace: F, fontSize: 9, color: BODY, margin: 0, lineSpacing: 11 });
    if (i < 3) s.addText('▶', { x: x + 1.5, y: 2.16, w: 0.16, h: 0.24, fontFace: F, fontSize: 9, color: 'A8B2BE', align: 'center', margin: 0 });
  });

  /* Innovation and uniqueness — the pointer the template requires. */
  heading(s, 'Innovation and uniqueness of the solution', 2.98);
  const inno = [
    ['Answers "would this change your mind?"', 'Every event states the miss distance and the uncertainty multiplier that would drop it a severity band. Published tools give a ranked list and stop there.', NAVY],
    ['An interface that cannot overstate itself', 'Every capability renders from one registry carrying its own status, so nothing unbuilt can appear as working. Our breakup model prints its own disagreement with the Fengyun-1C catalogue on every test run.', OK],
    ['Speaks the operator’s format', 'Exports CCSDS 508.0-B-1 Conjunction Data Messages — what Space-Track, ESA and NASA CARA exchange — so output enters a real pipeline, not a spreadsheet.', BLUE],
  ];
  let iy = 3.42;
  inno.forEach(([h, d, c], i) => {
    if (i) s.addShape(p.ShapeType.line, { x: 0.4, y: iy - 0.12, w: 10.94, h: 0, line: { color: 'EAEEF3', width: 0.75 } });
    s.addShape(p.ShapeType.rect, { x: 0.4, y: iy + 0.09, w: 0.1, h: 0.1, fill: { color: c } });
    s.addText(h, { x: 0.62, y: iy, w: 3.5, h: 0.28, fontFace: FH, fontSize: 11.5, bold: true, color: INK, margin: 0, valign: 'middle' });
    s.addText(d, { x: 4.24, y: iy - 0.02, w: 7.1, h: 0.62, fontFace: F, fontSize: 10.5, color: BODY, margin: 0, lineSpacing: 12.5 });
    iy += 0.92;
  });
  s.addNotes('Lead with the ratio. The innovation is epistemic, not algorithmic — say that out loud.');
}

/* ══════════════ SLIDE 3 · TECHNICAL APPROACH ════════════════════════ */
{
  const s = p.addSlide();
  frame(s, 'TECHNICAL APPROACH', 3);
  heading(s, 'Technologies to be used', 0.98);

  const tech = [
    ['Frontend', 'React 18 · TypeScript · Vite · Tailwind'],
    ['Orbital engine', 'SGP4 (satellite.js, AIAA 2006-6753)'],
    ['Compute', 'Web Worker — off the main thread'],
    ['Data', 'CelesTrak GP two-line element sets (free, no sign-up)'],
    ['Interop', 'CCSDS 508.0-B-1 Conjunction Data Message · CSV'],
    ['Deployment', 'Static files — one 1.7 MB self-contained HTML file'],
  ];
  tech.forEach(([k, v], i) => {
    const x = 0.34 + (i % 3) * 3.78, y = 1.42 + Math.floor(i / 3) * 0.62;
    panel(s, x, y, 3.6, 0.52, 'FFFFFF');
    s.addText(k, { x: x + 0.14, y: y + 0.02, w: 1.16, h: 0.48, fontFace: FH, fontSize: 10, bold: true, color: NAVY, margin: 0, valign: 'middle' });
    s.addText(v, { x: x + 1.32, y: y + 0.02, w: 2.16, h: 0.48, fontFace: F, fontSize: 9.5, color: BODY, margin: 0, valign: 'middle', lineSpacing: 11 });
  });

  heading(s, 'Methodology and process for implementation', 2.78);

  /* The cascade, as the measured funnel it actually is. */
  const cas = [
    [368511, 'ALL PAIRS',             '859 objects, 72-hour horizon',      '9FB3C8'],
    [368491, 'PERIGEE\u2013APOGEE FILTER', 'Orbits that can never intersect',    '6E93B8'],
    [253010, 'COARSE SWEEP',          '60 s steps, 450 km gate',           '3D73A8'],
    [  3032, 'CONFIRMED EVENTS',      'Refined to exact TCA by bisection',  NAVY],
  ];
  /* Bar length encodes the count on a log10 scale, mapped so the last stage
     stays legible. Log rather than linear because the range is 121:1 — on a
     linear axis the final bar would be two pixels wide and the first three
     indistinguishable. The scale is stated on the slide; an unlabelled log
     axis would be its own overstatement. */
  const BX = 4.06, BMIN = 0.50, BMAX = 3.92;
  const lo = Math.log10(cas[cas.length - 1][0]), hi = Math.log10(cas[0][0]);
  const barW = (n) => BMIN + (BMAX - BMIN) * ((Math.log10(n) - lo) / (hi - lo));
  const total = cas[0][0];
  cas.forEach(([n, t, d, c], i) => {
    const y = 3.24 + i * 0.62;
    s.addText(n.toLocaleString('en-US'), {
      x: 0.34, y, w: 1.24, h: 0.5, fontFace: FN, fontSize: 14.5, bold: true,
      color: c === NAVY ? NAVY : '2A4A6B', align: 'right', margin: 0, valign: 'middle',
    });
    s.addText(t, { x: 1.70, y: y + 0.02, w: 2.28, h: 0.22, fontFace: FH, fontSize: 9, bold: true, color: c === NAVY ? NAVY : '2A4A6B', charSpacing: 0.6, margin: 0, valign: 'middle' });
    s.addText(d, { x: 1.70, y: y + 0.24, w: 2.32, h: 0.24, fontFace: F, fontSize: 8.5, color: MUTE, margin: 0, valign: 'middle' });
    s.addShape(p.ShapeType.rect, { x: BX, y: y + 0.14, w: BMAX, h: 0.22, fill: { color: 'EEF2F7' } });
    s.addShape(p.ShapeType.rect, { x: BX, y: y + 0.14, w: barW(n), h: 0.22, fill: { color: c } });
    const pct = 100 * n / total;
    s.addText(pct.toFixed(pct > 99.9 ? 3 : pct > 10 ? 1 : 2) + '%', {
      x: BX + BMAX + 0.08, y, w: 0.66, h: 0.5, fontFace: FN, fontSize: 9.5,
      color: c === NAVY ? NAVY : MUTE, bold: c === NAVY, margin: 0, valign: 'middle',
    });
  });
  s.addText('121\u00d7 reduction, and the first filter removes only 20 pairs \u2014 bar length \u221d log\u2081\u2080(count); every stage figure is measured by the run, not asserted', {
    x: 0.34, y: 5.76, w: 8.4, h: 0.30, fontFace: F, fontSize: 9, color: MUTE, italic: true, margin: 0, valign: 'middle',
  });

  panel(s, 8.86, 3.24, 2.50, 2.60, 'FFFFFF');
  label(s, 9.06, 3.38, 2.1, 'Verified, not claimed', OK);
  figure(s, 9.06, 3.62, 2.14, '3,710,880', '', 'SGP4 propagations per run (~15 s)', NAVY);
  figure(s, 9.06, 4.34, 2.14, '1.14\u00d710\u207b\u00b9\u00b3', 'km', 'Cascade vs brute-force all-pairs agreement', OK);
  figure(s, 9.06, 5.06, 2.14, '\u22481.73', '', 'Scaling exponent, 1.70\u20131.74 across runs (2.0 = all-pairs)', NAVY);
  s.addNotes('If asked about scale: measured with npm run scaling, six catalogue sizes, not extrapolated from theory.');
}

/* ══════════════ SLIDE 4 · FEASIBILITY AND VIABILITY ═════════════════ */
{
  const s = p.addSlide();
  frame(s, 'FEASIBILITY AND VIABILITY', 4);
  heading(s, 'Analysis of the feasibility of the idea', 0.98);

  const feas = [
    ['Already built', 'Not a concept. A working console with a real screening engine, running today.'],
    ['Zero data cost', 'CelesTrak publishes TLEs free with no sign-up — the usual blocker for this theme.'],
    ['Zero infrastructure', 'No backend, no database, no server. Static hosting, or one offline file.'],
    ['Proven correct', '62 known-answer tests, including brute-force cross-check of the whole cascade.'],
  ];
  feas.forEach(([h, d], i) => {
    const x = 0.34 + i * 2.85;
    panel(s, x, 1.42, 2.68, 1.16, 'FFFFFF');
    s.addText('✓', { x: x + 0.14, y: 1.54, w: 0.24, h: 0.24, fontFace: F, fontSize: 13, bold: true, color: OK, margin: 0, valign: 'middle' });
    s.addText(h, { x: x + 0.42, y: 1.54, w: 2.1, h: 0.24, fontFace: FH, fontSize: 11, bold: true, color: INK, margin: 0, valign: 'middle' });
    s.addText(d, { x: x + 0.14, y: 1.84, w: 2.42, h: 0.66, fontFace: F, fontSize: 9.5, color: BODY, margin: 0, lineSpacing: 11.5 });
  });

  heading(s, 'Potential challenges and risks  ·  Strategies for overcoming these challenges', 2.74);

  const risks = [
    ['TLEs carry no covariance', 'The 1σ uncertainty behind collision probability has to be assumed, and the ranking rests on it.',
     'Disclosed at every point of use and exposed as a control you can sweep. Exported CDMs declare COVARIANCE_METHOD = DEFAULT. A measured path — successive TLE differencing — is implemented and recovers a known perturbation to 1.00×.'],
    ['Screening a full 30,000-object catalogue', 'All-pairs cost grows quadratically; a naive screen would not finish.',
     'Cascade measured at exponent \u22481.73 — 1.70\u20131.74 across runs, since it is fitted to elapsed times — so sub-quadratic. Next step is spatial binning per time step instead of a pair loop.'],
    ['SGP4 drifts away from its epoch', 'Element sets are only trustworthy near the time they were fitted.',
     'Element-set age is shown per object, feeds the uncertainty model, and the console clock is anchored to the snapshot instant rather than the wall clock.'],
  ];
  const colw = [2.5, 3.4, 5.14];
  ['Risk', 'Why it matters', 'Mitigation — already in the prototype'].forEach((h, i) => {
    const x = 0.34 + colw.slice(0, i).reduce((a, b) => a + b, 0) + i * 0.12;
    label(s, x, 3.18, colw[i], h, NAVY);
  });
  s.addShape(p.ShapeType.line, { x: 0.34, y: 3.42, w: 11.0, h: 0, line: { color: RULE, width: 1 } });
  let ry = 3.54;
  risks.forEach(([a, b, c], i) => {
    const cells = [a, b, c];
    cells.forEach((t, j) => {
      const x = 0.34 + colw.slice(0, j).reduce((s2, v) => s2 + v, 0) + j * 0.12;
      s.addText(t, {
        x, y: ry, w: colw[j], h: 0.80, fontFace: F, fontSize: 9.5,
        color: j === 0 ? INK : BODY, bold: j === 0, margin: 0, lineSpacing: 11.5, valign: 'top',
      });
    });
    ry += 0.86;
    if (i < risks.length - 1) s.addShape(p.ShapeType.line, { x: 0.34, y: ry - 0.06, w: 11.0, h: 0, line: { color: 'EAEEF3', width: 0.75 } });
  });
  s.addNotes('The right-hand column is the slide to linger on — every mitigation is already built, not planned.');
}

/* ══════════════ SLIDE 5 · IMPACT AND BENEFITS ═══════════════════════ */
{
  const s = p.addSlide();
  frame(s, 'IMPACT AND BENEFITS', 5);
  heading(s, 'Potential impact on the target audience', 0.98);

  /* One real event, screened by the prototype. Every figure is on screen in
     the live demo. */
  panel(s, 0.34, 1.42, 11.0, 1.2, 'FFFFFF');
  s.addText('HIGH', {
    x: 0.5, y: 1.56, w: 0.62, h: 0.24, fontFace: FH, fontSize: 9.5, bold: true, color: 'FFFFFF',
    align: 'center', valign: 'middle', margin: 0, fill: { color: WARN },
  });
  s.addText('CARTOSAT-2C  ×  COSMOS 2251 DEB', {
    x: 1.24, y: 1.52, w: 4.7, h: 0.32, fontFace: FH, fontSize: 15.5, bold: true, color: INK, margin: 0, valign: 'middle',
  });
  s.addText('An ISRO earth-observation satellite against a fragment of the 2009 Iridium 33 / Cosmos 2251 collision — found by our engine in a 72-hour screening run.', {
    x: 1.24, y: 1.9, w: 5.0, h: 0.56, fontFace: F, fontSize: 10, color: BODY, margin: 0, lineSpacing: 12,
  });
  const ev = [
    ['1.911 km', 'Miss distance', NAVY],
    ['4.834 km/s', 'Closing speed', NAVY],
    ['4.9×10⁻⁴', 'Collision probability', WARN],
    ['3.16 km', 'Would drop it a band', OK],
  ];
  ev.forEach(([n, c, col], i) => {
    const x = 6.44 + i * 1.24;
    s.addText(n, { x, y: 1.56, w: 1.2, h: 0.32, fontFace: FN, fontSize: 14, bold: true, color: col, margin: 0, valign: 'middle' });
    s.addText(c, { x, y: 1.9, w: 1.2, h: 0.42, fontFace: F, fontSize: 9, color: MUTE, margin: 0, lineSpacing: 10.5 });
  });

  const aud = [
    ['ISRO / IS4OM', 'A triage layer over the 53,000 alerts already arriving each year — and a second opinion that states its own uncertainty.'],
    ['Universities & cubesat teams', 'The same pipeline as a large operator, with no licence, no analyst and no procurement. This is the access gap PS-04 names.'],
    ['Indian NewSpace startups', '20 of India’s 22 active LEO satellites face elevated collision risk. A first-launch operator can screen before and after deployment.'],
  ];
  aud.forEach(([h, d], i) => {
    const x = 0.34 + i * 3.72;
    panel(s, x, 2.76, 3.56, 1.06, WASH);
    s.addText(h, { x: x + 0.16, y: 2.88, w: 3.24, h: 0.26, fontFace: FH, fontSize: 11, bold: true, color: NAVY, margin: 0, valign: 'middle' });
    s.addText(d, { x: x + 0.16, y: 3.16, w: 3.28, h: 0.58, fontFace: F, fontSize: 9.5, color: BODY, margin: 0, lineSpacing: 11.5 });
  });

  heading(s, 'Benefits of the solution (social, economic, environmental)', 3.98);
  const ben = [
    ['SOCIAL', 'Protects the satellites behind weather warning, disaster response, crop monitoring and navigation. A lost earth-observation satellite is a lost public service.', OK],
    ['ECONOMIC', 'Commercial conjunction services are priced for large operators. Free public data plus an open engine removes both the licence and the analyst from the cost.', NAVY],
    ['ENVIRONMENTAL', 'Debris outlives the collision: 813 fragments of the 2009 Iridium 33 / Cosmos 2251 crash are still in our snapshot 15 years on. Screening this one event models 19 new trackable fragments and an added collision rate on all 33 assets we assess.', BLUE],
    ['STRATEGIC', 'Screening you can run yourself, on open data, is sovereign capability — supporting India’s Debris Free Space Missions target for 2030.', WARN],
  ];
  ben.forEach(([h, d, c], i) => {
    const x = 0.34 + i * 2.85;
    s.addShape(p.ShapeType.rect, { x, y: 4.47, w: 0.1, h: 0.1, fill: { color: c } });
    s.addText(h, { x: x + 0.2, y: 4.40, w: 2.5, h: 0.24, fontFace: FH, fontSize: 9.5, bold: true, color: c, charSpacing: 0.8, margin: 0, valign: 'middle' });
    s.addText(d, { x, y: 4.66, w: 2.68, h: 1.20, fontFace: F, fontSize: 9.5, color: BODY, margin: 0, valign: 'top', lineSpacing: 11.5 });
  });
  s.addNotes('Every number on this slide is visible in the live demo. Do not round any of them.');
}

/* ══════════════ SLIDE 6 · RESEARCH AND REFERENCES ═══════════════════ */
{
  const s = p.addSlide();
  frame(s, 'RESEARCH AND REFERENCES', 6);
  heading(s, 'Details / Links of the reference and research work', 0.98);

  label(s, 0.34, 1.42, 5.5, 'Models and standards implemented in the prototype', NAVY);
  const refs = [
    ['SGP4 propagation', 'Vallado & Crawford, "Revisiting Spacetrack Report #3", AIAA 2006-6753'],
    ['Collision probability', 'Foster & Estes, NASA JSC-25898, 1992 — the model our Pc uses'],
    ['Conjunction screening', 'Anilkumar et al., CLAPS — ISRO close-approach software, MCF Hassan'],
    ['Debris generation', 'Johnson et al., NASA Standard Breakup Model, EVOLVE 4.0, 2001'],
    ['Cascade risk', 'Kessler & Cour-Palais, J. Geophys. Res. 83(A6), 1978'],
    ['Orbital decay & re-entry', 'King-Hele drag decay; Sutton–Graves stagnation-point heating'],
    ['Message standard', 'CCSDS 508.0-B-1, Conjunction Data Message'],
    ['Uncertainty from TLEs', 'Flohrer et al., TLE orbit error categorisation, AMOS 2008'],
  ];
  /* Several citations wrap to two lines. Both columns are top-aligned to the
     row so a wrapped one grows downward instead of straddling its neighbours. */
  let y = 1.68;
  refs.forEach(([k, v]) => {
    s.addShape(p.ShapeType.rect, { x: 0.36, y: y + 0.07, w: 0.08, h: 0.08, fill: { color: BLUE } });
    s.addText(k, { x: 0.56, y, w: 1.9, h: 0.32, fontFace: FH, fontSize: 9.5, bold: true, color: INK, margin: 0, valign: 'top', lineSpacing: 11 });
    s.addText(v, { x: 2.48, y, w: 3.52, h: 0.32, fontFace: F, fontSize: 9.5, color: BODY, margin: 0, valign: 'top', lineSpacing: 11 });
    y += 0.36;
  });

  label(s, 6.24, 1.42, 5.1, 'Data sources and Indian context', NAVY);
  const src = [
    ['CelesTrak GP catalogue', 'celestrak.org — free, no sign-up. 859 objects across 5 groups.'],
    ['ISSAR 2024', 'isro.gov.in/ISSAR_2024.html — 53,000+ alerts, 10 CAMs in 2024'],
    ['Lok Sabha reply, Aug 2026', '20 of 22 active Indian LEO satellites at elevated risk; 20 CAMs flown in 2025'],
    ['Debris Free Space Missions', 'isro.gov.in/Debris_Free_Space_Missions.html — India’s 2030 target'],
  ];
  let y2 = 1.68;
  src.forEach(([k, v]) => {
    s.addShape(p.ShapeType.rect, { x: 6.26, y: y2 + 0.07, w: 0.08, h: 0.08, fill: { color: OK } });
    s.addText(k, { x: 6.46, y: y2, w: 2.2, h: 0.40, fontFace: FH, fontSize: 9.5, bold: true, color: INK, margin: 0, valign: 'top', lineSpacing: 11 });
    s.addText(v, { x: 8.7, y: y2, w: 2.64, h: 0.40, fontFace: F, fontSize: 9, color: BODY, margin: 0, valign: 'top', lineSpacing: 10.5 });
    y2 += 0.42;
  });

  panel(s, 6.24, 3.46, 5.1, 1.20, 'FFFFFF');
  label(s, 6.46, 3.60, 4.6, 'Why there is no machine-learning model', RISK);
  s.addText('ESA ran this exact competition on 13,154 real conjunction events. The naive baseline — reuse the risk in the most recent CDM — beat almost every model submitted; a later benchmark found roughly 1 model in 5,000 beat it, by 1.4%. We spent that effort on measuring uncertainty instead.', {
    x: 6.46, y: 3.84, w: 4.66, h: 0.74, fontFace: F, fontSize: 9.5, color: BODY, margin: 0, valign: 'top', lineSpacing: 11.5,
  });

  panel(s, 0.34, 4.76, 11.0, 1.22, WASH);
  s.addShape(p.ShapeType.rect, { x: 0.34, y: 4.76, w: 0.07, h: 1.22, fill: { color: NAVY } });
  label(s, 0.56, 4.86, 10.4, 'Prototype, engine and every figure in this deck', NAVY);
  s.addText('github.com/agpriyanshu07/SIH-Internal-NITR-2', {
    x: 0.56, y: 5.06, w: 5.2, h: 0.28, fontFace: FH, fontSize: 12.5, bold: true, color: BLUE, margin: 0, valign: 'middle',
  });
  s.addText('npm run validate  reproduces all 62 engine checks  ·  npm run screen  reproduces all 3,032 events  ·  npm run scaling  re-measures the \u22481.73 scaling exponent', {
    x: 0.56, y: 5.36, w: 10.6, h: 0.26, fontFace: F, fontSize: 9.5, color: BODY, margin: 0, valign: 'middle',
  });
  s.addText('No figure in this presentation is estimated, projected or illustrative. Each one is either measured by the prototype or cited above.', {
    x: 0.56, y: 5.64, w: 10.6, h: 0.26, fontFace: F, fontSize: 9.5, color: MUTE, italic: true, margin: 0, valign: 'middle',
  });
  s.addNotes('Expect the AI question. This slide answers it with numbers rather than defensively.');
}

p.writeFile({ fileName: 'KESSLER-SIH-PS04.pptx' }).then(() => console.log('written'));
