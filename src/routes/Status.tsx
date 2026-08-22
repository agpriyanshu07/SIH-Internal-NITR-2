import { Link } from 'react-router-dom';
import { COUNTS, FEATURES, STATUS_LABEL, STATUS_SEV, type Feature } from '../data/features';
import { Panel, SeverityChip } from '../components/primitives';

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
  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-6 p-6">
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
            <div data-sev={STATUS_SEV[s]} className="num text-3xl text-sev">
              {COUNTS[s]}
            </div>
          </div>
        ))}
      </div>

      <Panel title="Data">
        <div className="flex flex-col gap-3 p-5">
          <p className="text-base leading-[1.65] text-secondary [text-wrap:pretty]">
            Every number in this console is synthetic. There is no backend, no network request and
            no orbital propagation — object names, NORAD IDs, element sets, miss distances and
            collision probabilities are produced by a seeded generator and are identical on every
            reload.
          </p>
          <p className="text-base leading-[1.65] text-secondary [text-wrap:pretty]">
            Probability of collision is <span className="text-primary">derived</span> from miss
            distance, object size and an assumed positional uncertainty, so the four numbers on any
            row stay consistent with each other. It is not a real screening result.
          </p>
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
