import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OBJECTS, groupOf, isIndianAsset } from '../data/objects';
import { OriginBadge, ProvenanceFooter } from '../components/Provenance';
import { AgePip, ClassMark, ShellBar, SHELL_MIN_KM, SHELL_MAX_KM } from '../components/TableViz';
import { ShellHistogram } from '../components/ShellHistogram';
import { TLE_FIELD_NOTES, TLE_GROUP_LABEL } from '../data/tle';
import { fmtInt, fmtNorad } from '../data/format';
import { Button, EmptyState, TextField } from '../components/primitives';
import { CloseIcon, SearchIcon } from '../components/Icon';
import type { SpaceObject } from '../data/types';

type SortKey = 'name' | 'norad' | 'alt' | 'apogee' | 'perigee' | 'incl' | 'ecc' | 'period' | 'age';

/* 36px rows fit half again as many as the 42px ones this was tuned for. */
const PAGE_SIZE = 38;

/**
 * Column template shared by the header and every row. The console shell takes
 * 196px that the design's full-bleed catalogue artboard did not have to budget
 * for, so the fixed columns are a little tighter than the mockup's.
 */
const COLS =
  'grid-cols-[minmax(116px,1.2fr)_62px_88px_minmax(84px,1fr)_112px_94px_56px_60px_84px] gap-x-[10px]';

const HEADERS: { key: SortKey | null; label: string; align: 'left' | 'right'; pad?: boolean; hint?: string }[] = [
  { key: 'name', label: 'Object', align: 'left' },
  { key: 'norad', label: 'NORAD', align: 'right' },
  { key: null, label: 'Class', align: 'left' },
  { key: null, label: 'Operator', align: 'left' },
  // The bullet chart. Sorting by perigee is what turns it into a shell map.
  { key: 'perigee', label: 'Shell', align: 'left', hint: `Perigee to apogee on a fixed ${SHELL_MIN_KM}–${SHELL_MAX_KM} km scale, so every row is comparable. Sort by it to see the debris shells stack up.` },
  { key: 'apogee', label: 'Peri–apo km', align: 'right' },
  { key: 'incl', label: 'Incl °', align: 'right' },
  { key: 'period', label: 'Period', align: 'right' },
  { key: 'age', label: 'Elset age d', align: 'right' },
];

/** The annotated element-set drawer. */
function TleDrawer({ object, onClose }: { object: SpaceObject; onClose: () => void }) {
  const values: Record<string, string> = {
    norad: fmtNorad(object.norad),
    intl: object.intl,
    epoch: `${object.age.toFixed(2)} d before the screening epoch`,
    incl: `${object.incl.toFixed(4)}°`,
    raan: `${object.raan.toFixed(4)}°`,
    ecc: object.ecc.toFixed(7),
    argp: `${object.argp.toFixed(4)}°`,
    ma: `${object.ma.toFixed(4)}°`,
    // Read straight off line 2 (columns 53–63) rather than recomputed from the
    // rounded mean altitude, which would disagree with the element set printed
    // three lines below it.
    mm: object.tle[1].slice(52, 63).trim(),
    launch: object.launch,
    age: `${object.age.toFixed(2)} d`,
  };

  return (
    <aside className="slide-in glass flex min-h-0 flex-col border-l border-hairline bg-panel">
      <div className="flex h-11 flex-none items-center justify-between border-b border-hairline px-5">
        <div className="label">Element set — {fmtNorad(object.norad)}</div>
        <button type="button" onClick={onClose} aria-label="Close drawer"
                className="text-tertiary transition-colors hover:text-primary">
          <CloseIcon size={13} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-5">
        <div className="mb-[3px] text-xl font-medium text-primary">{object.name}</div>
        <div className="mb-3 font-mono text-xs text-tertiary">
          {object.type} · {object.op} · launched {object.launch}
        </div>
        <div className="mb-5">
          <OriginBadge group={groupOf(object.norad)} />
        </div>

        <div className="mb-2 overflow-x-auto rounded border border-hairline bg-deep px-[14px] py-3">
          {object.tle.map((line, i) => (
            <div key={i} className="whitespace-pre font-mono text-[11.5px] leading-[1.9] text-secondary">
              {line}
            </div>
          ))}
        </div>
        {/* The age half of this line moved into the Freshness cluster, where it
            sits beside the epoch it qualifies instead of above the raw TLE. */}
        <div className="mb-[22px] font-mono text-2xs uppercase tracking-[0.08em] text-tertiary">
          Real element set as published
        </div>

        {/*
          Three clusters, not one list of eleven.

          Every field used to render at the same weight with the same spacing,
          so a catalogue number, an argument of perigee and an element-set age
          all looked like the same kind of fact. They are not: one identifies
          the object, six describe where it is, and two say how much to trust
          the first two. Grouping them is the whole change — no new colour, no
          new type scale, the existing `.label` for the subheadings and the
          hairline that was already between rows to separate the clusters.
        */}
        {(['identity', 'orbit', 'freshness'] as const).map((group) => (
          <section key={group} className="mb-5 last:mb-0">
            <div className="label mb-[6px] text-accent">{TLE_GROUP_LABEL[group]}</div>
            <dl className="flex flex-col rounded border border-hairline-soft bg-panel px-[14px]">
              {TLE_FIELD_NOTES.filter((f) => f.group === group).map((f) => (
                <div
                  key={f.key}
                  className="grid grid-cols-[104px_1fr] gap-[14px] py-[13px] first:pt-[11px] last:pb-[11px] [&+&]:border-t [&+&]:border-hairline-soft"
                >
                  <dt className="num text-right text-sm text-primary">{values[f.key]}</dt>
                  <dd>
                    <div className="mb-[3px] font-mono text-xs- uppercase tracking-[0.08em] text-tertiary">
                      {f.label}
                    </div>
                    <div className="text-sm+ leading-[1.55] text-secondary">
                      {f.note}
                      {f.key === 'ecc' && ` This object ranges ${object.perigee}–${object.apogee} km.`}
                      {f.key === 'mm' && ` Here that is a ${object.period.toFixed(1)} minute period.`}
                    </div>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </aside>
  );
}

export function Catalogue() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(() => params.get('q') ?? '');
  /*
   * Seeded from the URL so the sidebar's Asset register entry lands here with
   * the fleet already filtered. That entry is the register: it cannot be
   * edited, but ?isro=1 is what "show me my assets" actually means here.
   */
  /** Altitude band picked off the histogram, or null for the whole catalogue. */
  const [band, setBand] = useState<[number, number] | null>(null);
  const [isroOnly, setIsroOnly] = useState(() => params.get('isro') === '1');
  const [sortKey, setSortKey] = useState<SortKey>('norad');
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<number | null>(25544);

  // Keep the URL in step, so a global-search jump is shareable and reloadable.
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (q) next.set('q', q); else next.delete('q');
    if (isroOnly) next.set('isro', '1'); else next.delete('isro');
    setParams(next, { replace: true });
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, isroOnly]);

  /*
   * The histogram is drawn from the catalogue BEFORE the band filter, so
   * choosing a band does not collapse the chart you chose it from. It does
   * respect the text and ISRO filters, because those are what "the population
   * I am looking at" means.
   */
  const histogramPool = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const byAsset = isroOnly ? OBJECTS.filter((o) => isIndianAsset(o.norad)) : OBJECTS;
    if (!needle) return byAsset;
    return byAsset.filter((o) =>
      `${o.name} ${o.norad} ${o.op} ${o.type}`.toLowerCase().includes(needle),
    );
  }, [q, isroOnly]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const byAsset = isroOnly ? OBJECTS.filter((o) => isIndianAsset(o.norad)) : OBJECTS;
    const pool = band ? byAsset.filter((o) => o.alt >= band[0] && o.alt < band[1]) : byAsset;
    const matched = needle
      ? pool.filter((o) =>
          `${o.name} ${o.norad} ${o.type} ${o.op} ${o.intl}`.toLowerCase().includes(needle))
      : pool;

    const value = (o: SpaceObject) => (sortKey === 'name' ? o.name : o[sortKey]);
    return [...matched].sort((a, b) => {
      const x = value(a);
      const y = value(b);
      const cmp = typeof x === 'string' ? x.localeCompare(y as string) : (x as number) - (y as number);
      return cmp * sortDir;
    });
  }, [q, isroOnly, band, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const object = selected != null ? OBJECTS.find((o) => o.norad === selected) : undefined;

  /** Changes whenever the population changes, to replay the row entrance. */
  const listKey = `${q}|${isroOnly}|${band?.[0] ?? ''}|${sortKey}|${sortDir}|${current}`;

  const sortBy = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === 1 ? -1 : 1));
    else { setSortKey(k); setSortDir(1); }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/*
        The toolbar row used to hold a 400px field and one button in a 52px bar
        the full width of the console, which is a lot of nothing to look at on
        the screen this app opens on. The space now carries the population the
        table is a list of.
      */}
      <div className="flex flex-none flex-wrap items-center gap-x-4 gap-y-2 border-b border-hairline-soft px-6 py-[10px]">
        <TextField
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter name, NORAD, operator, class"
          aria-label="Filter catalogue"
          className="h-[30px] w-full max-w-[320px] px-[10px]"
          icon={<SearchIcon className="flex-none text-tertiary" />}
        />
        <button
          type="button"
          aria-pressed={isroOnly}
          onClick={() => setIsroOnly((v) => !v)}
          className={`flex-none rounded border px-[11px] py-[5px] font-mono text-2xs uppercase tracking-data transition-colors ${
            isroOnly
              ? 'border-accent-border bg-accent-wash text-primary hover:border-accent'
              : 'border-hairline text-tertiary hover:bg-panel-raised hover:text-primary'
          }`}
        >
          ISRO assets
        </button>
        {band && (
          <button
            type="button"
            onClick={() => setBand(null)}
            className="flex-none rounded border border-accent-border bg-accent-wash px-[11px] py-[5px] font-mono text-2xs uppercase tracking-data text-primary transition-colors hover:border-accent"
          >
            {Math.round(band[0])}–{Math.round(band[1])} km ✕
          </button>
        )}
        <div className="num ml-auto flex-none text-xs- text-tertiary">
          {fmtInt(filtered.length)} of {fmtInt(OBJECTS.length)}
        </div>
      </div>

      <div className="flex-none border-b border-hairline-soft px-6 py-[10px]">
        <ShellHistogram objects={histogramPool} band={band} onPick={setBand} />
      </div>

      {/*
        Provenance gets its own row, the way the dashboard already gives it one.
        It used to sit inside the toolbar above, which is a fixed h-[52px] with
        flex-wrap on: the source line, capture instant, object count and all
        five group counts are far too long for the space left beside a 400px
        search field, so it wrapped to three lines inside a 52px box and — with
        nothing clipping the overflow — spilled straight through the table
        header below it, which is sticky and therefore painted underneath.
        Two rows of text on top of each other, at a full 1440px desktop width.

        The fix is not overflow-hidden. Hiding it would trade unreadable text
        for absent text, and the capture instant is the one thing an operator
        has to see before trusting a miss distance.
      */}
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-b border-hairline-soft px-6 py-2">
        <ProvenanceFooter />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_470px] 2xl:grid-cols-[minmax(0,1fr)_520px]">
        <div className="flex min-w-0 flex-col border-r border-hairline-soft">
          <div className="min-h-0 flex-1 overflow-auto">
            <div className="min-w-[860px]">
          <div className={`sticky top-0 z-10 grid ${COLS} h-[34px] items-center border-b border-hairline bg-panel-raised px-4`}>
            {HEADERS.map((h) => (
              h.key ? (
                <button key={h.label} type="button" onClick={() => sortBy(h.key!)} title={h.hint}
                        className={`font-mono text-xs- uppercase tracking-[0.08em] transition-colors ${
                          h.align === 'right' ? 'text-right' : 'text-left'
                        } ${h.pad ? 'pl-[14px]' : ''} ${
                          sortKey === h.key ? 'text-primary' : 'text-tertiary hover:text-primary'
                        }`}>
                  {h.label}{sortKey === h.key ? (sortDir === 1 ? ' ▴' : ' ▾') : ''}
                </button>
              ) : (
                <div key={h.label}
                     className={`font-mono text-xs- uppercase tracking-[0.08em] text-tertiary ${
                       h.align === 'right' ? 'text-right' : ''} ${h.pad ? 'pl-[14px]' : ''}`}>
                  {h.label}
                </div>
              )
            ))}
          </div>

            {rows.length === 0 ? (
              <EmptyState
                title="No objects match that filter"
                body="Nothing in the screened catalogue matches. Try a NORAD ID, an operator, or a partial object name."
                action={<Button className="mt-2 px-[13px] py-[7px] text-sm text-secondary" onClick={() => setQ('')}>Clear filter</Button>}
              />
            ) : rows.map((o, i) => (
              /*
               * 36px rows, not 42px, and every other one tinted.
               *
               * A console this dense should show thirty rows where it was
               * showing twenty, and a wall of identically weighted rows is the
               * hardest thing there is to keep your place in. The zebra is two
               * per cent of white; it does nothing but stop the eye sliding.
               */
              <div
                /*
                 * Keyed on the filter as well as the object, so changing the
                 * filter remounts the rows and replays the entrance. Keyed on
                 * the NORAD alone, React reuses the DOM and a new population
                 * appears with no transition at all.
                 */
                key={`${listKey}-${o.norad}`}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(o.norad)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(o.norad); } }}
                style={{ animationDelay: `${Math.min(i, 14) * 11}ms` }}
                className={`row-in grid ${COLS} h-9 cursor-pointer items-center border-b border-hairline-soft px-4 transition-colors ${
                  o.norad === selected
                    ? 'bg-panel-raised shadow-[inset_2px_0_0_0_var(--accent)]'
                    : `${i % 2 ? 'bg-[rgba(255,255,255,0.014)]' : ''} hover:bg-panel-raised`
                }`}
              >
                <div className="truncate text-sm+ text-primary">{o.name}</div>
                <div className="num text-right text-sm text-secondary">{fmtNorad(o.norad)}</div>
                <ClassMark type={o.type} />
                <div className="truncate text-sm text-secondary">{o.op}</div>
                <ShellBar perigee={o.perigee} apogee={o.apogee} type={o.type} />
                <div className="num text-right text-sm text-primary">
                  {o.perigee}<span className="text-tertiary">–</span>{o.apogee}
                </div>
                <div className="num text-right text-sm text-primary">{o.incl.toFixed(2)}</div>
                <div className="num text-right text-sm text-primary">{o.period.toFixed(1)}</div>
                <AgePip days={o.age} />
              </div>
            ))}
            </div>
          </div>

          <div className="flex h-11 flex-none items-center justify-between border-t border-hairline px-4">
            <div className="num text-xs- text-tertiary">
              {filtered.length === 0 ? 0 : current * PAGE_SIZE + 1}–
              {Math.min(filtered.length, (current + 1) * PAGE_SIZE)} of {fmtInt(filtered.length)}
            </div>
            <div className="flex items-center gap-2">
              <Button className="px-[10px] py-1 text-sm text-secondary disabled:opacity-40"
                      disabled={current === 0} onClick={() => setPage(current - 1)}>Prev</Button>
              <span className="num text-xs- text-tertiary">{current + 1} / {pageCount}</span>
              <Button className="px-[10px] py-1 text-sm text-secondary disabled:opacity-40"
                      disabled={current >= pageCount - 1} onClick={() => setPage(current + 1)}>Next</Button>
            </div>
          </div>
        </div>

        {object && <TleDrawer object={object} onClose={() => setSelected(null)} />}
      </div>
    </div>
  );
}
