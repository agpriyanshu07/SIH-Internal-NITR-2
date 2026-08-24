import type { ObjectType } from '../data/types';

/**
 * Micro-visualisations that live inside a table cell.
 *
 * The catalogue was 859 rows of numbers with no visual encoding at all: to see
 * that the Cosmos 2251 cloud occupies a band around 750–800 km you had to read
 * two columns of four-digit numbers and hold them in your head. That is what
 * made a real instrument read as a spreadsheet.
 *
 * Nothing here adds a figure. Every mark is a number already in the row, drawn
 * so the column can be scanned instead of read.
 */

/*
 * The band these marks are drawn against.
 *
 * NOT 160-2000, the textbook LEO definition. This catalogue spans 340 km at
 * the lowest perigee to 1,627 km at the highest apogee, so a full-LEO scale
 * squeezed every bar into the middle third of the column and the shell
 * structure — the whole reason for drawing them — was invisible. Rounded out
 * from the real extremes so the column uses its width, with the range stated
 * in the header rather than assumed.
 */
export const SHELL_MIN_KM = 300;
export const SHELL_MAX_KM = 1700;

const frac = (km: number) =>
  Math.max(0, Math.min(1, (km - SHELL_MIN_KM) / (SHELL_MAX_KM - SHELL_MIN_KM)));

/**
 * Perigee-to-apogee as a segment on a fixed LEO scale.
 *
 * A bullet chart, in a table cell. Because every row shares one scale, a
 * sorted column becomes a picture of the shell structure — the debris clouds
 * stack into visible bands, and an eccentric orbit is a long bar where a
 * circular one is a dot. Neither is legible as a pair of numbers.
 */
export function ShellBar({
  perigee,
  apogee,
  type,
}: {
  perigee: number;
  apogee: number;
  type: ObjectType;
}) {
  const a = frac(Math.min(perigee, apogee));
  const b = frac(Math.max(perigee, apogee));
  // A circular orbit would otherwise be a zero-width segment and vanish.
  const width = Math.max(b - a, 0.022);
  return (
    <div
      className="relative h-[7px] w-full overflow-hidden rounded-xs bg-[rgba(255,255,255,0.05)]"
      title={`${perigee}–${apogee} km, on a ${SHELL_MIN_KM}–${SHELL_MAX_KM} km scale`}
      aria-hidden
    >
      <div
        className={`absolute inset-y-0 rounded-xs transition-[left,width] duration-300 ease-out ${
          type === 'DEBRIS'
            ? 'bg-[color:var(--t2)]'
            : type === 'ROCKET BODY'
              ? 'bg-[color:var(--t1)]'
              : 'bg-accent'
        }`}
        style={{ left: `${a * 100}%`, width: `${width * 100}%` }}
      />
    </div>
  );
}

/**
 * Object class as a mark plus its word.
 *
 * The word alone was three columns of grey text that all looked alike at a
 * glance. The mark makes the column scannable; the word is still there, so
 * nothing is carried by colour on its own.
 */
export function ClassMark({ type }: { type: ObjectType }) {
  const short = type === 'ROCKET BODY' ? 'R/B' : type === 'DEBRIS' ? 'DEB' : 'PAYLOAD';
  return (
    <span className="flex items-center gap-[6px]">
      <span
        className={`h-[7px] w-[7px] flex-none rounded-xs ${
          type === 'DEBRIS'
            ? 'bg-[color:var(--t3)]'
            : type === 'ROCKET BODY'
              ? 'bg-[color:var(--t2)]'
              : 'bg-accent'
        }`}
      />
      <span className="truncate font-mono text-2xs tracking-data text-tertiary">{short}</span>
    </span>
  );
}

/**
 * Element-set age as a filled pip against the ten-day threshold the console
 * screens on, so a stale row is visible without reading its number.
 */
export function AgePip({ days, staleAfter = 3 }: { days: number; staleAfter?: number }) {
  const stale = days > staleAfter;
  return (
    <span className="flex items-center justify-end gap-[6px]">
      <span
        className={`num text-xs tabular-nums ${stale ? 'text-risk-high' : 'text-tertiary'}`}
      >
        {days.toFixed(2)}
      </span>
      <span className="relative h-[7px] w-[18px] flex-none overflow-hidden rounded-xs bg-panel-high">
        <span
          className={`absolute inset-y-0 left-0 rounded-xs ${stale ? 'bg-risk-high' : 'bg-[color:var(--t3)]'}`}
          style={{ width: `${Math.max(6, Math.min(100, (days / 10) * 100))}%` }}
        />
      </span>
    </span>
  );
}
