import * as satellite from 'satellite.js';
import { EARTH_RADIUS_KM } from '../orbital';
import type { ObjectType, RcsSize, SpaceObject } from '../types';

/**
 * Ingest for the committed CelesTrak snapshot.
 *
 * Everything here is read off real two-line element sets. Where a field the UI
 * wants is genuinely absent from a TLE, that is stated rather than filled in —
 * see `rcs` and `launch`. Nothing is produced by a generator.
 *
 * Kept free of any bundler-specific import so the build-time precompute, the
 * validation tests and the browser all run the identical parser.
 */

const MU = 398600.4418; // km³/s²

export interface CatalogueEntry {
  object: SpaceObject;
  rec: satellite.SatRec;
  /** CelesTrak group this object was loaded from. */
  group: string;
}

/**
 * Operator / responsible state per group.
 *
 * A TLE carries no operator field. These are stated per group because every
 * object in a group descends from one known launch or programme, so the
 * attribution is a property of the file, not a guess about the row.
 */
const GROUP_OP: Record<string, string> = {
  stations: 'ISS / CSS PARTNERS',
  'cosmos-1408-debris': 'CIS (ASAT DEBRIS)',
  'iridium-33-debris': 'US (DERELICT)',
  'cosmos-2251-debris': 'CIS (DERELICT)',
};

/**
 * Human-readable origin of each group, for the provenance badge. Every one of
 * these is a real, dated event.
 */
export const GROUP_EVENT: Record<string, string | undefined> = {
  'cosmos-1408-debris': 'Cosmos 1408 — Russian ASAT test, 15 Nov 2021',
  'iridium-33-debris': 'Iridium 33 — collision with Cosmos 2251, 10 Feb 2009',
  'cosmos-2251-debris': 'Cosmos 2251 — collision with Iridium 33, 10 Feb 2009',
};

/**
 * Object class from the catalogue name. The public catalogue suffixes debris
 * with `DEB` and spent stages with `R/B` — a real convention, not an inference.
 */
function classify(name: string): ObjectType {
  if (/\bDEB\b/.test(name)) return 'DEBRIS';
  if (/\bR\/B\b/.test(name)) return 'ROCKET BODY';
  return 'PAYLOAD';
}

/**
 * Radar cross-section class.
 *
 * ASSUMPTION, and the app says so. Real RCS lives in the SATCAT, not in a TLE,
 * and the snapshot is TLE-only — so this is a class-based stand-in: tracked
 * fragments are small; spent stages and crewed modules are large. It feeds the
 * hard-body radius and the tracking-quality term of sigma, so it moves Pc. The
 * data-quality panel on the detail view discloses it.
 */
function assumeRcs(type: ObjectType): RcsSize {
  return type === 'DEBRIS' ? 'SMALL' : 'LARGE';
}

/**
 * International designator, TLE line 1 columns 10–17: two-digit launch year,
 * launch number within that year, then the piece. The year rolls at 57 — the
 * catalogue predates four-digit years.
 */
function intlDesignator(line1: string): { intl: string; launchYear: number } {
  const raw = line1.slice(9, 17).trim();
  const yy = Number(raw.slice(0, 2));
  return { intl: raw, launchYear: yy < 57 ? 2000 + yy : 1900 + yy };
}

export interface GroupSource {
  group: string;
  text: string;
}

/**
 * Parse CelesTrak three-line group files into a catalogue.
 *
 * `epochMs` is the instant element-set ages are measured against — the snapshot
 * capture instant, not the wall clock, because every file came from one capture.
 */
export function parseCatalogue(
  sources: GroupSource[],
  epochMs: number,
): CatalogueEntry[] {
  const out: CatalogueEntry[] = [];

  for (const { group, text } of sources) {
    const lines = text.split(/\r?\n/);
    for (let i = 0; i + 2 < lines.length; i += 3) {
      const name = lines[i]?.trim();
      const l1 = lines[i + 1];
      const l2 = lines[i + 2];
      if (!name || !l1?.startsWith('1 ') || !l2?.startsWith('2 ')) continue;

      let rec: satellite.SatRec;
      try {
        rec = satellite.twoline2satrec(l1, l2);
      } catch {
        continue;
      }
      // A non-zero error means SGP4 rejected the element set outright.
      if (rec.error !== satellite.SatRecError.None) continue;

      const n = rec.no / 60; // rad/min -> rad/s
      const a = Math.cbrt(MU / (n * n)); // semi-major axis, km from Earth centre
      const ecc = rec.ecco;

      const type = classify(name);
      const { intl, launchYear } = intlDesignator(l1);
      const objectEpochMs = satellite.invjday(rec.jdsatepoch).getTime();

      out.push({
        group,
        rec,
        object: {
          norad: Number(rec.satnum),
          name,
          type,
          op: GROUP_OP[group] ?? group.toUpperCase(),
          intl,
          // A TLE gives the launch YEAR via the designator and nothing finer.
          // The UI labels this "Launch year" rather than inventing a date.
          launch: String(launchYear),
          alt: Math.round(a - EARTH_RADIUS_KM),
          apogee: Math.round(a * (1 + ecc) - EARTH_RADIUS_KM),
          perigee: Math.round(a * (1 - ecc) - EARTH_RADIUS_KM),
          ecc: +ecc.toFixed(7),
          incl: +((rec.inclo * 180) / Math.PI).toFixed(4),
          raan: +((rec.nodeo * 180) / Math.PI).toFixed(4),
          argp: +((rec.argpo * 180) / Math.PI).toFixed(4),
          ma: +((rec.mo * 180) / Math.PI).toFixed(4),
          period: +((2 * Math.PI * Math.sqrt((a * a * a) / MU)) / 60).toFixed(2),
          rcs: assumeRcs(type),
          // Real element-set age: capture instant minus this object's own epoch.
          age: +((epochMs - objectEpochMs) / 86400000).toFixed(2),
          tle: [l1, l2],
        },
      });
    }
  }

  // A capture can carry the same object in two groups; the first wins.
  const seen = new Set<number>();
  return out.filter((e) => {
    if (seen.has(e.object.norad)) return false;
    seen.add(e.object.norad);
    return true;
  });
}
