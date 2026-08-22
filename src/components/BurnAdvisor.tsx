import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { evaluateBurn, leadTimeSeconds, minimumDeltaV } from '../data/advisor';
import { fmtDur, fmtPc } from '../data/format';
import { useNow } from '../hooks/useNow';
import { useThresholds } from '../state/thresholds';
import type { ResolvedConjunction } from '../data/types';
import { Panel, SeverityChip } from './primitives';

/**
 * Plan a burn against a real screened event.
 *
 * Everything this panel improves on is measured: the miss distance came out of
 * the propagator, the lead time out of the console clock. What it adds is a
 * first-order estimate, and it is careful to present that as a range rather
 * than a single number — see data/advisor.ts for why the pessimistic end is
 * "no improvement at all".
 */

const slider =
  'h-[3px] w-full cursor-pointer appearance-none rounded-sm bg-panel-high accent-[color:var(--accent)]';

export function BurnAdvisor({ events }: { events: ResolvedConjunction[] }) {
  const now = useNow(5000);
  const { thresholds } = useThresholds();
  const [eventId, setEventId] = useState<string>('');
  const [deltaV, setDeltaV] = useState(5);

  // Default to the most urgent event still ahead of the console clock.
  const candidates = useMemo(
    () =>
      [...events]
        .filter((e) => e.tca > now)
        .sort((a, b) => b.score - a.score)
        .slice(0, 12),
    [events, now],
  );
  const event = candidates.find((e) => e.id === eventId) ?? candidates[0];

  const lead = event ? leadTimeSeconds(event, now) : 0;
  const outcome = useMemo(
    () =>
      event
        ? evaluateBurn(event, { deltaVmmS: deltaV, leadSeconds: lead }, thresholds.sigmaScale)
        : null,
    [event, deltaV, lead, thresholds.sigmaScale],
  );
  const toClear = useMemo(
    () => (event ? minimumDeltaV(event, lead, 'LOW', thresholds.sigmaScale) : null),
    [event, lead, thresholds.sigmaScale],
  );

  if (!event || !outcome) {
    return (
      <Panel title="Burn advisor">
        <div className="p-5 text-base text-secondary">
          No screened event lies ahead of the console clock, so there is nothing
          to plan against.
        </div>
      </Panel>
    );
  }

  return (
    <Panel
      title="Burn advisor"
      aside={<span className="num text-2xs text-tertiary">PLANNING AID — NOT A COMMAND</span>}
    >
      <div className="flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="advisor-event" className="label">
            Against event
          </label>
          <select
            id="advisor-event"
            value={event.id}
            onChange={(e) => setEventId(e.target.value)}
            className="w-full rounded border border-hairline bg-panel-raised px-3 py-2 font-mono text-sm text-primary outline-none focus-visible:border-[color:var(--accent)]"
          >
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.sev} · {c.miss.toFixed(3)} km · {c.A.name} × {c.B.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-x-[14px] gap-y-3">
          <div>
            <div className="label mb-1">Measured miss distance</div>
            <div className="num text-md text-primary">
              {event.miss.toFixed(3)} <span className="text-xs- text-tertiary">km</span>
            </div>
          </div>
          <div>
            <div className="label mb-1">Lead time to TCA</div>
            <div className="num text-md text-accent">{fmtDur(lead * 1000)}</div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-hairline-soft pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="advisor-dv" className="label">
              Along-track delta-v
            </label>
            <span className="num text-md text-primary">
              {deltaV.toFixed(1)} <span className="text-xs- text-tertiary">mm/s</span>
            </span>
          </div>
          <input
            id="advisor-dv"
            type="range"
            min={0}
            max={50}
            step={0.5}
            value={deltaV}
            onChange={(e) => setDeltaV(+e.target.value)}
            className={slider}
          />
          <div className="num text-xs- text-tertiary">
            Δs ≈ 3 · Δv · t = {outcome.displacementKm.toFixed(3)} km of along-track
            displacement by TCA
          </div>
        </div>

        {/* The range, not a single number. */}
        <div className="flex flex-col gap-3 border-t border-hairline-soft pt-4">
          <div className="label">Resulting miss distance</div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-[9px]">
              <SeverityChip sev={outcome.bestSev} />
              <span className="text-sm text-secondary">
                displacement across the miss vector
              </span>
            </div>
            <div className="num flex-none text-md text-primary">
              {outcome.bestMissKm.toFixed(3)}
              <span className="ml-1 text-xs- text-tertiary">km</span>
            </div>
          </div>
          <div className="num pl-[17px] text-xs- text-tertiary">
            Pc {fmtPc(outcome.bestPc)}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-[9px]">
              <SeverityChip sev={outcome.worstSev} />
              <span className="text-sm text-secondary">
                displacement along the relative velocity
              </span>
            </div>
            <div className="num flex-none text-md text-primary">
              {outcome.worstMissKm.toFixed(3)}
              <span className="ml-1 text-xs- text-tertiary">km</span>
            </div>
          </div>
          <div className="num pl-[17px] text-xs- text-tertiary">
            Pc {fmtPc(outcome.worstPc)} — unchanged; the pass moves in time, not distance
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-hairline-soft pt-4">
          <div className="label">To clear the LOW band</div>
          <div className="text-base leading-[1.6] text-secondary [text-wrap:pretty]">
            {toClear === null ? (
              <>
                No burn under 200 mm/s gets there with{' '}
                <span className="num text-primary">{fmtDur(lead * 1000)}</span> of lead
                time. Earlier is the only lever left — Δs is linear in both Δv and
                warning time, and warning time is free.
              </>
            ) : (
              <>
                At least <span className="num text-primary">{toClear.toFixed(1)} mm/s</span>,
                and only if the displacement falls across the miss vector. Treat it as a
                floor on what a burn would need, never as a sufficient figure.
              </>
            )}
          </div>
        </div>

        <p className="border-t border-hairline-soft pt-4 text-sm leading-[1.6] text-tertiary [text-wrap:pretty]">
          First-order secular estimate. Nothing here is re-propagated: there is no
          post-burn state vector, and so no check that this manoeuvre does not simply
          create a new conjunction with a third object. Re-run{' '}
          <Link to="/console" className="text-secondary underline underline-offset-2 hover:text-primary">
            screening
          </Link>{' '}
          against a modified orbit before acting on any of it.
        </p>
      </div>
    </Panel>
  );
}
