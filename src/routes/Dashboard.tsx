import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GROUP_COUNTS,
  GROUP_EVENT,
  OBJECTS,
  PROVENANCE,
  groupOf,
  isIndianAsset,
} from '../data/objects';
import { conjunctionsToCsv, downloadCsv, downloadText } from '../data/csv';
import { cdmBundleKvn } from '../data/cdm';
import { SNAPSHOT_EPOCH } from '../data/objects';
import { reband } from '../data/conjunctions';
import { SEVERITY_RANK } from '../data/riskScore';
import { fmtDur, fmtInt, fmtNorad, fmtPc, fmtUTC } from '../data/format';
import { useNow } from '../hooks/useNow';
import { useAcknowledged } from '../hooks/useAcknowledged';
import { useScreening } from '../hooks/useScreening';
import { CascadePanel } from '../components/CascadePanel';
import { OriginBadge, ProvenanceFooter } from '../components/Provenance';
import { Button, MetricTile, Panel, Segmented, SeverityChip, EmptyState } from '../components/primitives';
import { RegimePlot } from '../components/RegimePlot';
import { ArrowDown, ArrowUp } from '../components/Icon';
import type { ObjectType, ResolvedConjunction, Severity } from '../data/types';
import { passesThresholds, useThresholds } from '../state/thresholds';
import { Countdown } from '../components/Countdown';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

type SortKey = 'score' | 'tca' | 'miss' | 'relv' | 'pc';
type RiskFilter = 'ALL' | Severity;
type ClassFilter = 'ALL' | ObjectType;

/*
 * A floor, not a band picker, and now labelled as one.
 *
 * The filter has always been `SEVERITY_RANK[r.sev] >= SEVERITY_RANK[minRisk]`
 * — the same minimum-severity semantics the Thresholds screen applies — so
 * picking MED correctly shows MEDIUM, HIGH and CRITICAL. Under the old heading
 * "Risk" with a chip reading "MED", that looks like a broken equality filter:
 * you ask for medium and get a table full of HIGH. The behaviour was right and
 * the words were wrong, so the words changed. The trailing + carries it at a
 * glance and the hint carries it in full.
 */
const RISKS = [
  { label: 'ALL', value: 'ALL' as const },
  { label: 'CRIT+', value: 'CRITICAL' as const },
  { label: 'HIGH+', value: 'HIGH' as const },
  { label: 'MED+', value: 'MEDIUM' as const },
  { label: 'LOW+', value: 'LOW' as const },
];

const WINDOWS = [
  { label: '12 H', value: '12' as const },
  { label: '24 H', value: '24' as const },
  { label: '72 H', value: '72' as const },
];

const CLASSES = [
  { label: 'ALL', value: 'ALL' as const },
  { label: 'PAYLOAD', value: 'PAYLOAD' as const },
  { label: 'R/B', value: 'ROCKET BODY' as const },
  { label: 'DEBRIS', value: 'DEBRIS' as const },
];

/** Grid template shared by the table header and every row, so they stay locked. */
const COLS =
  /*
   * Retuned to FIT rather than to breathe. The previous template had a
   * min-content width of 926px inside a 792px column — the console reserves
   * 196px for the sidebar and 392px for the right rail — so at 1440px, the
   * width most of the judging will happen at, the two rightmost columns were
   * scrolled out of sight: relative velocity cut through its digits and
   * collision probability, the number the whole screen exists to produce, not
   * on screen at all. Nothing here is below its measured content: the TCA
   * stamp renders at 140px, severity's longest word is MEDIUM. The rail came
   * down 44px to meet it.
   */
  'grid-cols-[80px_58px_minmax(116px,1fr)_minmax(110px,1fr)_148px_70px_76px_86px]';

function SortHeader({
  label, active, dir, onClick, className = '',
}: {
  label: string; active: boolean; dir: 1 | -1; onClick: () => void; className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-sort={active ? (dir === -1 ? 'descending' : 'ascending') : 'none'}
      className={`flex items-center gap-1 font-mono text-xs- uppercase tracking-[0.08em] transition-colors ${
        active ? 'text-primary' : 'text-tertiary hover:text-primary'
      } ${className}`}
    >
      <span className="truncate">{label}</span>
      {active && (dir === -1 ? <ArrowDown className="flex-none" /> : <ArrowUp className="flex-none" />)}
    </button>
  );
}

/**
 * The next-TCA tile, which is the only thing on this screen besides the row
 * countdowns that has to know what time it is. It subscribes to the clock
 * itself so the rest of the dashboard does not have to.
 */
function NextTcaTile({ events }: { events: ResolvedConjunction[] }) {
  const now = useNow();
  const next = events.find((r) => r.tca > now);
  return (
    <MetricTile
      label="Next TCA"
      valueClass="text-accent"
      value={next ? fmtDur(next.tca - now) : '—'}
      foot={next?.id ?? ''}
    />
  );
}

export function Dashboard() {
  useDocumentTitle('Conjunction screening');
  const navigate = useNavigate();
  const { thresholds, modified } = useThresholds();

  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [minRisk, setMinRisk] = useState<RiskFilter>('ALL');
  const [win, setWin] = useState<'12' | '24' | '72'>('72');
  const [cls, setCls] = useState<ClassFilter>('ALL');
  const [isroOnly, setIsroOnly] = useState(false);
  const [selId, setSelId] = useState<string>('');

  /*
   * The screening run. Starts as the committed build-time result so the table
   * paints on first frame; "Run screening" replaces it with a live worker run
   * of the same engine over the horizon the operator picked.
   */
  const { events, cascade, progress, stage, live, lastRun, dismissLastRun, running, error, run } =
    useScreening();
  const { toggle: toggleAck, isAcknowledged } = useAcknowledged();

  const sortBy = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === -1 ? 1 : -1));
    else { setSortKey(k); setSortDir(-1); }
  };

  /*
   * The operator's screening floor is applied before anything else, so the
   * dashboard can only ever show events that cleared it. The panel filters
   * below then work within that set.
   */
  /*
   * Re-band first, then filter. The covariance behind Pc is an assumption, so
   * the operator can scale it; severity and score follow from the scaled Pc,
   * and only then does the screening floor decide what gets through. Doing it
   * the other way round would filter on a Pc the operator is not looking at.
   */
  const screened = useMemo(
    () =>
      events
        .map((e) => reband(e, thresholds.sigmaScale))
        .filter((e) => passesThresholds(e, thresholds)),
    [events, thresholds],
  );

  const counts = useMemo(
    () =>
      screened.reduce(
        (acc, c) => ({ ...acc, [c.sev]: acc[c.sev] + 1 }),
        { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, NOMINAL: 0 },
      ),
    [screened],
  );

  const rows = useMemo(() => {
    const value = (r: ResolvedConjunction) =>
      sortKey === 'score' ? r.score
        : sortKey === 'tca' ? r.tcaMin
        : sortKey === 'miss' ? r.miss
        : sortKey === 'relv' ? r.relv
        : r.pc;

    return screened
      .filter((r) =>
        (minRisk === 'ALL' || SEVERITY_RANK[r.sev] >= SEVERITY_RANK[minRisk]) &&
        r.tcaMin <= +win * 60 &&
        (cls === 'ALL' || r.A.type === cls || r.B.type === cls) &&
        (!isroOnly || isIndianAsset(r.a) || isIndianAsset(r.b)))
      .sort((a, b) => (value(a) - value(b)) * sortDir);
  }, [screened, sortKey, sortDir, minRisk, win, cls, isroOnly]);

  const selected = useMemo(
    () => rows.find((r) => r.id === selId) ?? rows[0],
    [rows, selId],
  );

  /*
   * Sorted once, not once a second.
   *
   * This used to filter and sort all 2,901 screened events on every tick,
   * because `now` was a dependency. The order does not change with the clock —
   * only which end of it has passed — so the sort is memoised on the data and
   * NextTcaTile scans forward from the front for the first event still ahead.
   * That scan is a handful of comparisons.
   */
  const byTca = useMemo(() => [...screened].sort((a, b) => a.tca - b.tca), [screened]);

  const highRisk = counts.CRITICAL + counts.HIGH;

  /*
   * How much of the urgent traffic traces back to one of the two events that
   * created these clouds. On this snapshot it is nearly all of it, which is the
   * policy point the catalogue makes on its own once the data carries the
   * grouping — no editorialising required.
   */
  /* Screened events involving an ISRO-operated asset — real objects from the
     same capture, screened against the same real debris. */
  const isroEvents = useMemo(
    () => screened.filter((c) => isIndianAsset(c.a) || isIndianAsset(c.b)).length,
    [screened],
  );

  const fromDestruction = useMemo(
    () =>
      screened.filter(
        (c) =>
          SEVERITY_RANK[c.sev] >= SEVERITY_RANK.HIGH &&
          (GROUP_EVENT[groupOf(c.a) ?? ''] || GROUP_EVENT[groupOf(c.b) ?? '']),
      ).length,
    [screened],
  );

  return (
    /*
     * h-full, not min-h-full — the same distinction the catalogue already makes.
     * Everything below this is built for a fixed-height screen: the table panel
     * is `min-h-0 flex-1`, its scroll container is `min-h-0 flex-1 overflow-auto`
     * and its column header is `sticky top-0`. None of that can engage against a
     * MINIMUM height, because the box is then free to grow to its content and
     * there is no overflow left for the inner container to own. Which is why the
     * sticky header never stuck: it was pinned to the top of a box 133,000px
     * tall. min-h-[560px] keeps the table from being crushed on a short window;
     * below that the page scrolls as a page, which is the right trade.
     */
    <div className="flex h-full min-h-[560px] flex-col">
      <div className="flex flex-wrap items-end justify-between gap-4 px-5 pt-[22px]">
        <div className="flex flex-col gap-[5px]">
          <h1 className="text-2xl font-medium tracking-tight text-primary">Conjunction screening</h1>
          <p className="font-mono text-xs text-tertiary">
            {PROVENANCE.source.split(' (')[0]} · screened over{' '}
            {cascade.horizonHours} h · {fmtInt(OBJECTS.length)} objects in scope ·{' '}
            <Link
              to="/console/thresholds"
              className={modified ? 'text-accent' : 'text-tertiary hover:text-primary'}
            >
              thresholds {modified ? 'modified' : 'default'}
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {running && (
            <span className="num text-xs- text-tertiary" role="status" aria-live="polite">
              {stage === 'refine' ? 'refining' : 'propagating'}{' '}
              {Math.round((progress ?? 0) * 100)}%
            </span>
          )}
          <Button
            className="px-[13px] py-[7px] text-sm text-secondary"
            onClick={() =>
              void downloadCsv(
                `kessler-conjunctions-${new Date(cascade.startUtc).toISOString().slice(0, 10)}.csv`,
                conjunctionsToCsv(rows),
              )
            }
            disabled={rows.length === 0}
          >
            Export CSV
          </Button>
          {/*
           * The same rows as the CSV, as Conjunction Data Messages. One file,
           * one message per screened event, in the KVN form Space-Track serves
           * — so what leaves here enters a conjunction pipeline rather than a
           * spreadsheet.
           */}
          <Button
            className="px-[13px] py-[7px] text-sm text-secondary"
            title={`${rows.length} CCSDS 508.0-B-1 Conjunction Data Messages, one per screened event. COVARIANCE_METHOD is DEFAULT on every object — ours is assumed, not determined.`}
            onClick={() =>
              void downloadText(
                `kessler-cdm-${new Date(cascade.startUtc).toISOString().slice(0, 10)}.cdm`,
                cdmBundleKvn(rows, { snapshotEpochMs: SNAPSHOT_EPOCH }),
                'text/plain',
              )
            }
            disabled={rows.length === 0}
          >
            Export CDM
          </Button>
          <Button
            variant="primary"
            className="px-[13px] py-[7px] text-sm"
            onClick={() => run(thresholds.horizonHours)}
            disabled={running}
          >
            {running ? 'Screening…' : 'Run screening'}
          </Button>
        </div>
      </div>

      {/* Metric row */}
      <div className="grid grid-cols-2 gap-px bg-hairline px-5 pt-5 sm:grid-cols-3 xl:grid-cols-5">
        <MetricTile
          label="Objects tracked"
          value={fmtInt(OBJECTS.length)}
          foot={`${Object.keys(GROUP_COUNTS).length} CelesTrak groups`}
        />
        <MetricTile
          label={`Pairs screened ${cascade.horizonHours} h`}
          value={fmtInt(cascade.totalPairs)}
          foot={`→ ${fmtInt(cascade.candidates)} candidates → ${fmtInt(cascade.events)} events`}
        />
        <MetricTile
          label="High risk events"
          value={
            <span className="flex items-baseline gap-[9px]">
              <span data-sev="HIGH" className="text-sev">{highRisk}</span>
              <span className="text-xs text-tertiary">of {screened.length}</span>
            </span>
          }
          foot={
            /*
             * Swatch carries the severity, text carries the number. Printed in
             * the severity colour itself this line measured 3.2:1 at 10px over
             * the metric tile — the palette is tuned for 8px fills and chips,
             * and it does not survive being used as caption type on a lit
             * backdrop. This is the same swatch-plus-label construction the
             * table's severity column already uses, so nothing new is invented
             * and the colour still says which row is which.
             */
            <span className="flex items-center gap-[10px]">
              <span data-sev="CRITICAL" className="flex items-center gap-[5px] text-secondary">
                <span className="sev-swatch h-2 w-2 flex-none rounded-xs bg-sev" />
                {counts.CRITICAL} CRIT
              </span>
              <span data-sev="HIGH" className="flex items-center gap-[5px] text-secondary">
                <span className="sev-swatch h-2 w-2 flex-none rounded-xs bg-sev" />
                {counts.HIGH} HIGH
              </span>
            </span>
          }
        />
        <NextTcaTile events={byTca} />
        <MetricTile
          label="Screening latency"
          value={(cascade.elapsedMs / 1000).toFixed(1)}
          unit="s"
          foot={`${fmtInt(cascade.propagations)} SGP4 propagations`}
        />
      </div>

      {/*
        A live run used to finish in silence.

        It takes twenty-six seconds, ticks a progress percentage, and then
        replaces the table with numbers identical to the ones already there —
        which, with no completion notice, is indistinguishable from a button
        that does nothing. That was the report: "run screening just running but
        showing no output."

        The identical numbers are the point, not an anticlimax. The committed
        precompute and this worker are the same engine over the same horizon, so
        reproducing the event count exactly is the claim the README makes, and
        this is the only place a visitor can watch it be true.
      */}
      {lastRun && (
        <div className="rise px-5 pt-4">
          <div
            role="status"
            className="glass lift flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-hairline bg-panel px-[14px] py-[10px]"
          >
            <span
              data-sev={lastRun.matchedCommitted ? 'LOW' : 'MEDIUM'}
              className="flex flex-none items-center gap-2"
            >
              <span className="sev-swatch h-2 w-2 rounded-xs bg-sev" />
              <span className="font-mono text-2xs uppercase tracking-label text-sev">
                Live run complete
              </span>
            </span>
            <span className="min-w-0 text-sm+ leading-[1.55] text-secondary [text-wrap:pretty]">
              {fmtInt(lastRun.events)} events in{' '}
              <span className="num text-primary">{(lastRun.elapsedMs / 1000).toFixed(1)} s</span>,
              re-propagated in this browser.{' '}
              {lastRun.matchedCommitted ? (
                <>
                  Identical to the committed result — same engine, same horizon,
                  same answer.
                </>
              ) : (
                <>
                  This differs from the committed result, which should not happen
                  over the same horizon — worth investigating before trusting either.
                </>
              )}
            </span>
            <Button
              className="ml-auto flex-none px-[11px] py-1 text-sm text-secondary"
              onClick={dismissLastRun}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 px-5 pt-4">
        <ProvenanceFooter />
        {fromDestruction > 0 && (
          <div className="font-mono text-2xs uppercase tracking-[0.08em] text-secondary">
            {fromDestruction} of {highRisk} high-severity events involve debris from a
            deliberate or accidental destruction
          </div>
        )}
      </div>

      {/* Table + side panels */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 px-5 py-5 xl:grid-cols-[minmax(0,1fr)_348px]">
        <Panel className="min-h-[520px]" title={undefined}>
          <div className="flex h-full flex-col">
            <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2 border-b border-hairline px-[14px] py-[9px]">
              <Segmented
                label="Min severity"
                hint="A floor: shows this severity and everything worse. Same rule as the Thresholds screen."
                segments={RISKS}
                value={minRisk}
                onChange={setMinRisk}
              />
              <Segmented label="Window" segments={WINDOWS} value={win} onChange={setWin} />
              <Segmented label="Class" segments={CLASSES} value={cls} onChange={setCls} />
              {/* Matches on ingest group, not a name string, so it cannot drift
                  if an object is renamed in a later capture. */}
              <button
                type="button"
                aria-pressed={isroOnly}
                onClick={() => setIsroOnly((v) => !v)}
                title={`${isroEvents} of ${screened.length} screened events involve an ISRO-operated asset`}
                className={`rounded border px-[11px] py-[5px] font-mono text-2xs uppercase tracking-data transition-colors ${
                  isroOnly
                    ? 'border-accent-border bg-accent-wash text-primary'
                    : 'border-hairline text-tertiary hover:bg-panel-raised hover:text-primary'
                }`}
              >
                ISRO assets · {isroEvents}
              </button>
              <div className="num ml-auto whitespace-nowrap text-xs- text-tertiary">
                {rows.length} / {screened.length} events
              </div>
            </div>

            {/* One scroll container for both axes: the header stays pinned while
                rows scroll, and below ~1280px the whole table scrolls sideways
                rather than clipping its numeric columns. */}
            <div className="min-h-0 flex-1 overflow-auto">
              <div className="min-w-[808px]">
            <div className={`sticky-head sticky top-0 z-10 grid ${COLS} h-[34px] flex-none items-center gap-x-2 border-b border-hairline px-[14px]`}>
              <div className="font-mono text-xs- uppercase tracking-[0.08em] text-tertiary">Severity</div>
              <SortHeader label="Score" active={sortKey === 'score'} dir={sortDir} onClick={() => sortBy('score')} className="justify-end" />
              <div className="font-mono text-xs- uppercase tracking-[0.08em] text-tertiary">Primary</div>
              <div className="font-mono text-xs- uppercase tracking-[0.08em] text-tertiary">Secondary</div>
              <SortHeader label="TCA · T-minus" active={sortKey === 'tca'} dir={sortDir} onClick={() => sortBy('tca')} className="justify-end" />
              <SortHeader label="Miss km" active={sortKey === 'miss'} dir={sortDir} onClick={() => sortBy('miss')} className="justify-end" />
              <SortHeader label="Rel V km/s" active={sortKey === 'relv'} dir={sortDir} onClick={() => sortBy('relv')} className="justify-end" />
              <SortHeader label="Pc" active={sortKey === 'pc'} dir={sortDir} onClick={() => sortBy('pc')} className="justify-end" />
            </div>

            {rows.length === 0 ? (
                <EmptyState
                  title="No conjunctions above threshold"
                  body={
                    screened.length === 0
                      ? 'Nothing clears your screening floor. Relax the thresholds to admit more events.'
                      : 'Nothing in this window matches these panel filters. Widen the window or lower the risk floor to see more.'
                  }
                  action={
                    screened.length === 0 ? (
                      <Link to="/console/thresholds">
                        <Button className="mt-2 px-[13px] py-[7px] text-sm">Edit thresholds</Button>
                      </Link>
                    ) : (
                      <Button
                        className="mt-2 px-[13px] py-[7px] text-sm"
                        onClick={() => {
                        setMinRisk('ALL');
                        setWin('72');
                        setCls('ALL');
                        setIsroOnly(false);
                      }}
                      >
                        Reset filters
                      </Button>
                    )
                  }
                />
              ) : (
                rows.map((r) => {
                  const sel = r.id === selId;
                  const ackd = isAcknowledged(r.id);
                  return (
                    <div
                      key={r.id}
                      role="button"
                      tabIndex={0}
                      data-sev={r.sev}
                      onClick={() => setSelId(r.id)}
                      onDoubleClick={() => navigate(`/console/conjunction/${r.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') navigate(`/console/conjunction/${r.id}`);
                        if (e.key === ' ') { e.preventDefault(); setSelId(r.id); }
                      }}
                      aria-label={ackd ? `${r.id}, acknowledged` : r.id}
                      className={`grid ${COLS} h-[46px] cursor-pointer items-center gap-x-2 border-b border-hairline-soft px-[14px] ${
                        sel
                          ? 'rise bg-panel-raised shadow-[inset_2px_0_0_0_var(--accent)]'
                          : 'hover:-translate-y-px hover:bg-panel-raised'
                      } ${ackd && !sel ? 'opacity-55' : ''}`}
                    >
                      <span className="flex min-w-0 items-center gap-[7px]">
                        <SeverityChip sev={r.sev} />
                        {ackd && (
                          <span
                            title="Acknowledged in this browser"
                            className="flex-none font-mono text-2xs uppercase tracking-[0.08em] text-tertiary"
                          >
                            ACK
                          </span>
                        )}
                      </span>
                      <div className="num text-right text-base text-primary">{r.score}</div>
                      <div className="min-w-0">
                        <div className="truncate text-sm+ text-primary">{r.A.name}</div>
                        <div className="num text-xs- text-tertiary">{fmtNorad(r.A.norad)}</div>
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm+ text-primary">{r.B.name}</div>
                        <div className="num text-xs- text-tertiary">{fmtNorad(r.B.norad)}</div>
                      </div>
                      <div className="text-right">
                        <div className="num text-sm text-secondary">{fmtUTC(new Date(r.tca))}</div>
                        <Countdown at={r.tca} prefix="T− " className="num text-xs- text-tertiary" />
                      </div>
                      <div className="num text-right text-sm text-primary">{r.miss.toFixed(3)}</div>
                      <div className="num text-right text-sm text-secondary">{r.relv.toFixed(3)}</div>
                      <div className="num text-right text-sm text-primary">{fmtPc(r.pc)}</div>
                    </div>
                  );
                })
              )}
              </div>
            </div>
          </div>
        </Panel>

        {/*
         * The right rail owns its own overflow.
         *
         * Regime plot, cascade panel and the selected-event card together run
         * past 950px, and as the tallest thing in the row they set the grid
         * track height — which the table panel then has to match, which is what
         * pushed the whole screen past the viewport again even after it was
         * given a definite height. Scrolling it independently is also just
         * better: reading down the funnel does not drag the event table with it.
         * -mr-2 pr-2 keeps the scrollbar off the panel edges.
         */}
        <div className="-mr-2 flex min-h-0 min-w-0 flex-col gap-5 overflow-y-auto pr-2">
          <Panel
            title="Regime plot — altitude × inclination"
            aside={<span className="font-mono text-2xs text-tertiary">KM × DEG</span>}
          >
            <RegimePlot events={rows} />
          </Panel>

          <CascadePanel cascade={cascade} live={live} />

          {error && (
            <div
              role="alert"
              data-sev="HIGH"
              className="glass lift rounded-md border border-hairline px-[14px] py-3"
            >
              <div className="label mb-1">Screening run failed</div>
              <div className="num text-xs- text-secondary">{error}</div>
            </div>
          )}

          {selected && (
            <Panel title={`Selected event — ${selected.id}`} className="flex-1">
              <div className="flex flex-col gap-[14px] p-[14px]">
                <div data-sev={selected.sev} className="flex items-center gap-[9px]">
                  <SeverityChip sev={selected.sev} size={9} />
                  <span className="num ml-auto text-xs text-secondary">SCORE {selected.score}</span>
                </div>

                <div className="flex flex-col gap-[9px]">
                  {[selected.A, selected.B].map((o) => (
                    <div key={o.norad} className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm text-secondary">{o.name}</span>
                      <span className="num flex-none text-xs text-tertiary">{fmtNorad(o.norad)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-[6px]">
                  <OriginBadge group={groupOf(selected.a)} />
                  <OriginBadge group={groupOf(selected.b)} />
                </div>

                <div className="grid grid-cols-2 gap-x-[14px] gap-y-3 border-t border-hairline-soft pt-3">
                  {[
                    ['Miss distance', selected.miss.toFixed(3), 'km'],
                    ['Relative velocity', selected.relv.toFixed(3), 'km/s'],
                    ['Collision probability', fmtPc(selected.pc), ''],
                    ['Oldest element set', selected.maxAge.toFixed(1), 'd'],
                  ].map(([label, value, unit]) => (
                    <div key={label}>
                      <div className="label mb-1">{label}</div>
                      <div className="num text-md text-primary">
                        {value} {unit && <span className="text-xs- text-tertiary">{unit}</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <Link to={`/console/conjunction/${selected.id}`} className="flex-1">
                    <Button variant="primary" className="w-full py-2 text-sm">Open detail view</Button>
                  </Link>
                  <Button
                    className="px-[13px] py-2 text-sm text-secondary"
                    onClick={() => toggleAck(selected.id)}
                    aria-pressed={isAcknowledged(selected.id)}
                  >
                    {isAcknowledged(selected.id) ? 'Acknowledged' : 'Acknowledge'}
                  </Button>
                </div>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
