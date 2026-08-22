import { GROUP_COUNTS, GROUP_EVENT, PROVENANCE, SNAPSHOT_EPOCH } from '../data/objects';
import { fmtInt, fmtUTC } from '../data/format';

/**
 * Where the numbers came from.
 *
 * Every screen that shows derived figures should be one glance away from the
 * data they were derived from. The capture instant matters more than it looks:
 * SGP4 is only accurate near an element set's epoch, so an operator needs to
 * know how far the console is extrapolating before trusting a miss distance.
 */
export function ProvenanceFooter({ className = '' }: { className?: string }) {
  const total = Object.values(GROUP_COUNTS).reduce((a, b) => a + b, 0);
  return (
    <div
      className={`flex flex-wrap items-center gap-x-[10px] gap-y-1 font-mono text-2xs uppercase tracking-[0.08em] text-tertiary ${className}`}
    >
      <span>SOURCE — {PROVENANCE.source.split(' (')[0]}</span>
      <span className="text-[color:var(--t3)]">·</span>
      <span>CAPTURED {fmtUTC(new Date(SNAPSHOT_EPOCH))}</span>
      <span className="text-[color:var(--t3)]">·</span>
      <span>{fmtInt(total)} OBJECTS</span>
      <span className="text-[color:var(--t3)]">·</span>
      <span>
        {Object.entries(GROUP_COUNTS)
          .map(([g, n]) => `${g} ${n}`)
          .join(' · ')}
      </span>
      <span className="text-[color:var(--t3)]">·</span>
      <span>BUNDLED — NO NETWORK REQUEST AT RUNTIME</span>
    </div>
  );
}

/**
 * Badge for an object that traces to a real destruction event.
 *
 * Not decoration. Nearly every high-severity event on this board involves a
 * fragment of the 2009 Iridium/Cosmos collision or the 2021 ASAT test, and
 * saying so once, next to the object, is the difference between a debris
 * catalogue and an argument about what created it.
 */
export function OriginBadge({ group }: { group: string | undefined }) {
  const event = group ? GROUP_EVENT[group] : undefined;
  if (!event) return null;
  return (
    <span
      title={event}
      className="inline-flex items-center rounded border border-hairline px-[6px] py-[2px] font-mono text-2xs uppercase tracking-[0.08em] text-tertiary"
    >
      {event.split(' — ')[0]}
    </span>
  );
}
