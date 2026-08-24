import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OBJECTS, groupOf, isIndianAsset } from '../data/objects';
import { OriginBadge, ProvenanceFooter } from '../components/Provenance';
import { TLE_FIELD_NOTES } from '../data/tle';
import { fmtInt, fmtNorad } from '../data/format';
import { Button, EmptyState, TextField } from '../components/primitives';
import { CloseIcon, SearchIcon } from '../components/Icon';
import type { SpaceObject } from '../data/types';

type SortKey = 'name' | 'norad' | 'alt' | 'apogee' | 'perigee' | 'incl' | 'ecc' | 'period' | 'age';

const PAGE_SIZE = 25;

/**
 * Column template shared by the header and every row. The console shell takes
 * 196px that the design's full-bleed catalogue artboard did not have to budget
 * for, so the fixed columns are a little tighter than the mockup's.
 */
const COLS =
  'grid-cols-[minmax(120px,1.3fr)_66px_92px_minmax(90px,1fr)_66px_66px_64px_78px_74px_54px] gap-x-[6px]';

const HEADERS: { key: SortKey | null; label: string; align: 'left' | 'right'; pad?: boolean }[] = [
  { key: 'name', label: 'Object', align: 'left' },
  { key: 'norad', label: 'NORAD', align: 'right' },
  { key: null, label: 'Class', align: 'left', pad: true },
  { key: null, label: 'Operator', align: 'left' },
  { key: 'apogee', label: 'Apo km', align: 'right' },
  { key: 'perigee', label: 'Peri km', align: 'right' },
  { key: 'incl', label: 'Incl °', align: 'right' },
  { key: 'ecc', label: 'Ecc', align: 'right' },
  { key: 'period', label: 'Period min', align: 'right' },
  { key: 'age', label: 'Age d', align: 'right' },
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
  };

  return (
    <aside className="glass flex min-h-0 flex-col border-l border-hairline bg-panel">
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
        <div className="mb-[22px] font-mono text-2xs uppercase tracking-[0.08em] text-tertiary">
          Real element set as published · this prediction rests on a{' '}
          {object.age.toFixed(2)}-day-old element set
        </div>

        <div className="mb-[6px] font-mono text-2xs uppercase tracking-[0.12em] text-accent">
          Field by field
        </div>
        <dl className="flex flex-col">
          {TLE_FIELD_NOTES.map((f) => (
            <div key={f.key} className="grid grid-cols-[104px_1fr] gap-[14px] border-t border-hairline-soft py-[13px]">
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
      </div>
    </aside>
  );
}

export function Catalogue() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(() => params.get('q') ?? '');
  const [isroOnly, setIsroOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('norad');
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<number | null>(25544);

  // Keep the URL in step, so a global-search jump is shareable and reloadable.
  useEffect(() => {
    const next = new URLSearchParams(params);
    if (q) next.set('q', q); else next.delete('q');
    setParams(next, { replace: true });
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const pool = isroOnly ? OBJECTS.filter((o) => isIndianAsset(o.norad)) : OBJECTS;
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
  }, [q, isroOnly, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const object = selected != null ? OBJECTS.find((o) => o.norad === selected) : undefined;

  const sortBy = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === 1 ? -1 : 1));
    else { setSortKey(k); setSortDir(1); }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-[52px] flex-none flex-wrap items-center justify-between gap-4 border-b border-hairline-soft px-6">
        <TextField
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by name, NORAD ID, operator or class"
          aria-label="Filter catalogue"
          className="h-[30px] w-full max-w-[400px] px-[10px]"
          icon={<SearchIcon className="flex-none text-tertiary" />}
        />
        <div className="flex items-center gap-[18px]">
          <button
            type="button"
            aria-pressed={isroOnly}
            onClick={() => setIsroOnly((v) => !v)}
            className={`flex-none rounded border px-[11px] py-[5px] font-mono text-2xs uppercase tracking-data transition-colors ${
              isroOnly
                ? 'border-accent-border bg-accent-wash text-primary'
                : 'border-hairline text-tertiary hover:bg-panel-raised hover:text-primary'
            }`}
          >
            ISRO assets
          </button>
        </div>
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
            <div className="min-w-[880px]">
          <div className={`sticky top-0 z-10 grid ${COLS} h-[34px] items-center border-b border-hairline bg-panel-raised px-4`}>
            {HEADERS.map((h) => (
              h.key ? (
                <button key={h.label} type="button" onClick={() => sortBy(h.key!)}
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
            ) : rows.map((o) => (
              <div
                key={o.norad}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(o.norad)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(o.norad); } }}
                className={`grid ${COLS} h-[42px] cursor-pointer items-center border-b border-hairline-soft px-4 ${
                  o.norad === selected
                    ? 'rise glass bg-panel-raised shadow-[inset_2px_0_0_0_var(--accent)]'
                    : 'hover:-translate-y-px hover:bg-panel-raised'
                }`}
              >
                <div className="truncate text-sm+ text-primary">{o.name}</div>
                <div className="num text-right text-sm text-secondary">{fmtNorad(o.norad)}</div>
                <div className="truncate pl-[14px] font-mono text-xs- tracking-data text-tertiary">{o.type}</div>
                <div className="truncate text-sm text-secondary">{o.op}</div>
                <div className="num text-right text-sm text-primary">{o.apogee}</div>
                <div className="num text-right text-sm text-primary">{o.perigee}</div>
                <div className="num text-right text-sm text-primary">{o.incl.toFixed(2)}</div>
                <div className="num text-right text-sm text-secondary">{o.ecc.toFixed(7)}</div>
                <div className="num text-right text-sm text-primary">{o.period.toFixed(1)}</div>
                <div
                  className={`num text-right text-xs ${o.age > 3 ? 'text-risk-high' : 'text-tertiary'}`}
                  title={`Element set is ${o.age.toFixed(2)} days old${o.age > 3 ? ' — stale enough that the propagated position has drifted' : ''}`}
                >
                  {o.age.toFixed(2)}
                </div>
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
