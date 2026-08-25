import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RESOLVED, reband } from '../data/conjunctions';
import { isIndianAsset } from '../data/objects';
import { SEVERITY_RANK } from '../data/riskScore';
import { fmtInt } from '../data/format';
import { useThresholds } from '../state/thresholds';
import { useAlertRules, type AlertRule } from '../state/alertRules';
import { Button, EmptyState, Panel, Segmented, SeverityChip } from '../components/primitives';
import { Countdown } from '../components/Countdown';
import { sliderFill } from '../lib/slider';
import type { ResolvedConjunction, Severity } from '../data/types';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/**
 * Standing rules, and what they currently match.
 *
 * The half of "alert routing" that can be built without lying. Matching is
 * arithmetic over the committed run and happens in this browser; delivery needs
 * a server this project does not have, and the page says so at the top rather
 * than in a footnote.
 */

const SEVERITIES: { label: string; value: Severity }[] = [
  { label: 'LOW+', value: 'LOW' },
  { label: 'MED+', value: 'MEDIUM' },
  { label: 'HIGH+', value: 'HIGH' },
  { label: 'CRIT', value: 'CRITICAL' },
];

export function matchesRule(e: ResolvedConjunction, r: AlertRule): boolean {
  return (
    SEVERITY_RANK[e.sev] >= SEVERITY_RANK[r.minSeverity] &&
    e.miss <= r.maxMissKm &&
    e.tcaMin <= r.withinHours * 60 &&
    (!r.isroOnly || isIndianAsset(e.a) || isIndianAsset(e.b))
  );
}

function RuleCard({
  rule,
  matches,
  onChange,
  onRemove,
}: {
  rule: AlertRule;
  matches: ResolvedConjunction[];
  onChange: (patch: Partial<AlertRule>) => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`glass rounded-md border bg-panel transition-colors ${
        rule.enabled ? 'border-hairline' : 'border-hairline-soft opacity-60'
      }`}
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-hairline-soft px-[14px] py-[10px]">
        <input
          value={rule.name}
          onChange={(e) => onChange({ name: e.target.value })}
          aria-label="Rule name"
          className="k-control min-w-0 flex-1 px-[10px] py-[5px] text-sm+ text-primary"
        />
        <span
          className={`num flex-none rounded-sm border px-[9px] py-[3px] text-xs- ${
            matches.length
              ? 'border-accent-border bg-accent-wash text-primary'
              : 'border-hairline text-tertiary'
          }`}
        >
          {matches.length} matching
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={rule.enabled}
          onClick={() => onChange({ enabled: !rule.enabled })}
          className="group flex flex-none items-center gap-2 rounded px-2 py-1 transition-colors hover:bg-panel-raised"
        >
          <span className="font-mono text-2xs uppercase tracking-label text-tertiary transition-colors group-hover:text-primary">
            {rule.enabled ? 'On' : 'Off'}
          </span>
          <span
            className={`relative h-[14px] w-[26px] rounded-sm border transition-colors ${
              rule.enabled ? 'border-accent-border bg-panel' : 'border-hairline bg-panel'
            }`}
          >
            <span
              className={`absolute top-[2px] h-2 w-2 rounded-xs transition-all ${
                rule.enabled ? 'right-[2px] bg-accent' : 'left-[2px] bg-[color:var(--t3)]'
              }`}
            />
          </span>
        </button>
        <Button className="flex-none px-[10px] py-1 text-sm text-secondary" onClick={onRemove}>
          Remove
        </Button>
      </div>

      <div className="grid gap-x-6 gap-y-4 px-[14px] py-[13px] md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <span className="label">Minimum severity</span>
          <Segmented
            segments={SEVERITIES}
            value={rule.minSeverity}
            onChange={(v) => onChange({ minSeverity: v })}
            hint="A floor: this severity and everything worse."
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="label">Scope</span>
          <button
            type="button"
            aria-pressed={rule.isroOnly}
            onClick={() => onChange({ isroOnly: !rule.isroOnly })}
            className={`self-start rounded border px-[11px] py-[5px] font-mono text-2xs uppercase tracking-data transition-colors ${
              rule.isroOnly
                ? 'border-accent-border bg-accent-wash text-primary hover:border-accent'
                : 'border-hairline text-tertiary hover:bg-panel-raised hover:text-primary'
            }`}
          >
            {rule.isroOnly ? 'ISRO assets only' : 'Whole catalogue'}
          </button>
        </div>

        <div className="flex flex-col gap-[7px]">
          <div className="flex items-baseline justify-between gap-3">
            <span className="label">Miss distance at most</span>
            <span className="num text-sm text-primary">{rule.maxMissKm.toFixed(1)} km</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={25}
            step={0.5}
            value={rule.maxMissKm}
            onChange={(e) => onChange({ maxMissKm: +e.target.value })}
            aria-label="Maximum miss distance"
            className="k-slider"
            style={sliderFill(rule.maxMissKm, 0.5, 25)}
          />
        </div>

        <div className="flex flex-col gap-[7px]">
          <div className="flex items-baseline justify-between gap-3">
            <span className="label">Within</span>
            <span className="num text-sm text-primary">{rule.withinHours} h</span>
          </div>
          <input
            type="range"
            min={6}
            max={72}
            step={6}
            value={rule.withinHours}
            onChange={(e) => onChange({ withinHours: +e.target.value })}
            aria-label="Lead time window in hours"
            className="k-slider"
            style={sliderFill(rule.withinHours, 6, 72)}
          />
        </div>
      </div>

      {rule.enabled && matches.length > 0 && (
        <div className="border-t border-hairline-soft">
          {matches.slice(0, 5).map((e) => (
            <Link
              key={e.id}
              to={`/console/conjunction/${e.id}`}
              className="grid grid-cols-[92px_minmax(0,1fr)_84px_78px] items-center gap-3 border-b border-hairline-soft px-[14px] py-[7px] text-left transition-colors last:border-b-0 hover:bg-panel-raised"
            >
              <SeverityChip sev={e.sev} />
              <span className="truncate text-sm text-primary">
                {e.A.name} <span className="text-tertiary">×</span> {e.B.name}
              </span>
              <span className="num text-right text-sm text-secondary">{e.miss.toFixed(3)} km</span>
              <Countdown at={e.tca} prefix="T− " className="num text-right text-xs- text-tertiary" />
            </Link>
          ))}
          {matches.length > 5 && (
            <div className="num px-[14px] py-[7px] text-xs- text-tertiary">
              and {fmtInt(matches.length - 5)} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Alerts() {
  useDocumentTitle('Alert routing');
  const { thresholds } = useThresholds();
  const { rules, update, add, remove, reset } = useAlertRules();

  /* Rebanded under the operator's own covariance assumption, like every other
     screen — a rule written against HIGH should mean HIGH as this console
     currently defines it, not as it was defined at build time. */
  const events = useMemo(
    () => RESOLVED.map((e) => reband(e, thresholds.sigmaScale)),
    [thresholds.sigmaScale],
  );

  const matchesByRule = useMemo(
    () =>
      new Map(
        rules.map((r) => [
          r.id,
          r.enabled ? events.filter((e) => matchesRule(e, r)).sort((a, b) => a.tca - b.tca) : [],
        ]),
      ),
    [rules, events],
  );

  const firing = rules.filter((r) => r.enabled && (matchesByRule.get(r.id)?.length ?? 0) > 0);
  const totalMatched = new Set(
    rules.flatMap((r) => (matchesByRule.get(r.id) ?? []).map((e) => e.id)),
  ).size;

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className="flex flex-col gap-5 px-6 py-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-primary">Alert rules</h1>
            <p className="mt-1 max-w-[70ch] text-md leading-[1.6] text-secondary [text-wrap:pretty]">
              Standing rules, matched against the current screening run.{' '}
              <span className="text-primary">
                Matching is real and happens in this browser; delivery is not built.
              </span>{' '}
              There is no server here to send an email or call a webhook from, so a rule
              tells you what it caught — it does not tell anyone else.
            </p>
          </div>
          <div className="flex flex-none items-center gap-2">
            <Button className="px-[13px] py-[7px] text-sm text-secondary" onClick={reset}>
              Reset
            </Button>
            <Button variant="primary" className="px-[13px] py-[7px] text-sm" onClick={add}>
              New rule
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-hairline-soft py-[10px] font-mono text-2xs uppercase tracking-[0.08em] text-secondary">
          <span>
            {rules.filter((r) => r.enabled).length} of {rules.length} rules armed
          </span>
          <span className="text-tertiary">·</span>
          <span>{firing.length} currently matching something</span>
          <span className="text-tertiary">·</span>
          <span>{fmtInt(totalMatched)} distinct events caught</span>
          <span className="text-tertiary">·</span>
          <span>Rules saved in this browser only</span>
        </div>

        {rules.length === 0 ? (
          <Panel>
            <EmptyState
              title="No rules"
              body="A rule picks events out of the screening run by severity, miss distance, lead time and whether an ISRO asset is involved."
              action={
                <Button className="mt-2 px-[13px] py-[7px] text-sm text-secondary" onClick={reset}>
                  Restore the defaults
                </Button>
              }
            />
          </Panel>
        ) : (
          <div className="flex flex-col gap-4">
            {rules.map((r) => (
              <RuleCard
                key={r.id}
                rule={r}
                matches={matchesByRule.get(r.id) ?? []}
                onChange={(patch) => update(r.id, patch)}
                onRemove={() => remove(r.id)}
              />
            ))}
          </div>
        )}

        <p className="max-w-[76ch] border-t border-hairline-soft pt-4 text-base leading-[1.7] text-tertiary [text-wrap:pretty]">
          What a rule does <span className="text-secondary">not</span> do: reach anybody. Email and
          webhook delivery would need a backend, and this console has none by design — the whole
          screening run is bundled and no network request is made at any point. The
          matching above is the part that can be honest, so it is the part that exists.{' '}
          <Link to="/console/status" className="text-accent underline-offset-2 hover:underline">
            Per-feature status
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
