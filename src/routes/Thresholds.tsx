import { Link } from 'react-router-dom';
import { RESOLVED } from '../data/conjunctions';
import { fmtPc } from '../data/format';
import { DEFAULT_THRESHOLDS, passesThresholds, useThresholds } from '../state/thresholds';
import { Button, Panel, SeverityChip } from '../components/primitives';
import type { Severity } from '../data/types';

/**
 * Screening thresholds.
 *
 * This screen is wired, not decorative: every control writes to the shared
 * threshold state, which the dashboard and manoeuvre log read. The live
 * "admitted" readout below makes that dependency visible while you drag.
 */

const SEVERITIES: (Severity | 'ALL')[] = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

/** Pc is chosen on a log scale — the useful range spans six decades. 0 is "off". */
const PC_STOPS = [0, 1e-9, 1e-8, 1e-7, 1e-6, 1e-5, 1e-4, 1e-3];

const pcLabel = (v: number) => (v === 0 ? 'No floor' : fmtPc(v));

function Row({
  label,
  hint,
  children,
  value,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
  value: string;
}) {
  return (
    <div className="grid gap-4 border-t border-hairline-soft py-5 md:grid-cols-[240px_1fr_130px] md:items-center">
      <div>
        <div className="text-md font-medium text-primary">{label}</div>
        <div className="mt-1 max-w-[300px] text-sm leading-[1.55] text-secondary [text-wrap:pretty]">
          {hint}
        </div>
      </div>
      <div className="min-w-0">{children}</div>
      <div className="num text-md text-primary md:text-right">{value}</div>
    </div>
  );
}

const slider =
  'h-[3px] w-full cursor-pointer appearance-none rounded-sm bg-panel-high accent-[color:var(--accent)]';

export function Thresholds() {
  const { thresholds, set, reset, modified } = useThresholds();

  const admitted = RESOLVED.filter((e) => passesThresholds(e, thresholds));
  const byBand = admitted.reduce(
    (acc, e) => ({ ...acc, [e.sev]: (acc[e.sev] ?? 0) + 1 }),
    {} as Record<Severity, number>,
  );

  const pcIndex = Math.max(0, PC_STOPS.findIndex((v) => v >= thresholds.minPc));

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-[5px]">
          <h1 className="text-2xl font-medium tracking-tight text-primary">Screening thresholds</h1>
          <p className="font-mono text-xs text-tertiary">
            The floor applied before anything reaches the console · saved to this browser
          </p>
        </div>
        <div className="flex items-center gap-3">
          {modified && (
            <span className="font-mono text-2xs uppercase tracking-label text-accent">
              Modified from defaults
            </span>
          )}
          <Button onClick={reset} disabled={!modified} className="px-[13px] py-[7px] text-sm">
            Restore defaults
          </Button>
        </div>
      </div>

      <Panel title="Floor">
        <div className="px-5 pb-5 pt-1">
          <Row
            label="Minimum severity"
            hint="Bands below this are dropped before ranking. Severity is derived from probability of collision."
            value={thresholds.minSeverity}
          >
            <div className="flex flex-wrap gap-2">
              {SEVERITIES.map((s) => {
                const on = thresholds.minSeverity === s;
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set('minSeverity', s)}
                    className={`rounded border px-[11px] py-[6px] font-mono text-2xs tracking-data ${
                      on
                        ? 'border-accent-border bg-accent-wash text-primary'
                        : 'border-hairline text-tertiary hover:bg-panel-raised hover:text-primary'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </Row>

          <Row
            label="Maximum miss distance"
            hint="Approaches wider than this are not worth an operator's attention and are filtered out."
            value={`${thresholds.maxMissKm.toFixed(1)} km`}
          >
            <input
              type="range"
              min={0.5}
              max={25}
              step={0.5}
              value={thresholds.maxMissKm}
              onChange={(e) => set('maxMissKm', +e.target.value)}
              aria-label="Maximum miss distance in kilometres"
              className={slider}
            />
          </Row>

          <Row
            label="Minimum collision probability"
            hint="Below this Pc an event is treated as noise. Published action thresholds usually sit near 1×10⁻⁴."
            value={pcLabel(thresholds.minPc)}
          >
            <input
              type="range"
              min={0}
              max={PC_STOPS.length - 1}
              step={1}
              value={pcIndex}
              onChange={(e) => set('minPc', PC_STOPS[+e.target.value])}
              aria-label="Minimum probability of collision"
              className={slider}
            />
          </Row>

          <Row
            label="Screening horizon"
            hint="How far ahead to propagate. Longer horizons surface more events but with softer predictions."
            value={`${thresholds.horizonHours} h`}
          >
            <input
              type="range"
              min={6}
              max={72}
              step={6}
              value={thresholds.horizonHours}
              onChange={(e) => set('horizonHours', +e.target.value)}
              aria-label="Screening horizon in hours"
              className={slider}
            />
          </Row>

          <Row
            label="Maximum element-set age"
            hint="Pairs whose older element set exceeds this are excluded — the prediction cannot be trusted."
            value={`${thresholds.maxElementAgeDays.toFixed(1)} d`}
          >
            <input
              type="range"
              min={1}
              max={10}
              step={0.5}
              value={thresholds.maxElementAgeDays}
              onChange={(e) => set('maxElementAgeDays', +e.target.value)}
              aria-label="Maximum element set age in days"
              className={slider}
            />
          </Row>
        </div>
      </Panel>

      <Panel
        title="Effect of these thresholds"
        aside={
          <span className="num text-2xs text-tertiary">
            {admitted.length} / {RESOLVED.length}
          </span>
        }
      >
        <div className="flex flex-col gap-5 p-5">
          <div className="flex items-baseline gap-3">
            <span className="num text-3xl text-accent">{admitted.length}</span>
            <span className="text-md text-secondary">
              of {RESOLVED.length} screened events reach the console
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NOMINAL'] as Severity[]).map((s) => (
              <div key={s} className="flex items-center gap-2">
                <SeverityChip sev={s} bordered />
                <span className="num text-sm text-secondary">{byBand[s] ?? 0}</span>
              </div>
            ))}
          </div>

          {admitted.length === 0 && (
            <p className="text-base leading-[1.65] text-risk-high [text-wrap:pretty]">
              Nothing clears this floor. The dashboard will be empty until you relax something.
            </p>
          )}

          <div className="flex flex-wrap gap-2 border-t border-hairline-soft pt-4">
            <Link to="/console">
              <Button variant="primary" className="px-[14px] py-2 text-sm">
                View on the dashboard
              </Button>
            </Link>
            <Link to="/console/status">
              <Button className="px-[14px] py-2 text-sm">What else is wired up?</Button>
            </Link>
          </div>
        </div>
      </Panel>

      <p className="font-mono text-2xs uppercase tracking-[0.08em] text-tertiary">
        Defaults · severity {DEFAULT_THRESHOLDS.minSeverity} · miss ≤{' '}
        {DEFAULT_THRESHOLDS.maxMissKm} km · Pc ≥ {pcLabel(DEFAULT_THRESHOLDS.minPc).toLowerCase()} · horizon{' '}
        {DEFAULT_THRESHOLDS.horizonHours} h · element age ≤ {DEFAULT_THRESHOLDS.maxElementAgeDays} d
      </p>
    </div>
  );
}
