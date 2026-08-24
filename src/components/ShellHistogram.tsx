import { useMemo } from 'react';
import type { ObjectType, SpaceObject } from '../data/types';
import { SHELL_MAX_KM, SHELL_MIN_KM } from './TableViz';

/**
 * Where the catalogue actually lives, by altitude.
 *
 * The single most useful thing to know about a debris catalogue is which
 * shells it occupies, and the table could not say it: 859 rows of perigee and
 * apogee is a fact per object and no picture of the population. This bins the
 * mean altitude and stacks each bin by class, so the Cosmos 2251 and Iridium
 * 33 clouds appear as the spikes they are.
 *
 * It is also the filter. Clicking a bin restricts the table to that band —
 * which is the question you have as soon as you see a spike, and previously
 * had no way to ask.
 */

const BINS = 34;
const BIN_KM = (SHELL_MAX_KM - SHELL_MIN_KM) / BINS;

/** Same three colours the table's class marks use, so the mapping is learned once. */
const FILL: Record<ObjectType, string> = {
  PAYLOAD: 'var(--accent)',
  'ROCKET BODY': 'var(--t1)',
  DEBRIS: 'var(--t2)',
};

export interface ShellBin {
  lo: number;
  hi: number;
  PAYLOAD: number;
  'ROCKET BODY': number;
  DEBRIS: number;
  total: number;
}

export function binByShell(objects: SpaceObject[]): ShellBin[] {
  const bins: ShellBin[] = Array.from({ length: BINS }, (_, i) => ({
    lo: SHELL_MIN_KM + i * BIN_KM,
    hi: SHELL_MIN_KM + (i + 1) * BIN_KM,
    PAYLOAD: 0,
    'ROCKET BODY': 0,
    DEBRIS: 0,
    total: 0,
  }));
  for (const o of objects) {
    const i = Math.floor((o.alt - SHELL_MIN_KM) / BIN_KM);
    if (i < 0 || i >= BINS) continue;
    bins[i][o.type]++;
    bins[i].total++;
  }
  return bins;
}

export function ShellHistogram({
  objects,
  band,
  onPick,
}: {
  objects: SpaceObject[];
  band: [number, number] | null;
  onPick: (band: [number, number] | null) => void;
}) {
  const bins = useMemo(() => binByShell(objects), [objects]);
  const peak = Math.max(1, ...bins.map((b) => b.total));

  /*
   * Square-root heights, not linear. One bin holds a third of the catalogue and
   * on a linear scale it flattens every other bin to a hairline — which hides
   * exactly the smaller shells someone is looking for. Sqrt keeps the big spike
   * obviously biggest while leaving the rest readable, and the counts are on
   * hover so nothing rests on reading a height.
   */
  const h = (n: number) => (n === 0 ? 0 : Math.sqrt(n / peak));

  return (
    <div className="flex items-end gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-[5px]">
        <div className="flex h-[42px] items-end gap-[2px]">
          {bins.map((b) => {
            const active = band !== null && b.lo >= band[0] && b.hi <= band[1];
            const dim = band !== null && !active;
            return (
              <button
                key={b.lo}
                type="button"
                onClick={() => onPick(active ? null : [b.lo, b.hi])}
                title={`${Math.round(b.lo)}–${Math.round(b.hi)} km · ${b.total} object${b.total === 1 ? '' : 's'}${
                  b.total ? ` · ${b.PAYLOAD} payload, ${b['ROCKET BODY']} R/B, ${b.DEBRIS} debris` : ''
                }`}
                aria-label={`${Math.round(b.lo)} to ${Math.round(b.hi)} kilometres, ${b.total} objects`}
                aria-pressed={active}
                className={`group relative flex h-full min-w-0 flex-1 flex-col justify-end rounded-xs transition-opacity ${
                  dim ? 'opacity-30' : 'opacity-100'
                } hover:opacity-100`}
              >
                {/* An always-present hairline floor, so an empty band still reads
                    as a band you can click rather than as nothing. */}
                <span className="absolute inset-x-0 bottom-0 h-px bg-hairline" />
                {/* The bar is sqrt-scaled as a whole; the segments inside it
                    split that height by their real share, so the stack stays a
                    true part-to-whole of the bin. */}
                <span
                  className="flex w-full flex-col justify-end overflow-hidden rounded-t-xs transition-[height] duration-300 ease-out"
                  style={{ height: `${h(b.total) * 100}%` }}
                >
                  {(['DEBRIS', 'ROCKET BODY', 'PAYLOAD'] as ObjectType[]).map((t) =>
                    b[t] ? (
                      <span
                        key={t}
                        className="w-full flex-none"
                        style={{
                          height: `${(b[t] / b.total) * 100}%`,
                          background: FILL[t],
                        }}
                      />
                    ) : null,
                  )}
                </span>
                {active && <span className="absolute inset-x-0 -bottom-[3px] h-[2px] bg-accent" />}
              </button>
            );
          })}
        </div>
        <div className="flex justify-between font-mono text-2xs tracking-data text-tertiary">
          <span>{SHELL_MIN_KM} km</span>
          <span className="text-secondary">
            {band ? `${Math.round(band[0])}–${Math.round(band[1])} km selected · click again to clear` : 'Mean altitude · click a band to filter'}
          </span>
          <span>{SHELL_MAX_KM} km</span>
        </div>
      </div>

      {/* Legend: three series, so identity never rests on colour alone. */}
      <div className="hidden flex-none flex-col gap-[3px] pb-[18px] sm:flex">
        {(['PAYLOAD', 'ROCKET BODY', 'DEBRIS'] as ObjectType[]).map((t) => (
          <span key={t} className="flex items-center gap-[6px]">
            <span
              className="h-[7px] w-[7px] flex-none rounded-xs"
              style={{ background: FILL[t] }}
            />
            <span className="font-mono text-2xs tracking-data text-tertiary">
              {t === 'ROCKET BODY' ? 'R/B' : t}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
