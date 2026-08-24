import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BURN_STATUS_SEV, MANOEUVRES, type BurnStatus } from '../data/manoeuvres';
import { fmtNorad, fmtUTC } from '../data/format';
import { EmptyState, Panel, SeverityChip, Segmented, Button } from '../components/primitives';
import { BurnAdvisor } from '../components/BurnAdvisor';
import { RESOLVED, reband } from '../data/conjunctions';
import { passesThresholds, useThresholds } from '../state/thresholds';
import { CountdownOrLabel } from '../components/Countdown';

/**
 * Manoeuvre log.
 *
 * Read-only by design: this prototype has no command path, so there is nothing
 * honest to put behind a "plan burn" button. Burns prompted by an event link
 * back to it, and those whose event no longer clears the screening thresholds
 * are marked, which is the useful cross-check.
 */

const STATUSES = [
  { label: 'ALL', value: 'ALL' as const },
  { label: 'PLANNED', value: 'PLANNED' as const },
  { label: 'REVIEW', value: 'UNDER REVIEW' as const },
  { label: 'EXECUTED', value: 'EXECUTED' as const },
  { label: 'CANCELLED', value: 'CANCELLED' as const },
];

/*
 * Six columns, not seven, and narrower.
 *
 * The table demanded 900px inside a column squeezed against a fixed 400px
 * advisor panel, so at any normal laptop width the last two columns were behind
 * a horizontal scroll — you had to scroll a table to see why a burn happened.
 * Δv and axis are one quantity written two ways and now share a cell, the way
 * asset name and NORAD already do; "prompted by" carries the event reference
 * and puts the miss-distance change in its title. 900px -> 748px, which fits.
 */
const COLS =
  'grid-cols-[84px_104px_minmax(140px,1fr)_108px_112px_minmax(132px,1fr)] gap-x-3';

export function ManoeuvreLog() {
  const { thresholds } = useThresholds();
  const [status, setStatus] = useState<BurnStatus | 'ALL'>('ALL');
  const [linkedOnly, setLinkedOnly] = useState(false);

  const rows = useMemo(
    () =>
      MANOEUVRES.filter(
        (m) => (status === 'ALL' || m.status === status) && (!linkedOnly || m.cause),
      ),
    [status, linkedOnly],
  );

  /* Real screened events the advisor can plan against, under the operator's
     own floor and covariance assumption. */
  const advisorEvents = RESOLVED.map((e) => reband(e, thresholds.sigmaScale)).filter(
    (e) => passesThresholds(e, thresholds),
  );

  const planned = MANOEUVRES.filter((m) => m.status === 'PLANNED').length;
  const totalDv = MANOEUVRES.filter((m) => m.status === 'EXECUTED').reduce(
    (s, m) => s + m.deltaV,
    0,
  );

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-[5px]">
          <h1 className="text-2xl font-medium tracking-tight text-primary">Manoeuvre log</h1>
          <p className="font-mono text-xs text-tertiary">
            Historic burns are synthetic and read-only · the advisor below plans
            against real screened events
          </p>
        </div>
        <div className="flex gap-6">
          <div>
            <div className="label">Planned</div>
            <div className="num mt-1 text-2xl text-accent">{planned}</div>
          </div>
          <div>
            <div className="label">Δv expended</div>
            <div className="num mt-1 text-2xl text-primary">
              {totalDv.toFixed(2)} <span className="text-xs text-tertiary">m/s</span>
            </div>
          </div>
        </div>
      </div>

      {/*
        The side-by-side split starts at 1420px, not Tailwind's xl (1280px).
        The advisor reserves a fixed 400px, and below that it leaves the table
        less than it needs even after trimming it to 748px — 1280px was still
        132px short. Above the breakpoint they sit side by side; below it the
        advisor stacks under a full-width table, which is better than a panel
        beside a table you have to scroll.
      */}
      <div className="grid gap-5 min-[1420px]:grid-cols-[minmax(0,1fr)_400px]">
        <Panel className="min-h-[520px]">
          <div className="flex h-full flex-col">
          <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2 border-b border-hairline px-[14px] py-[9px]">
            <Segmented label="Status" segments={STATUSES} value={status} onChange={setStatus} />
            <button
              type="button"
              aria-pressed={linkedOnly}
              onClick={() => setLinkedOnly((v) => !v)}
              className={`rounded border px-[11px] py-1 font-mono text-2xs tracking-[0.08em] transition-colors ${
                linkedOnly
                  ? 'border-accent-border bg-accent-wash text-primary hover:border-accent'
                  : 'border-hairline text-tertiary hover:bg-panel-raised hover:text-primary'
              }`}
            >
              PROMPTED BY AN EVENT
            </button>
            <div className="num ml-auto text-xs- text-tertiary">
              {rows.length} / {MANOEUVRES.length} burns
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            <div className="min-w-[748px]">
              <div
                className={`sticky top-0 z-10 grid ${COLS} h-[34px] items-center border-b border-hairline bg-panel-raised px-[14px]`}
              >
                {['Burn', 'Status', 'Asset', 'Epoch', 'Δv · axis', 'Prompted by'].map((h, i) => (
                  <div
                    key={h}
                    className={`font-mono text-xs- uppercase tracking-[0.08em] text-tertiary ${
                      i === 4 ? 'text-right' : ''
                    }`}
                  >
                    {h}
                  </div>
                ))}
              </div>

              {rows.length === 0 ? (
                <EmptyState
                  title="No burns match this filter"
                  body="Nothing in the log matches. Clear the status filter to see the full history."
                  action={
                    <Button
                      className="mt-2 px-[13px] py-[7px] text-sm"
                      onClick={() => {
                        setStatus('ALL');
                        setLinkedOnly(false);
                      }}
                    >
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                rows.map((m) => {
                  const stale = m.cause && !passesThresholds(m.cause, thresholds);
                  return (
                    <div
                      key={m.id}
                      className={`grid ${COLS} min-h-[52px] items-center border-b border-hairline-soft px-[14px] py-2 hover:bg-panel-raised`}
                    >
                      <div className="num text-sm text-primary">{m.id}</div>
                      <div>
                        <SeverityChip sev={BURN_STATUS_SEV[m.status]} label={m.status} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm+ text-primary">{m.object.name}</div>
                        <div className="num text-xs- text-tertiary">{fmtNorad(m.norad)}</div>
                      </div>
                      <div>
                        <div className="num text-xs text-secondary">{fmtUTC(new Date(m.epoch))}</div>
                        <CountdownOrLabel
                          at={m.epoch}
                          prefix="T− "
                          past="complete"
                          className="num text-2xs text-tertiary"
                        />
                      </div>
                      <div className="text-right">
                        <div className="num text-sm text-primary">
                          {m.deltaV.toFixed(3)} <span className="text-2xs text-tertiary">m/s</span>
                        </div>
                        <div className="font-mono text-2xs tracking-data text-tertiary">
                          {m.axis}
                        </div>
                      </div>
                      <div className="min-w-0">
                        {m.cause ? (
                          /*
                           * One line. The miss-distance change moves into the
                           * title rather than a second row — it is the reason a
                           * reader opens the event, not something they scan the
                           * column for, and the second row was half the width
                           * this column was asking for.
                           */
                          <Link
                            to={`/console/conjunction/${m.cause.id}`}
                            title={`Prompted by ${m.cause.id}. Miss ${m.preMissKm?.toFixed(3)} km${
                              m.postMissKm != null ? ` → ${m.postMissKm.toFixed(3)} km after the burn` : ''
                            }${stale ? '. Below the current severity floor.' : ''}`}
                            className="num inline-flex max-w-full items-center gap-[6px] truncate rounded-sm border border-hairline px-[6px] py-[3px] text-xs- text-accent transition-colors hover:border-accent-border hover:bg-accent-wash hover:text-primary"
                          >
                            {m.cause.id}
                            {stale && <span className="text-2xs text-tertiary">↓</span>}
                          </Link>
                        ) : (
                          <span className="text-sm text-tertiary">Station-keeping</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        </Panel>

        <BurnAdvisor events={advisorEvents} />
      </div>

      <p className="font-mono text-2xs uppercase tracking-[0.08em] text-tertiary">
        Records are synthetic · planning and commanding a burn are not implemented
      </p>
    </div>
  );
}
