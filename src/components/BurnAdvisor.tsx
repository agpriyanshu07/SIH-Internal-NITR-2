import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  evaluateBurn,
  evaluateBurnPropagated,
  leadTimeSeconds,
  minimumDeltaV,
  minimumDeltaVPropagated,
} from '../data/advisor';
import { entryById } from '../data/objects';
import { fmtPc } from '../data/format';
import { fmtDur } from '../data/format';
import { useNow } from '../hooks/useNow';
import { useThresholds } from '../state/thresholds';
import type { ResolvedConjunction } from '../data/types';
import { Panel, SeverityChip } from './primitives';
import { sliderFill } from '../lib/slider';

/**
 * Plan a burn against a real screened event.
 *
 * Everything this panel improves on is measured: the miss distance came out of
 * the propagator, the lead time out of the console clock. What it adds is a
 * first-order estimate, and it is careful to present that as a range rather
 * than a single number — see data/advisor.ts for why the pessimistic end is
 * "no improvement at all".
 */

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
  /*
   * The real answer: the delta-v applied to the asset's state vector and
   * re-propagated, giving one post-burn miss distance rather than a range.
   * evaluateBurn's closed form is kept alongside it as a cross-check — showing
   * both is more honest than showing whichever is more flattering.
   */
  const propagated = useMemo(() => {
    if (!event || lead <= 0) return null;
    const A = entryById(event.a);
    const B = entryById(event.b);
    if (!A || !B) return null;
    return evaluateBurnPropagated(
      event,
      A,
      B,
      { deltaVmmS: deltaV, leadSeconds: lead },
      thresholds.sigmaScale,
    );
  }, [event, deltaV, lead, thresholds.sigmaScale]);

  const toClear = useMemo(() => {
    if (!event) return null;
    const A = entryById(event.a);
    const B = entryById(event.b);
    if (A && B) {
      return minimumDeltaVPropagated(event, A, B, lead, 'LOW', thresholds.sigmaScale);
    }
    return minimumDeltaV(event, lead, 'LOW', thresholds.sigmaScale);
  }, [event, lead, thresholds.sigmaScale]);

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
      aside={
        <span className="num text-2xs text-tertiary">PLANNING AID — NOT A COMMAND</span>
      }
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
            style={sliderFill(deltaV, 0, 50)}
              className="k-slider"
          />
          <div className="num text-xs- text-tertiary">
            Δs ≈ 3 · Δv · t = {outcome.displacementKm.toFixed(3)} km of along-track
            displacement by TCA
          </div>
        </div>

        {propagated ? (
          <div className="flex flex-col gap-3 border-t border-hairline-soft pt-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="label">Post-burn miss distance</span>
              <span className="num text-2xs text-tertiary">RE-PROPAGATED</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-[9px]">
                <SeverityChip sev={propagated.sev} />
                <span className="text-sm text-secondary">
                  from {event.miss.toFixed(3)} km
                </span>
              </div>
              <div className="num flex-none text-xl text-primary">
                {propagated.missKm.toFixed(3)}
                <span className="ml-1 text-xs- text-tertiary">km</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-[14px] gap-y-3">
              <div>
                <div className="label mb-1">Collision probability</div>
                <div className="num text-md text-primary">
                  {fmtPc(propagated.pc)}
                </div>
              </div>
              <div>
                <div className="label mb-1">TCA moves by</div>
                <div className="num text-md text-primary">
                  {propagated.tcaShiftSeconds >= 0 ? '+' : ''}
                  {propagated.tcaShiftSeconds.toFixed(1)}
                  <span className="ml-1 text-xs- text-tertiary">s</span>
                </div>
              </div>
            </div>

            <p className="text-xs- leading-[1.55] text-tertiary [text-wrap:pretty]">
              The delta-v is applied to the asset&rsquo;s state vector and both the
              burned and unburned states are propagated, so this is a real
              displacement in three dimensions rather than a scalar — there is one
              answer, not a range. The burn also moves the time of closest approach,
              so it is searched for again rather than assumed unchanged.
            </p>

            {/* Keeping the approximation visible is the point: it shows what the
                cheaper model costs, in the direction it errs. */}
            <div className="flex items-baseline justify-between gap-3 border-t border-hairline-soft pt-3">
              <span className="text-xs- text-tertiary">
                Closed form Δs ≈ 3·Δv·t predicted
              </span>
              <span className="num flex-none text-xs- text-tertiary">
                {propagated.closedFormDisplacementKm.toFixed(3)} km vs{' '}
                <span className="text-secondary">
                  {propagated.displacementKm.toFixed(3)} km
                </span>
              </span>
            </div>
          </div>
        ) : (
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
            <p className="text-xs- leading-[1.55] text-tertiary [text-wrap:pretty]">
              Closed-form estimate only — the element sets for this pair are not
              available to re-propagate, so this is a bound rather than an answer.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-hairline-soft pt-4">
          <div className="label">To clear the LOW band</div>
          <div className="text-base leading-[1.6] text-secondary [text-wrap:pretty]">
            {toClear === null ? (
              <>
                No burn under 200 mm/s gets there with{' '}
                <span className="num text-primary">{fmtDur(lead * 1000)}</span> of lead
                time. Earlier is the only lever left — displacement grows with both Δv
                and warning time, and warning time is free.
              </>
            ) : (
              <>
                <span className="num text-primary">{toClear.toFixed(1)} mm/s</span>{' '}
                along-track, applied now. Found by re-propagating the burned state, so
                it accounts for the actual encounter geometry rather than assuming the
                displacement lands where it helps most.
              </>
            )}
          </div>
        </div>

        <p className="border-t border-hairline-soft pt-4 text-sm leading-[1.6] text-tertiary [text-wrap:pretty]">
          The post-burn state is propagated against this pair only. It is not a
          re-screen: nothing here checks whether the manoeuvre puts the asset into a
          new conjunction with a third object, which is the failure mode that makes
          collision avoidance hard. Run{' '}
          <Link to="/console" className="text-secondary underline underline-offset-2 hover:text-primary">
            screening
          </Link>{' '}
          against the modified orbit before acting on any of it.
        </p>
      </div>
    </Panel>
  );
}
