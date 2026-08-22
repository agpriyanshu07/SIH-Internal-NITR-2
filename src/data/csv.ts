import { fmtUTC } from './format';
import type { ResolvedConjunction } from './types';

/**
 * CSV export of the conjunction table.
 *
 * Exports the rows exactly as displayed — same filter, same sort — because an
 * export that quietly disagreed with the screen it came from would be worse
 * than no export. Numbers are written at full precision rather than at display
 * precision, since the file is for further work, not for reading.
 */

const COLUMNS = [
  'event_id',
  'tca_utc',
  'miss_km',
  'relative_velocity_km_s',
  'collision_probability',
  'risk_score',
  'severity',
  'sigma_km',
  'oldest_element_set_days',
  'primary_name',
  'primary_norad',
  'secondary_name',
  'secondary_norad',
] as const;

/** RFC 4180: quote anything containing a comma, quote or newline; double the quotes. */
function cell(v: string | number): string {
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function conjunctionsToCsv(rows: ResolvedConjunction[]): string {
  const lines = [COLUMNS.join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.id,
        fmtUTC(new Date(r.tca)),
        r.miss,
        r.relv,
        r.pc.toExponential(6),
        r.score,
        r.sev,
        r.sigma,
        r.maxAge,
        r.A.name,
        r.A.norad,
        r.B.name,
        r.B.norad,
      ]
        .map(cell)
        .join(','),
    );
  }
  return lines.join('\r\n');
}

/** Hand the file to the browser. No network involved. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoking immediately can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
