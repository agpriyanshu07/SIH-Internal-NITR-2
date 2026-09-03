import { DURATION, EASE } from '../lib/motion';
import { fmtInt } from '../data/format';
import type { PhaseLog, RunPhase } from '../hooks/useScreening';
import { RUN_PHASES } from '../hooks/useScreening';
import type { WorkerProgress } from '../workers/screening.worker';

/**
 * The screening boot sequence.
 *
 * A 72-hour screen is on the order of a million SGP4 evaluations, and used to
 * run behind a single percentage that ticked from 0 to 100 with no sense of
 * what was actually happening underneath it. This renders the real phase
 * structure of `runScreening` instead — see `screening.worker.ts` for exactly
 * which four wire phases exist and why there are four, not the five the
 * feature was scoped against (propagation and the coarse distance gate share
 * one loop; risk scoring is computed inline per candidate rather than as its
 * own pass). Every number below is read off the message the worker actually
 * sent for that phase — nothing here is a fake timer or an interpolated bar.
 */

const LABEL: Record<RunPhase, string> = {
  parse: 'Parse snapshot',
  radial: 'Radial pre-filter',
  sweep: 'Propagate + coarse-filter',
  refine: 'Refine + score risk',
};

/** A human sentence built only from fields the message for that phase
 *  actually carries — see `WorkerProgress` in `screening.worker.ts`. */
function describe(msg: WorkerProgress | undefined, phase: RunPhase): string {
  if (!msg) {
    return phase === 'parse'
      ? 'Waiting for the snapshot to load…'
      : phase === 'radial'
        ? 'Waiting on the radial pre-filter…'
        : phase === 'sweep'
          ? 'Waiting on the SGP4 sweep…'
          : 'Waiting on refinement…';
  }
  switch (msg.phase) {
    case 'parse':
      return `Loaded ${fmtInt(msg.objects)} objects from the committed snapshot`;
    case 'radial':
      return (
        `Radial pre-filter: ${fmtInt(msg.totalPairs)} possible pairs -> ` +
        `${fmtInt(msg.afterRadialFilter)} pairs whose orbits can actually overlap`
      );
    case 'sweep':
      return (
        `Propagating ${fmtInt(msg.afterRadialFilter)} pairs via SGP4 — ` +
        `step ${fmtInt(msg.step)}/${fmtInt(msg.steps)}, ` +
        `${fmtInt(msg.propagations)} states computed, coarse-filtering each step`
      );
    case 'refine':
      return (
        `Refining ${fmtInt(msg.candidates)} candidates to exact time of closest ` +
        `approach and scoring risk — ${fmtInt(msg.index)}/${fmtInt(msg.candidates)}` +
        (msg.events > 0 ? `, ${fmtInt(msg.events)} confirmed so far` : '')
      );
  }
}

function phaseFraction(msg: WorkerProgress | undefined): number {
  return msg ? msg.fraction : 0;
}

export function BootSequence({
  phase,
  phaseLog,
}: {
  phase: RunPhase | null;
  phaseLog: PhaseLog;
}) {
  if (!phase) return null;

  const activeIndex = RUN_PHASES.indexOf(phase);
  // Overall completion: whole phases already behind us, plus how far into the
  // current one we are — not a single smoothed number pretending to know the
  // relative cost of a geometry pass vs. a million SGP4 calls in advance.
  const overall =
    (activeIndex + phaseFraction(phaseLog[phase])) / RUN_PHASES.length;

  return (
    <div className="rise px-5 pt-4" role="status" aria-live="polite">
      <div className="glass lift flex flex-col gap-3 rounded-md border border-hairline bg-panel px-4 py-[14px]">
        <div className="flex items-center justify-between gap-3">
          <div className="font-mono text-2xs uppercase tracking-label text-tertiary">
            Live screening run — real progress from the worker in flight
          </div>
          <div className="num text-xs- text-secondary">{Math.round(overall * 100)}%</div>
        </div>

        {/* Overall bar. Width is a JS-driven transition, so it uses the shared
            motion vocabulary rather than a hand-picked duration. */}
        <div className="h-[3px] w-full overflow-hidden rounded-full bg-panel-high">
          <div
            className="h-full rounded-full bg-accent"
            style={{
              width: `${Math.max(2, overall * 100)}%`,
              transition: `width ${DURATION.medium}s ${EASE.emphasized}`,
            }}
          />
        </div>

        <ol className="flex flex-col gap-[9px]">
          {RUN_PHASES.map((p, i) => {
            const msg = phaseLog[p];
            const done = i < activeIndex;
            const active = p === phase;
            const pending = i > activeIndex;
            const frac = active ? phaseFraction(msg) : done ? 1 : 0;
            return (
              <li key={p} className="flex items-start gap-[10px]">
                <span
                  aria-hidden="true"
                  className={`mt-[3px] flex h-[14px] w-[14px] flex-none items-center justify-center rounded-full border text-[9px] ${
                    active
                      ? 'border-accent-border bg-accent-wash text-accent'
                      : pending
                        ? 'border-hairline text-tertiary'
                        : 'border-accent-border bg-accent text-[color:var(--accent-ink)]'
                  }`}
                  style={{ transition: `background-color ${DURATION.micro}s ${EASE.out}, color ${DURATION.micro}s ${EASE.out}` }}
                >
                  {active ? i + 1 : pending ? i + 1 : '✓'}
                </span>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xs- ${active ? 'text-primary' : pending ? 'text-tertiary' : 'text-secondary'}`}
                  >
                    {LABEL[p]}
                  </div>
                  <div className="num mt-[2px] truncate text-xs- text-tertiary" title={describe(msg, p)}>
                    {pending ? 'Not started' : describe(msg, p)}
                  </div>
                  {active && (
                    <div className="mt-[6px] h-[2px] w-full overflow-hidden rounded-full bg-panel-high">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{
                          width: `${Math.max(2, frac * 100)}%`,
                          transition: `width ${DURATION.medium}s ${EASE.emphasized}`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
