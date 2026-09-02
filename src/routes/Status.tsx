import { Link } from 'react-router-dom';
import { COUNTS, FEATURES, STATUS_LABEL, STATUS_SEV, type Feature } from '../data/features';
import { Panel, SeverityChip } from '../components/primitives';
import { CASCADE } from '../data/conjunctions';
import { OBJECTS, SNAPSHOT_EPOCH } from '../data/objects';
import { STEP_S } from '../data/engine/screen';
import { fmtInt, fmtUTC } from '../data/format';
import { ProvenanceFooter } from '../components/Provenance';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/**
 * Prototype status.
 *
 * A standing answer to "does this bit actually work?" — useful in a demo, and
 * it keeps the rest of the console honest, because anything inert has to be
 * declared here rather than quietly looking clickable.
 */

const GROUPS: Feature['group'][] = ['Operations', 'Configuration', 'Account', 'Actions'];

function StatusRow({ feature }: { feature: Feature }) {
  const chip = (
    <div className="flex w-[112px] flex-none items-center">
      <div data-sev={STATUS_SEV[feature.status]} className="inline-flex items-center gap-2">
        <span className="sev-swatch h-2 w-2 flex-none rounded-xs bg-sev" />
        <span className="font-mono text-xs- tracking-data text-sev">
          {STATUS_LABEL[feature.status]}
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2 border-t border-hairline-soft py-4 sm:flex-row sm:gap-4">
      {chip}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3">
          {feature.to ? (
            <Link to={feature.to} className="text-md font-medium text-primary hover:text-accent">
              {feature.label}
            </Link>
          ) : (
            <span className="text-md font-medium text-primary">{feature.label}</span>
          )}
        </div>
        <p className="mt-1 max-w-[640px] text-sm leading-[1.6] text-secondary [text-wrap:pretty]">
          {feature.note}
        </p>
      </div>
    </div>
  );
}

export function Status() {
  useDocumentTitle('Prototype status');
  return (
    <div data-presenter="status-page" className="mx-auto flex w-full max-w-[1000px] flex-col gap-6 p-6">
      <div className="flex flex-col gap-[5px]">
        <h1 className="text-2xl font-medium tracking-tight text-primary">Prototype status</h1>
        <p className="font-mono text-xs text-tertiary">
          What is wired up, what is a shell, and what does nothing at all
        </p>
      </div>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-hairline bg-hairline sm:grid-cols-3">
        {(['live', 'partial', 'not-built'] as const).map((s) => (
          <div key={s} className="glass lift flex flex-col gap-[9px] bg-panel px-4 py-[15px]">
            <div className="label">{STATUS_LABEL[s]}</div>
            {/* Same call the sidebar chip already makes: the NOMINAL token is
                the quietest colour on the palette by design, and at 25px over
                this panel it measures 2.8:1 — below AA even at large-text's
                relaxed 3:1. Tertiary keeps not-built reading as the least
                urgent of the three without printing it illegibly. */}
            <div
              data-sev={STATUS_SEV[s]}
              className={`num text-3xl ${s === 'not-built' ? 'text-tertiary' : 'text-sev'}`}
            >
              {COUNTS[s]}
            </div>
          </div>
        ))}
      </div>

      <Panel title="Data">
        <div className="flex flex-col gap-4 p-5">
          <p className="text-base leading-[1.65] text-secondary [text-wrap:pretty]">
            <span className="text-primary">Measured.</span> Objects, element sets and
            their epochs come from a committed CelesTrak snapshot of{' '}
            {fmtInt(OBJECTS.length)} real tracked objects, captured{' '}
            {fmtUTC(new Date(SNAPSHOT_EPOCH))}. Times of closest approach, miss
            distances and relative velocities are propagated from those element sets
            with SGP4 and refined by bisection on range rate. Nothing on the
            conjunction table was authored — it is what the propagator found.
          </p>
          <p className="text-base leading-[1.65] text-secondary [text-wrap:pretty]">
            <span className="text-primary">Assumed, and stated wherever it is used.</span>{' '}
            Probability of collision needs a positional covariance, and a two-line
            element set does not carry one, so the 1σ is inferred from element-set age
            and from a radar cross-section class inferred in turn from object type —
            real RCS lives in the SATCAT. The Thresholds screen lets you scale that σ
            and watch every severity band move, which is the honest way to show how
            much of the ranking rests on it.
          </p>
          <p className="text-base leading-[1.65] text-secondary [text-wrap:pretty]">
            <span className="text-primary">Still synthetic.</span> The manoeuvre log's
            burn history. Nothing in that table was ever planned or flown; the burn
            advisor beside it is real, and works against real screened events.
          </p>
          <p className="text-base leading-[1.65] text-secondary [text-wrap:pretty]">
            There is no backend and no network request at runtime — the snapshot is
            bundled into the build. The console clock is anchored to the capture
            instant rather than the wall clock, because propagating these element sets
            from today would be arithmetic rather than prediction.
          </p>
          <div className="border-t border-hairline-soft pt-4">
            <ProvenanceFooter />
          </div>
        </div>
      </Panel>

      <Panel title="Measured screening cascade">
        <div className="flex flex-col gap-3 p-5">
          <p className="text-base leading-[1.65] text-secondary [text-wrap:pretty]">
            Counted during the committed run, not stored as constants. The point of a
            screening cascade is that it discards pairs without discarding events, and
            a hard-coded figure would make that claim impossible to check —{' '}
            <span className="num text-primary">npm run validate</span> checks the cut
            against brute-force all-pairs.
          </p>
          <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['All pairs', fmtInt(CASCADE.totalPairs)],
              ['After radial filter', fmtInt(CASCADE.afterRadialFilter)],
              ['Coarse candidates', fmtInt(CASCADE.candidates)],
              ['Confirmed events', fmtInt(CASCADE.events)],
              ['SGP4 propagations', fmtInt(CASCADE.propagations)],
              ['Horizon', `${CASCADE.horizonHours} h`],
              ['Sample step', `${STEP_S} s`],
              ['Wall clock', `${(CASCADE.elapsedMs / 1000).toFixed(1)} s`],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="label mb-1">{k}</div>
                <div className="num text-md text-primary">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      {GROUPS.map((group) => {
        const items = FEATURES.filter((f) => f.group === group);
        if (items.length === 0) return null;
        return (
          <Panel key={group} title={group}>
            <div className="px-5 pb-4 pt-1">
              {items.map((f) => (
                <StatusRow key={f.id} feature={f} />
              ))}
            </div>
          </Panel>
        );
      })}

      <div className="flex flex-wrap gap-2">
        <span className="label">Legend</span>
        <div className="flex flex-wrap gap-3">
          <SeverityChip sev="LOW" bordered />
          <span className="self-center text-sm text-secondary">works end to end</span>
          <SeverityChip sev="MEDIUM" bordered />
          <span className="self-center text-sm text-secondary">partly wired</span>
          <SeverityChip sev="NOMINAL" bordered />
          <span className="self-center text-sm text-secondary">does nothing</span>
        </div>
      </div>
    </div>
  );
}
