import { useNow } from '../hooks/useNow';
import { fmtDur, fmtUTC } from '../data/format';

/**
 * A number that changes every second, and nothing else.
 *
 * The dashboard called useNow() at the top of the route, so the console clock
 * re-rendered the entire screen once a second — table, regime plot, cascade
 * panel, metric tiles — to move a few digits in two places. The memoised work
 * (`screened`, `rows`) correctly did not depend on the clock, so nothing was
 * recomputed; the cost was React reconciling the whole tree, sixty times a
 * minute, forever, on the screen a judge leaves open while asking questions.
 *
 * These components exist so the tick reaches only the text it changes. Each
 * subscribes to the shared clock in hooks/useNow — one timer for the app, not
 * one per instance, which matters because the dashboard renders a countdown on
 * every screened event.
 */

/** Time remaining until `at`, on the console clock. */
export function Countdown({
  at,
  prefix = '',
  className = '',
}: {
  at: number;
  prefix?: string;
  className?: string;
}) {
  const now = useNow();
  return (
    <span className={className}>
      {prefix}
      {fmtDur(at - now)}
    </span>
  );
}

/**
 * A countdown that becomes a fixed word once its instant has passed — the
 * manoeuvre log's "T− 4h 12m" turning into "complete".
 */
export function CountdownOrLabel({
  at,
  past,
  prefix = '',
  className = '',
}: {
  at: number;
  past: string;
  prefix?: string;
  className?: string;
}) {
  const now = useNow();
  return <span className={className}>{at > now ? `${prefix}${fmtDur(at - now)}` : past}</span>;
}

/** The console clock itself, in the top bar. */
export function ClockUTC({ className = '' }: { className?: string }) {
  const now = useNow();
  return <span className={className}>{fmtUTC(new Date(now))}</span>;
}
