/**
 * Re-entry latitude probability, as a horizontal histogram.
 *
 * Shared by the detail view's consequence panel and the analysis workbench, so
 * the two cannot show the same distribution differently. Bars are drawn only
 * inside the reachable band; outside it the probability is exactly zero, which
 * is a geometric fact rather than a small number, so those rows stay empty.
 */
/** Horizontal latitude histogram. Bars run out from the equator line. */
export function LatitudePlot({
  bins,
  bound,
}: {
  bins: { lat: number; p: number }[];
  bound: number;
}) {
  const peak = Math.max(...bins.map((b) => b.p), 1e-9);
  return (
    <div className="flex flex-col gap-[2px]" role="img"
         aria-label={`Re-entry latitude probability, bounded at plus or minus ${bound.toFixed(0)} degrees`}>
      {[...bins].reverse().map((b) => {
        const reachable = Math.abs(b.lat) <= bound;
        return (
          <div key={b.lat} className="flex items-center gap-2">
            <span className="num w-[46px] flex-none text-right text-2xs text-tertiary">
              {b.lat > 0 ? `${b.lat.toFixed(0)}°N` : b.lat < 0 ? `${(-b.lat).toFixed(0)}°S` : '0°'}
            </span>
            <div className="h-[7px] flex-1 overflow-hidden rounded-xs bg-panel-raised">
              <div
                className={reachable ? 'h-full bg-accent' : 'h-full'}
                style={{ width: `${((b.p / peak) * 100).toFixed(1)}%` }}
              />
            </div>
            <span className="num w-[42px] flex-none text-right text-2xs text-tertiary">
              {b.p > 0.0005 ? `${(b.p * 100).toFixed(1)}%` : '—'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

