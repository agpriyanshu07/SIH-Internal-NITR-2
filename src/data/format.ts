/**
 * Formatting rules, lifted straight from the design.
 *
 * Every number in the UI goes through one of these, so units, decimal places
 * and the UTC suffix stay consistent across all seven screens.
 */

const p2 = (n: number) => String(n).padStart(2, '0');

/** `2026-08-21 14:32:07Z` — the only timestamp format used anywhere. */
export function fmtUTC(d: Date): string {
  return (
    `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())} ` +
    `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}:${p2(d.getUTCSeconds())}Z`
  );
}

/** Date only, for launch dates: `1998-11-20`. */
export const fmtDate = (d: Date): string =>
  `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`;

/** `2d 04:11:37` / `00:41:22` / `PASSED`. Drives the live countdowns. */
export function fmtDur(ms: number): string {
  if (ms < 0) return 'PASSED';
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return (d > 0 ? `${d}d ` : '') + `${p2(h)}:${p2(m)}:${p2(s % 60)}`;
}

/** Coarse age, for the TLE-freshness indicator: `2 h 14 m`. */
export function fmtAge(ms: number): string {
  const m = Math.max(0, Math.floor(ms / 60000));
  if (m < 60) return `${m} m`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h} h ${p2(m % 60)} m`;
  return `${Math.floor(h / 24)} d ${h % 24} h`;
}

const SUPERSCRIPT: Record<string, string> = {
  '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴',
  5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹',
};

const sup = (n: number) =>
  String(n)
    .split('')
    .map((c) => SUPERSCRIPT[c] ?? c)
    .join('');

/** `4.70×10⁻⁴` — probabilities are always shown in scientific notation. */
export function fmtPc(v: number): string {
  if (!(v > 0)) return '0';
  const e = Math.floor(Math.log10(v));
  return `${(v / 10 ** e).toFixed(2)}×10${sup(e)}`;
}

/** Thousands-separated integer: `34,182`. */
export const fmtInt = (n: number) => Math.round(n).toLocaleString('en-US');

/** NORAD IDs are always five digits, zero-padded. */
export const fmtNorad = (n: number) => String(n).padStart(5, '0');
