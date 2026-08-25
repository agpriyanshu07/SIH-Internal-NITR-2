import { Link } from 'react-router-dom';
import { RESOLVED, reband } from '../data/conjunctions';
import { fmtPc } from '../data/format';
import { DEFAULT_THRESHOLDS, passesThresholds, useThresholds } from '../state/thresholds';
import { Button, Panel, SeverityChip } from '../components/primitives';
import { FEATURES, STATUS_LABEL } from '../data/features';
import type { Severity } from '../data/types';
import { sliderFill } from '../lib/slider';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/**
 * Screening thresholds.
 *
 * This screen is wired, not decorative: every control writes to the shared
 * threshold state, which the dashboard and manoeuvre log read. The live
 * "admitted" readout below makes that dependency visible while you drag.
 */

const SEVERITIES: (Severity | 'ALL')[] = ['ALL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

/**
 * The Configuration capabilities that do not exist, read from the registry
 * rather than listed here — if one is ever built, its entry changes status and
 * it leaves this panel on its own.
 */
const NOT_BUILT_CONFIG = FEATURES.filter(
  (f) => f.group === 'Configuration' && f.status === 'not-built',
);

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

export function Thresholds() {
  useDocumentTitle('Screening thresholds');
  const { thresholds, set, reset, modified } = useThresholds();

  // Sigma is applied before the floor, so the counts below reflect the same
  // severities the dashboard will show.
  const rebanded = RESOLVED.map((e) => reband(e, thresholds.sigmaScale));
  const admitted = rebanded.filter((e) => passesThresholds(e, thresholds));

  /* What scaling sigma does to the banding, independent of the floor. */
  const bandsAt = (scale: number) =>
    RESOLVED.map((e) => reband(e, scale)).reduce(
      (acc, e) => ({ ...acc, [e.sev]: (acc[e.sev] ?? 0) + 1 }),
      {} as Record<Severity, number>,
    );
  const baseline = bandsAt(1);
  const current = bandsAt(thresholds.sigmaScale);
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
              style={sliderFill(thresholds.maxMissKm, 0.5, 25)}
              className="k-slider"
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
              style={sliderFill(pcIndex, 0, PC_STOPS.length - 1)}
              className="k-slider"
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
              style={sliderFill(thresholds.horizonHours, 6, 72)}
              className="k-slider"
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
              style={sliderFill(thresholds.maxElementAgeDays, 1, 10)}
              className="k-slider"
            />
          </Row>
        </div>
      </Panel>

      <Panel title="Uncertainty model">
        <div className="px-5 pb-5 pt-1">
          <p className="max-w-[720px] pt-4 text-base leading-[1.65] text-secondary [text-wrap:pretty]">
            Miss distance and relative velocity on this console are{' '}
            <span className="text-primary">measured</span> — propagated from real
            element sets. Probability of collision is not, quite: turning a miss
            distance into a probability needs a positional covariance, and a
            two-line element set does not carry one. The console assumes a
            1-sigma that grows with element-set age and with how poorly each
            object's size class is tracked. That assumption is the softest number
            on the screen, so it is adjustable rather than hidden.
          </p>

          <Row
            label="1-sigma scale"
            hint="Multiplies the assumed positional uncertainty. Larger sigma spreads the miss distribution, which lowers Pc for close passes and re-bands severity live."
            value={`${thresholds.sigmaScale.toFixed(2)}×`}
          >
            <input
              type="range"
              min={0.25}
              max={4}
              step={0.05}
              value={thresholds.sigmaScale}
              onChange={(e) => set('sigmaScale', +e.target.value)}
              aria-label="Positional uncertainty scale"
              style={sliderFill(thresholds.sigmaScale, 0.25, 4)}
              className="k-slider"
            />
          </Row>

          <div className="grid gap-4 border-t border-hairline-soft py-5 md:grid-cols-[240px_1fr]">
            <div>
              <div className="text-md font-medium text-primary">Severity under this assumption</div>
              <div className="mt-1 max-w-[300px] text-sm leading-[1.55] text-secondary [text-wrap:pretty]">
                Every event re-banded at this sigma, against the console's own
                estimate. The floor above is not applied here.
              </div>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-3">
              {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NOMINAL'] as Severity[]).map((sv) => {
                const now = current[sv] ?? 0;
                const was = baseline[sv] ?? 0;
                const delta = now - was;
                return (
                  <div key={sv} className="flex items-center gap-2">
                    <SeverityChip sev={sv} bordered />
                    <span className="num text-sm text-primary">{now}</span>
                    {delta !== 0 && (
                      <span
                        className={`num text-2xs ${delta > 0 ? 'text-risk-high' : 'text-risk-low'}`}
                      >
                        {delta > 0 ? '+' : ''}
                        {delta}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Panel>

      <Panel
        title="Effect of these thresholds"
        aside={
          <span className="num text-2xs text-tertiary">
            {admitted.length} / {rebanded.length}
          </span>
        }
      >
        <div className="flex flex-col gap-5 p-5">
          <div className="flex items-baseline gap-3">
            <span className="num text-3xl text-accent">{admitted.length}</span>
            <span className="text-md text-secondary">
              of {rebanded.length} screened events reach the console
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

      {/*
        The rest of Configuration.

        Alert routing and API keys are the two capabilities this screen's own
        nav group offers and this prototype does not have. Their reasons lived
        only in a sidebar tooltip and on the status page — nowhere a person
        configuring thresholds would meet them. Stating them here, from the same
        registry entry that marks them not-built, means the explanation cannot
        drift from the claim.

        Deliberately not a disabled form. A form that cannot submit is a worse
        answer than a sentence saying why there is nothing to submit to.
      */}
      {NOT_BUILT_CONFIG.length > 0 && (
        <Panel title="Not built in this prototype">
          <div className="flex flex-col gap-4 p-5">
            {NOT_BUILT_CONFIG.map((f) => (
              <div key={f.id} className="flex flex-col gap-[5px]">
                <div className="flex items-center gap-[9px]">
                  <span className="text-md text-primary">{f.label}</span>
                  <span className="flex-none rounded-sm border border-hairline px-[6px] py-px font-mono text-2xs uppercase tracking-[0.08em] text-tertiary">
                    {STATUS_LABEL[f.status]}
                  </span>
                </div>
                <p className="max-w-[68ch] text-sm leading-[1.6] text-secondary [text-wrap:pretty]">
                  {f.note}
                </p>
              </div>
            ))}
            <p className="max-w-[68ch] border-t border-hairline-soft pt-4 text-xs- leading-[1.55] text-tertiary [text-wrap:pretty]">
              Both are absent on purpose rather than pending. A console with no
              backend cannot deliver an alert or authenticate a token, and a form
              that pretended otherwise would be the one dishonest thing on a screen
              whose entire job is to state what the numbers rest on.
            </p>
          </div>
        </Panel>
      )}

      <p className="font-mono text-2xs uppercase tracking-[0.08em] text-tertiary">
        Defaults · severity {DEFAULT_THRESHOLDS.minSeverity} · miss ≤{' '}
        {DEFAULT_THRESHOLDS.maxMissKm} km · Pc ≥ {pcLabel(DEFAULT_THRESHOLDS.minPc).toLowerCase()} · horizon{' '}
        {DEFAULT_THRESHOLDS.horizonHours} h · element age ≤ {DEFAULT_THRESHOLDS.maxElementAgeDays} d
      </p>
    </div>
  );
}
