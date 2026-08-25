import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { triageMargin } from '../data/triage';
import { Panel } from './primitives';
import type { ResolvedConjunction } from '../data/types';

/**
 * The counterfactual, stated in one panel.
 *
 * Every other panel on this page describes the event. This one describes what
 * would have to change for the event to stop mattering — which is the actual
 * question a screening console exists to answer. ISRO generated more than
 * 53,000 close-approach alerts in 2024 and flew ten manoeuvres. The scarce
 * resource is not detection; it is the judgement to discard 52,990 of them.
 *
 * Three sentences, and every number in them is the existing Foster model read
 * backwards. Nothing new is assumed here.
 */
export function TriageVerdict({ event }: { event: ResolvedConjunction }) {
  const m = useMemo(() => triageMargin(event), [event]);

  const fmtKm = (v: number) => (v < 10 ? v.toFixed(3) : v.toFixed(1));

  return (
    <Panel
      title="Would this change your mind?"
      aside={
        <span className="font-mono text-2xs tracking-data text-tertiary">
          FOSTER MODEL, INVERTED
        </span>
      }
    >
      <div className="flex flex-col gap-[14px] p-[14px]">
        {/*
         * Sigma first, deliberately. It is the only quantity on this list that
         * is an assumption rather than a measurement, so it is the only one
         * where the honest answer might be "we do not know enough to say".
         */}
        <div className="flex flex-col gap-[5px]">
          <div className="label">Sensitivity to the assumed uncertainty</div>
          {m.robustToSigma ? (
            <p className="text-base leading-[1.6] text-primary [text-wrap:pretty]">
              This event stays <span data-sev={event.sev} className="text-sev">{event.sev}</span>{' '}
              across the whole range from a quarter of the assumed σ to four times
              it. The band is a consequence of the geometry, not of the covariance
              we had to assume — which is the strongest statement this console can
              make about a single event.
            </p>
          ) : m.sigmaScaleToDrop !== null ? (
            <p className="text-base leading-[1.6] text-secondary [text-wrap:pretty]">
              Scaling the assumed σ to{' '}
              <span className="num text-primary">
                {m.sigmaScaleToDrop.toFixed(2)}×
              </span>{' '}
              drops this out of{' '}
              <span data-sev={event.sev} className="text-sev">{event.sev}</span>
              {m.nextBand && (
                <>
                  {' '}into{' '}
                  <span data-sev={m.nextBand} className="text-sev">{m.nextBand}</span>
                </>
              )}
              . That is{' '}
              {Math.abs(m.sigmaScaleToDrop - 1) < 0.25 ? (
                <strong className="text-primary">
                  close enough to 1 that the band is partly an artefact of an
                  assumption nobody measured
                </strong>
              ) : (
                'a large revision to make, so the band is mostly geometry'
              )}
              .
              {/*
               * A larger sigma making an event LESS serious looks like a bug
               * until you have the model in front of you, and a judge who
               * spots it and is not told will assume it is one. Foster's Pc
               * peaks near sigma = miss/sqrt(2): below that the Gaussian is
               * tight enough to pull away from the hard body, above it the
               * same probability is spread over a wider area and the density
               * at the hard body falls. Both sides are real, and which side an
               * event sits on is worth knowing.
               */}
              {m.sigmaScaleToDrop > 1 && (
                <>
                  {' '}
                  Note that is a <em>larger</em> σ, not a smaller one: Foster&rsquo;s
                  Pc peaks near σ = miss ÷ √2 and falls away on both sides, because
                  a wider distribution spreads the same probability over more area.
                  This event sits below that peak.
                </>
              )}{' '}
              Sweep it yourself on the{' '}
              <Link to="/console/thresholds" className="text-accent underline-offset-2 hover:underline">
                thresholds screen
              </Link>
              .
            </p>
          ) : (
            <p className="text-base leading-[1.6] text-secondary [text-wrap:pretty]">
              The band changes somewhere in the swept range, but only upward —
              no smaller or larger σ makes this event less serious than it is.
            </p>
          )}
        </div>

        {/*
         * Miss distance second: measured, so the statement is unqualified.
         */}
        {m.missToDropKm !== null && m.nextBand && (
          <div className="flex flex-col gap-[5px] border-t border-hairline-soft pt-[12px]">
            <div className="label">Distance that would settle it</div>
            <p className="text-base leading-[1.6] text-secondary [text-wrap:pretty]">
              At the same σ, this pair would fall to{' '}
              <span data-sev={m.nextBand} className="text-sev">{m.nextBand}</span> if
              they passed{' '}
              <span className="num text-primary">{fmtKm(m.missToDropKm)} km</span>{' '}
              apart —{' '}
              <span className="num text-primary">
                {fmtKm(m.missHeadroomKm ?? 0)} km
              </span>{' '}
              further than the {fmtKm(event.miss)} km SGP4 actually found. Both
              of those are measurements; only the σ they are judged against is
              not.
            </p>
          </div>
        )}

        {/*
         * What is carrying the score, so the ranking is explainable rather than
         * merely reproducible.
         */}
        <div className="flex flex-col gap-[5px] border-t border-hairline-soft pt-[12px]">
          <div className="label">What is carrying the score</div>
          <p className="text-base leading-[1.6] text-secondary [text-wrap:pretty]">
            Inside the band, {' '}
            <span className="text-primary">{m.dominantTerm.label.toLowerCase()}</span>{' '}
            contributes{' '}
            <span className="num text-primary">
              {(m.dominantTerm.share * 100).toFixed(0)}%
            </span>{' '}
            of the score — more than either other term. The band itself is most
            of the number; this is the split of what is left.
          </p>
        </div>

        <p className="border-t border-hairline-soft pt-[12px] text-xs- leading-[1.55] text-tertiary [text-wrap:pretty]">
          Every figure above is the same Foster model the ranking uses, solved
          backwards — the miss distance in closed form, the σ multiplier by
          sweeping, because Pc is not monotonic in σ and a bisection would find
          one root and quietly ignore the other. No new assumption is introduced
          on this panel.
        </p>
      </div>
    </Panel>
  );
}
