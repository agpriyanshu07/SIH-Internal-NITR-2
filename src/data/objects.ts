import { makeRng, uniform, int, pick, weighted, type Rng } from './rng';
import { apogee, perigee, periodMinutes } from './orbital';
import { synthesiseTle } from './tle';
import { fmtDate } from './format';
import type { ObjectType, RcsSize, SpaceObject } from './types';

/**
 * The synthetic object catalogue.
 *
 * ~400 objects generated from a fixed seed. The sixteen objects the design
 * mockups name are included verbatim as anchors, so the screens on the
 * artboards are reproducible; the rest are generated around them.
 */

export const CATALOGUE_SEED = 0x4b45_5353; // "KESS"
export const TARGET_OBJECT_COUNT = 400;

/** Element sets are all fresh relative to this instant; fixed at module load. */
export const EPOCH_NOW = Date.UTC(2026, 7, 21, 14, 32, 7);

// ── Anchors: the objects the design mockups show by name ────────────────────
type Anchor = Omit<SpaceObject, 'apogee' | 'perigee' | 'period' | 'tle'>;

const ANCHORS: Anchor[] = [
  { norad: 25544, name: 'ISS (ZARYA)',         type: 'PAYLOAD',     op: 'NASA / ROSCOSMOS',  intl: '98067A',  launch: '1998-11-20', alt: 421,  ecc: 0.0006703, incl: 51.6416, raan: 247.4627, argp: 130.5360, ma: 325.0288, rcs: 'LARGE',  age: 1.8 },
  { norad: 45657, name: 'STARLINK-1436',       type: 'PAYLOAD',     op: 'SPACEX',            intl: '20025BE', launch: '2020-04-22', alt: 550,  ecc: 0.0001432, incl: 53.0538, raan: 118.2274, argp: 88.4102,  ma: 271.7318, rcs: 'MEDIUM', age: 0.6 },
  { norad: 34454, name: 'COSMOS 2251 DEB',     type: 'DEBRIS',      op: 'CIS (DERELICT)',    intl: '93036SX', launch: '1993-06-16', alt: 781,  ecc: 0.0043117, incl: 74.0382, raan: 12.9046,  argp: 214.7729, ma: 145.1183, rcs: 'SMALL',  age: 4.3 },
  { norad: 30793, name: 'FENGYUN 1C DEB',      type: 'DEBRIS',      op: 'PRC (DERELICT)',    intl: '99025DKX',launch: '1999-05-10', alt: 862,  ecc: 0.0169402, incl: 98.7143, raan: 301.5528, argp: 42.1907,  ma: 318.6644, rcs: 'SMALL',  age: 6.1 },
  { norad: 42063, name: 'SENTINEL-2B',         type: 'PAYLOAD',     op: 'ESA / COPERNICUS',  intl: '17013A',  launch: '2017-03-07', alt: 786,  ecc: 0.0001098, incl: 98.5674, raan: 214.3391, argp: 91.2205,  ma: 268.9042, rcs: 'LARGE',  age: 1.1 },
  { norad: 33772, name: 'IRIDIUM 33 DEB',      type: 'DEBRIS',      op: 'US (DERELICT)',     intl: '97051EJ', launch: '1997-09-14', alt: 779,  ecc: 0.0055214, incl: 86.4021, raan: 158.8815, argp: 12.4470,  ma: 348.0091, rcs: 'SMALL',  age: 5.7 },
  { norad: 38078, name: 'ATLAS 5 CENTAUR R/B', type: 'ROCKET BODY', op: 'US (SPENT STAGE)',  intl: '12009B',  launch: '2012-02-24', alt: 1002, ecc: 0.0201884, incl: 55.0113, raan: 74.6602,  argp: 178.3325, ma: 182.7714, rcs: 'LARGE',  age: 3.4 },
  { norad: 25994, name: 'TERRA',               type: 'PAYLOAD',     op: 'NASA',              intl: '99068A',  launch: '1999-12-18', alt: 705,  ecc: 0.0001307, incl: 98.2007, raan: 189.4412, argp: 105.6618, ma: 254.4805, rcs: 'LARGE',  age: 2.2 },
  { norad: 33591, name: 'NOAA 19',             type: 'PAYLOAD',     op: 'NOAA',              intl: '09005A',  launch: '2009-02-06', alt: 871,  ecc: 0.0013802, incl: 99.1875, raan: 262.0084, argp: 22.8113,  ma: 337.3956, rcs: 'LARGE',  age: 1.4 },
  { norad: 23405, name: 'SL-16 R/B',           type: 'ROCKET BODY', op: 'CIS (SPENT STAGE)', intl: '94077B',  launch: '1994-11-24', alt: 846,  ecc: 0.0014455, incl: 71.0069, raan: 44.3382,  argp: 197.7724, ma: 162.2681, rcs: 'LARGE',  age: 4.9 },
  { norad: 52117, name: 'CZ-6A DEB',           type: 'DEBRIS',      op: 'PRC (DERELICT)',    intl: '22033AK', launch: '2022-03-29', alt: 812,  ecc: 0.0106713, incl: 98.9142, raan: 331.0067, argp: 61.8802,  ma: 298.3390, rcs: 'SMALL',  age: 3.0 },
  { norad: 48227, name: 'ONEWEB-0298',         type: 'PAYLOAD',     op: 'ONEWEB',            intl: '21036N',  launch: '2021-04-25', alt: 1198, ecc: 0.0002205, incl: 87.8871, raan: 96.1140,  argp: 79.5528,  ma: 280.5602, rcs: 'MEDIUM', age: 0.9 },
  { norad: 47953, name: 'UNISAT-7',            type: 'PAYLOAD',     op: 'GAUSS SRL',         intl: '21022AS', launch: '2021-03-22', alt: 537,  ecc: 0.0011882, incl: 97.5104, raan: 148.7726, argp: 133.4418, ma: 226.8005, rcs: 'SMALL',  age: 2.7 },
  { norad: 43013, name: 'NOAA 20 (JPSS-1)',    type: 'PAYLOAD',     op: 'NOAA / NASA',       intl: '17073A',  launch: '2017-11-18', alt: 824,  ecc: 0.0001204, incl: 98.7302, raan: 205.9938, argp: 96.0027,  ma: 264.1284, rcs: 'LARGE',  age: 1.2 },
  { norad: 39452, name: 'SWARM A',             type: 'PAYLOAD',     op: 'ESA',               intl: '13067B',  launch: '2013-11-22', alt: 438,  ecc: 0.0009017, incl: 87.3541, raan: 62.4418,  argp: 118.7203, ma: 241.5510, rcs: 'MEDIUM', age: 2.0 },
  { norad: 8063,  name: 'DELTA 1 R/B',         type: 'ROCKET BODY', op: 'US (SPENT STAGE)',  intl: '75052B',  launch: '1975-06-12', alt: 903,  ecc: 0.0093118, incl: 99.9016, raan: 27.7724,  argp: 240.1108, ma: 119.4482, rcs: 'LARGE',  age: 7.8 },
];

// ── Generated families ──────────────────────────────────────────────────────

interface Family {
  /** Given a sequence number, produce the object name. */
  name: (n: number, rng: Rng) => string;
  type: ObjectType;
  op: string;
  /** Mean altitude band, km. */
  alt: [number, number];
  /** Inclinations this family actually flies. */
  incl: number[];
  ecc: [number, number];
  rcs: RcsSize;
  /** Launch year band. */
  years: [number, number];
  /** How many of the ~400 slots this family takes. */
  weight: number;
}

const pad = (n: number, w: number) => String(n).padStart(w, '0');

const FAMILIES: Family[] = [
  // Large constellations dominate the modern catalogue.
  { name: (n) => `STARLINK-${1000 + n * 7}`, type: 'PAYLOAD', op: 'SPACEX', alt: [535, 575], incl: [53.05, 53.22, 70.0, 97.65], ecc: [0.00005, 0.0004], rcs: 'MEDIUM', years: [2020, 2026], weight: 62 },
  { name: (n) => `ONEWEB-${pad(100 + n * 3, 4)}`, type: 'PAYLOAD', op: 'ONEWEB', alt: [1190, 1210], incl: [87.89, 87.91], ecc: [0.0001, 0.0004], rcs: 'MEDIUM', years: [2019, 2025], weight: 26 },
  { name: (n) => `IRIDIUM ${100 + n}`, type: 'PAYLOAD', op: 'IRIDIUM COMMUNICATIONS', alt: [775, 785], incl: [86.39, 86.41], ecc: [0.0001, 0.0004], rcs: 'MEDIUM', years: [2017, 2019], weight: 12 },
  { name: (n) => `FLOCK 4P-${pad(n + 1, 2)}`, type: 'PAYLOAD', op: 'PLANET LABS', alt: [470, 525], incl: [97.35, 97.48, 51.6], ecc: [0.0002, 0.0016], rcs: 'SMALL', years: [2019, 2025], weight: 16 },
  { name: (n) => `LEMUR-2-${pad(3100 + n * 13, 4)}`, type: 'PAYLOAD', op: 'SPIRE GLOBAL', alt: [490, 555], incl: [85.02, 97.55], ecc: [0.0003, 0.0018], rcs: 'SMALL', years: [2018, 2025], weight: 14 },
  { name: (n) => `ICEYE-X${pad(n + 4, 2)}`, type: 'PAYLOAD', op: 'ICEYE OY', alt: [560, 585], incl: [97.62, 97.74], ecc: [0.0002, 0.0012], rcs: 'SMALL', years: [2018, 2026], weight: 9 },
  { name: (n) => `YAOGAN-${30 + n}`, type: 'PAYLOAD', op: 'CNSA', alt: [480, 1100], incl: [35.0, 63.4, 97.9, 98.5], ecc: [0.0002, 0.0035], rcs: 'MEDIUM', years: [2015, 2025], weight: 14 },
  { name: (n) => `COSMOS ${2500 + n * 3}`, type: 'PAYLOAD', op: 'ROSCOSMOS', alt: [400, 1010], incl: [64.9, 67.15, 82.5, 97.6], ecc: [0.0004, 0.006], rcs: 'LARGE', years: [2014, 2025], weight: 13 },

  // Derelict fragment clouds. Real catalogues carry hundreds of rows sharing a
  // single name, disambiguated only by NORAD id — that is reproduced here.
  { name: () => 'COSMOS 2251 DEB', type: 'DEBRIS', op: 'CIS (DERELICT)', alt: [720, 900], incl: [73.8, 74.2, 74.5], ecc: [0.002, 0.019], rcs: 'SMALL', years: [1993, 1993], weight: 40 },
  { name: () => 'IRIDIUM 33 DEB', type: 'DEBRIS', op: 'US (DERELICT)', alt: [700, 880], incl: [86.2, 86.6, 87.1], ecc: [0.002, 0.017], rcs: 'SMALL', years: [1997, 1997], weight: 26 },
  { name: () => 'FENGYUN 1C DEB', type: 'DEBRIS', op: 'PRC (DERELICT)', alt: [740, 1050], incl: [98.4, 98.9, 99.3], ecc: [0.003, 0.028], rcs: 'SMALL', years: [1999, 1999], weight: 44 },
  { name: () => 'COSMOS 1408 DEB', type: 'DEBRIS', op: 'CIS (DERELICT)', alt: [420, 700], incl: [82.4, 82.7], ecc: [0.004, 0.026], rcs: 'SMALL', years: [1982, 1982], weight: 22 },
  { name: () => 'CZ-6A DEB', type: 'DEBRIS', op: 'PRC (DERELICT)', alt: [760, 880], incl: [98.7, 99.1], ecc: [0.004, 0.021], rcs: 'SMALL', years: [2022, 2022], weight: 18 },
  { name: () => 'THORAD AGENA D DEB', type: 'DEBRIS', op: 'US (DERELICT)', alt: [620, 940], incl: [74.5, 81.4], ecc: [0.003, 0.022], rcs: 'SMALL', years: [1970, 1970], weight: 12 },
  { name: () => 'ARIANE 5 DEB', type: 'DEBRIS', op: 'ESA (DERELICT)', alt: [560, 820], incl: [6.9, 98.2], ecc: [0.002, 0.018], rcs: 'SMALL', years: [2002, 2009], weight: 10 },
  { name: () => 'NOAA 16 DEB', type: 'DEBRIS', op: 'US (DERELICT)', alt: [780, 900], incl: [98.6, 99.0], ecc: [0.002, 0.014], rcs: 'SMALL', years: [2000, 2000], weight: 9 },

  // Spent upper stages.
  { name: () => 'CZ-6 R/B', type: 'ROCKET BODY', op: 'PRC (SPENT STAGE)', alt: [480, 1050], incl: [97.4, 98.9], ecc: [0.001, 0.014], rcs: 'LARGE', years: [2015, 2025], weight: 9 },
  { name: () => 'CZ-2D R/B', type: 'ROCKET BODY', op: 'PRC (SPENT STAGE)', alt: [450, 780], incl: [35.0, 97.4], ecc: [0.001, 0.017], rcs: 'LARGE', years: [2016, 2025], weight: 7 },
  { name: () => 'SL-16 R/B', type: 'ROCKET BODY', op: 'CIS (SPENT STAGE)', alt: [820, 870], incl: [70.9, 71.1], ecc: [0.0008, 0.003], rcs: 'LARGE', years: [1988, 1995], weight: 8 },
  { name: () => 'SL-8 R/B', type: 'ROCKET BODY', op: 'CIS (SPENT STAGE)', alt: [740, 1010], incl: [74.0, 82.9], ecc: [0.001, 0.012], rcs: 'LARGE', years: [1975, 1991], weight: 10 },
  { name: () => 'FALCON 9 R/B', type: 'ROCKET BODY', op: 'US (SPENT STAGE)', alt: [300, 700], incl: [43.0, 53.0, 97.4], ecc: [0.002, 0.036], rcs: 'LARGE', years: [2018, 2026], weight: 8 },
  { name: () => 'DELTA 1 R/B', type: 'ROCKET BODY', op: 'US (SPENT STAGE)', alt: [820, 980], incl: [98.9, 101.2], ecc: [0.004, 0.019], rcs: 'LARGE', years: [1972, 1981], weight: 6 },
  { name: () => 'ARIANE 44L R/B', type: 'ROCKET BODY', op: 'ESA (SPENT STAGE)', alt: [560, 820], incl: [6.9, 7.4], ecc: [0.004, 0.024], rcs: 'LARGE', years: [1990, 1999], weight: 5 },
  { name: () => 'PSLV R/B', type: 'ROCKET BODY', op: 'ISRO (SPENT STAGE)', alt: [480, 820], incl: [97.4, 98.7], ecc: [0.001, 0.013], rcs: 'LARGE', years: [2012, 2024], weight: 6 },
  { name: () => 'H-2A R/B', type: 'ROCKET BODY', op: 'JAXA (SPENT STAGE)', alt: [560, 890], incl: [97.9, 98.4], ecc: [0.001, 0.011], rcs: 'LARGE', years: [2010, 2023], weight: 4 },
];

/** One-off named spacecraft, for recognisability in search results. */
const NOTABLE: { name: string; op: string; alt: number; incl: number; rcs: RcsSize; year: number }[] = [
  { name: 'SENTINEL-1A', op: 'ESA / COPERNICUS', alt: 693, incl: 98.18, rcs: 'LARGE', year: 2014 },
  { name: 'SENTINEL-3A', op: 'ESA / COPERNICUS', alt: 802, incl: 98.62, rcs: 'LARGE', year: 2016 },
  { name: 'SENTINEL-5P', op: 'ESA / COPERNICUS', alt: 824, incl: 98.74, rcs: 'MEDIUM', year: 2017 },
  { name: 'SENTINEL-6A', op: 'ESA / NOAA', alt: 1336, incl: 66.04, rcs: 'LARGE', year: 2020 },
  { name: 'AQUA', op: 'NASA', alt: 702, incl: 98.21, rcs: 'LARGE', year: 2002 },
  { name: 'AURA', op: 'NASA', alt: 705, incl: 98.22, rcs: 'LARGE', year: 2004 },
  { name: 'LANDSAT 8', op: 'USGS / NASA', alt: 705, incl: 98.22, rcs: 'LARGE', year: 2013 },
  { name: 'LANDSAT 9', op: 'USGS / NASA', alt: 705, incl: 98.21, rcs: 'LARGE', year: 2021 },
  { name: 'SUOMI NPP', op: 'NOAA / NASA', alt: 828, incl: 98.74, rcs: 'LARGE', year: 2011 },
  { name: 'NOAA 15', op: 'NOAA', alt: 807, incl: 98.75, rcs: 'LARGE', year: 1998 },
  { name: 'NOAA 18', op: 'NOAA', alt: 854, incl: 99.05, rcs: 'LARGE', year: 2005 },
  { name: 'NOAA 21 (JPSS-2)', op: 'NOAA / NASA', alt: 823, incl: 98.73, rcs: 'LARGE', year: 2022 },
  { name: 'METOP-B', op: 'EUMETSAT', alt: 817, incl: 98.68, rcs: 'LARGE', year: 2012 },
  { name: 'METOP-C', op: 'EUMETSAT', alt: 817, incl: 98.69, rcs: 'LARGE', year: 2018 },
  { name: 'SWARM B', op: 'ESA', alt: 511, incl: 87.75, rcs: 'MEDIUM', year: 2013 },
  { name: 'SWARM C', op: 'ESA', alt: 438, incl: 87.35, rcs: 'MEDIUM', year: 2013 },
  { name: 'CRYOSAT-2', op: 'ESA', alt: 717, incl: 92.02, rcs: 'LARGE', year: 2010 },
  { name: 'JASON-3', op: 'NOAA / CNES', alt: 1336, incl: 66.04, rcs: 'MEDIUM', year: 2016 },
  { name: 'ICESAT-2', op: 'NASA', alt: 496, incl: 91.99, rcs: 'LARGE', year: 2018 },
  { name: 'AEOLUS-2', op: 'ESA', alt: 320, incl: 96.71, rcs: 'MEDIUM', year: 2025 },
  { name: 'CALIPSO', op: 'NASA / CNES', alt: 688, incl: 98.19, rcs: 'MEDIUM', year: 2006 },
  { name: 'HST (HUBBLE)', op: 'NASA / ESA', alt: 535, incl: 28.47, rcs: 'LARGE', year: 1990 },
  { name: 'FERMI', op: 'NASA', alt: 534, incl: 25.58, rcs: 'LARGE', year: 2008 },
  { name: 'NUSTAR', op: 'NASA / CALTECH', alt: 596, incl: 6.02, rcs: 'MEDIUM', year: 2012 },
  { name: 'CSS (TIANHE)', op: 'CMSA', alt: 383, incl: 41.47, rcs: 'LARGE', year: 2021 },
  { name: 'TERRASAR-X', op: 'DLR / AIRBUS', alt: 514, incl: 97.44, rcs: 'MEDIUM', year: 2007 },
  { name: 'TANDEM-X', op: 'DLR / AIRBUS', alt: 514, incl: 97.44, rcs: 'MEDIUM', year: 2010 },
  { name: 'RADARSAT-2', op: 'CSA / MDA', alt: 798, incl: 98.58, rcs: 'LARGE', year: 2007 },
  { name: 'SAOCOM 1B', op: 'CONAE', alt: 620, incl: 97.89, rcs: 'LARGE', year: 2020 },
  { name: 'PAZ', op: 'HISDESAT', alt: 514, incl: 97.44, rcs: 'MEDIUM', year: 2018 },
  { name: 'KOMPSAT-5', op: 'KARI', alt: 550, incl: 97.6, rcs: 'MEDIUM', year: 2013 },
  { name: 'CARTOSAT-3', op: 'ISRO', alt: 509, incl: 97.5, rcs: 'MEDIUM', year: 2019 },
  { name: 'OCEANSAT-3', op: 'ISRO', alt: 740, incl: 98.35, rcs: 'MEDIUM', year: 2022 },
  { name: 'RESOURCESAT-2A', op: 'ISRO', alt: 817, incl: 98.72, rcs: 'MEDIUM', year: 2016 },
  { name: 'KANOPUS-V 6', op: 'ROSCOSMOS', alt: 512, incl: 97.44, rcs: 'MEDIUM', year: 2018 },
  { name: 'METEOR-M2-3', op: 'ROSCOSMOS', alt: 822, incl: 98.75, rcs: 'LARGE', year: 2023 },
  { name: 'PROBA-V', op: 'ESA', alt: 818, incl: 98.73, rcs: 'SMALL', year: 2013 },
  { name: 'DEIMOS-2', op: 'DEIMOS IMAGING', alt: 620, incl: 97.94, rcs: 'SMALL', year: 2014 },
  { name: 'GRACE-FO 1', op: 'NASA / GFZ', alt: 490, incl: 88.98, rcs: 'MEDIUM', year: 2018 },
  { name: 'GRACE-FO 2', op: 'NASA / GFZ', alt: 490, incl: 88.98, rcs: 'MEDIUM', year: 2018 },
];

/** International designator: `24037BK`. */
function intlDesignator(rng: Rng, year: number, piece: number): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // I and O are not used
  const yy = pad(year % 100, 2);
  const launchNo = pad(int(rng, 1, 120), 3);
  let suffix = '';
  let p = piece;
  do {
    suffix = letters[p % letters.length] + suffix;
    p = Math.floor(p / letters.length) - 1;
  } while (p >= 0);
  return `${yy}${launchNo}${suffix}`;
}

function buildCatalogue(): SpaceObject[] {
  const rng = makeRng(CATALOGUE_SEED);
  const used = new Set<number>(ANCHORS.map((a) => a.norad));
  const out: SpaceObject[] = [];

  const nextNorad = (): number => {
    let n: number;
    do {
      n = int(rng, 10000, 99999);
    } while (used.has(n));
    used.add(n);
    return n;
  };

  const finish = (a: Anchor): SpaceObject => ({
    ...a,
    apogee: apogee(a.alt, a.ecc),
    perigee: perigee(a.alt, a.ecc),
    period: periodMinutes(a.alt),
    tle: synthesiseTle(a, EPOCH_NOW),
  });

  for (const a of ANCHORS) out.push(finish(a));

  // Notable one-offs.
  for (const n of NOTABLE) {
    const ecc = uniform(rng, 0.00008, 0.0022);
    out.push(
      finish({
        norad: nextNorad(),
        name: n.name,
        type: 'PAYLOAD',
        op: n.op,
        intl: intlDesignator(rng, n.year, 0),
        launch: fmtDate(new Date(Date.UTC(n.year, int(rng, 0, 11), int(rng, 1, 28)))),
        alt: n.alt,
        ecc,
        incl: n.incl,
        raan: uniform(rng, 0, 360),
        argp: uniform(rng, 0, 360),
        ma: uniform(rng, 0, 360),
        rcs: n.rcs,
        // Tracked, well-maintained objects get refreshed element sets.
        age: uniform(rng, 0.3, 2.4),
      }),
    );
  }

  // Families, drawn until the catalogue reaches its target size.
  const pool = FAMILIES.map((f) => [f, f.weight] as const);
  const seq = new Map<Family, number>();

  while (out.length < TARGET_OBJECT_COUNT) {
    const f = weighted(rng, pool);
    const n = seq.get(f) ?? 0;
    seq.set(f, n + 1);

    const year = int(rng, f.years[0], f.years[1]);
    const alt = uniform(rng, f.alt[0], f.alt[1]);
    const ecc = uniform(rng, f.ecc[0], f.ecc[1]);
    // Debris drifts and is observed less often, so its elements are staler.
    const age =
      f.type === 'DEBRIS'
        ? uniform(rng, 2.2, 8.5)
        : f.type === 'ROCKET BODY'
          ? uniform(rng, 1.4, 6.0)
          : uniform(rng, 0.3, 3.2);

    out.push(
      finish({
        norad: nextNorad(),
        name: f.name(n, rng),
        type: f.type,
        op: f.op,
        intl: intlDesignator(rng, year, n),
        launch: fmtDate(new Date(Date.UTC(year, int(rng, 0, 11), int(rng, 1, 28)))),
        alt: Math.round(alt),
        ecc: +ecc.toFixed(7),
        // Scatter around the family's nominal inclination, as real shells do.
        incl: +(pick(rng, f.incl) + uniform(rng, -0.08, 0.08)).toFixed(4),
        raan: uniform(rng, 0, 360),
        argp: uniform(rng, 0, 360),
        ma: uniform(rng, 0, 360),
        rcs: f.rcs,
        age: +age.toFixed(1),
      }),
    );
  }

  return out;
}

export const OBJECTS: SpaceObject[] = buildCatalogue();

const BY_NORAD = new Map(OBJECTS.map((o) => [o.norad, o]));

export const objectById = (norad: number): SpaceObject =>
  BY_NORAD.get(norad) ?? OBJECTS[0];

export const OBJECT_COUNTS: Record<ObjectType, number> = OBJECTS.reduce(
  (acc, o) => ({ ...acc, [o.type]: acc[o.type] + 1 }),
  { PAYLOAD: 0, 'ROCKET BODY': 0, DEBRIS: 0 } as Record<ObjectType, number>,
);

/**
 * The headline "objects tracked" figure the design shows (34,182). The
 * catalogue here is the registered subset an operator would actually screen.
 */
export const CATALOGUE_TOTAL = 34182;
