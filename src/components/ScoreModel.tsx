import { SCORE_MODEL, scoreTerms } from '../data/riskScore';
import type { ResolvedConjunction } from '../data/types';
import { Panel } from './primitives';

/**
 * How this event's risk score was arrived at.
 *
 * A ranking an operator cannot explain is a ranking they cannot defend. The
 * weights and each term's contribution come from riskScore.ts itself, so what
 * is printed here cannot drift from what produced the number in the table.
 *
 * The band row matters more than the weights: severity picks the interval and
 * the three terms only order events inside it, which is why sorting by score
 * can never contradict the severity chip.
 */
export function ScoreModel({ event }: { event: ResolvedConjunction }) {
  const t = scoreTerms({
    pc: event.pc,
    miss: event.miss,
    relv: event.relv,
    maxAge: event.maxAge,
  });
  const [lo, hi] = t.band;
  const span = hi - lo;

  const rows = SCORE_MODEL.weights.map((w) => {
    const value = t[w.key as 'pc' | 'relv' | 'age'];
    return { ...w, value, points: w.weight * value * span };
  });

  return (
    <Panel
      title="How this score was reached"
      aside={
        <span className="num text-2xs text-tertiary">
          {event.score} / 100
        </span>
      }
      bodyClassName="flex flex-col gap-[13px] p-[14px]"
    >
      <div
        data-sev={event.sev}
        className="flex items-baseline justify-between gap-3 border-b border-hairline-soft pb-3"
      >
        <span className="text-sm text-secondary">
          Severity band sets the range
        </span>
        <span className="num flex-none text-md text-sev">
          {lo}&ndash;{hi}
        </span>
      </div>

      {rows.map((r) => (
        <div key={r.key} className="flex flex-col gap-[6px]">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-primary">{r.label}</span>
            <span className="num flex-none text-xs- text-tertiary">
              {(r.weight * 100).toFixed(0)}% weight · +{r.points.toFixed(1)}
            </span>
          </div>
          {/* Filled portion is this term's actual contribution, not its cap. */}
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-panel-raised">
            <div
              className="h-full rounded-full bg-[color:var(--t2)]"
              style={{ width: `${(r.value * 100).toFixed(1)}%` }}
            />
          </div>
          <p className="text-xs- leading-[1.5] text-tertiary [text-wrap:pretty]">
            {r.note}
          </p>
        </div>
      ))}

      <p className="border-t border-hairline-soft pt-3 text-xs- leading-[1.55] text-tertiary [text-wrap:pretty]">
        The three terms only order events <em className="not-italic text-secondary">within</em>{' '}
        a band, so sorting the table by score can never disagree with the severity
        chip beside it. Miss distance is deliberately absent: Pc already folds in
        both the miss and the sigma it must be judged against.
      </p>
    </Panel>
  );
}
