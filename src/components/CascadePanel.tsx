import { fmtInt } from '../data/format';
import type { RunCascade } from '../data/engine/run';
import { Panel } from './primitives';

/**
 * The measured pair-reduction cascade.
 *
 * Every figure here is counted by the engine during the run it describes — none
 * is a stored constant. That matters: the claim this panel makes is that a
 * few hundred thousand pairs can be cut to a few hundred events without
 * dropping any of them, and a hard-coded number would make that claim
 * unfalsifiable. `npm run validate` checks the cut against brute force.
 */

function Stage({
  label,
  value,
  note,
  fraction,
  emphasis = false,
}: {
  label: string;
  value: number;
  note: string;
  fraction: number;
  emphasis?: boolean;
}) {
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex items-baseline justify-between gap-3">
        <div className="label truncate">{label}</div>
        <div
          className={`num flex-none text-md ${emphasis ? 'text-accent' : 'text-primary'}`}
        >
          {fmtInt(value)}
        </div>
      </div>
      {/* Linear width, deliberately. The last stage really is under one percent
          of the first, and that sliver is the whole point — a log scale would
          redraw a 100x reduction as a bar two thirds full. A floor keeps the
          smallest stage visible without overstating it. */}
      <div className="h-[3px] w-full overflow-hidden rounded-full bg-panel-raised">
        <div
          className={`h-full rounded-full ${emphasis ? 'bg-accent' : 'bg-[color:var(--t2)]'}`}
          style={{ width: `${Math.max(0.6, fraction * 100).toFixed(2)}%` }}
        />
      </div>
      <div className="num text-xs- text-tertiary">{note}</div>
    </div>
  );
}

export function CascadePanel({
  cascade,
  live,
}: {
  cascade: RunCascade;
  live: boolean;
}) {
  const w = (n: number) => (cascade.totalPairs <= 0 ? 0 : n / cascade.totalPairs);

  const radialCut = cascade.totalPairs - cascade.afterRadialFilter;
  const reduction = cascade.events > 0 ? cascade.totalPairs / cascade.events : 0;

  return (
    <Panel
      title="Pair reduction cascade"
      aside={
        <span className="num text-xs- text-tertiary">
          {live ? 'LIVE RUN' : 'COMMITTED RUN'} · {cascade.horizonHours} H
        </span>
      }
      bodyClassName="flex flex-col gap-[14px] p-[14px]"
    >
      <Stage
        label="All pairs"
        value={cascade.totalPairs}
        fraction={w(cascade.totalPairs)}
        note={`${fmtInt(cascade.objects)} objects, every pair considered`}
      />
      <Stage
        label="After radial overlap filter"
        value={cascade.afterRadialFilter}
        fraction={w(cascade.afterRadialFilter)}
        note={
          radialCut === 0
            ? 'removed nothing — every group here shares the same LEO shells'
            : `${fmtInt(radialCut)} pairs whose orbits can never come close`
        }
      />
      <Stage
        label="Coarse screen candidates"
        value={cascade.candidates}
        fraction={w(cascade.candidates)}
        note={`sampled within the screening radius; ${fmtInt(cascade.coOrbiting)} dropped as co-orbiting`}
      />
      <Stage
        label="Confirmed events"
        value={cascade.events}
        fraction={w(cascade.events)}
        emphasis
        note={`refined to true TCA and inside the ${cascade.gateKm} km gate — a ${reduction < 10 ? reduction.toFixed(1) : fmtInt(reduction)}x reduction`}
      />

      <div className="grid grid-cols-2 gap-x-[14px] gap-y-2 border-t border-hairline-soft pt-3">
        <div>
          <div className="label mb-1">SGP4 propagations</div>
          <div className="num text-md text-primary">{fmtInt(cascade.propagations)}</div>
        </div>
        <div>
          <div className="label mb-1">Wall clock</div>
          <div className="num text-md text-primary">
            {(cascade.elapsedMs / 1000).toFixed(1)}
            <span className="ml-1 text-xs- text-tertiary">s</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}
