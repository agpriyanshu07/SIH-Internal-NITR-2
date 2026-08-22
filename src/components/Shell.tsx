import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useNow } from '../hooks/useNow';
import { fmtAge, fmtUTC } from '../data/format';
import { SearchIcon } from './Icon';
import { useTheme } from '../hooks/useTheme';
import { initials, useOperator } from '../hooks/useOperator';
import { FEATURES, type Feature } from '../data/features';
import { OBJECTS, SNAPSHOT_EPOCH } from '../data/objects';

/**
 * The console shell: glass sidebar over the drifting field lighting, top bar
 * with global search and the data-freshness indicator.
 *
 * Navigation is generated from the feature registry, so an unbuilt route is
 * physically incapable of looking like a working link.
 */

/** Last synthetic TLE fetch — 2 m 14 s before the session opened, then live. */
/**
 * Element-set freshness, read from the snapshot rather than asserted.
 *
 * This used to be `Date.now() - 134s` — a hard-coded "fetched 2 m 14 s ago"
 * that was true no matter what the data was. It is now the age of the OLDEST
 * element set the console is screening with, measured from each object's own
 * TLE epoch. The oldest, not the average: a prediction is only as fresh as the
 * stalest orbit that went into it.
 */
const OLDEST_ELSET_DAYS = OBJECTS.reduce((m, o) => Math.max(m, o.age), 0);
const OLDEST_ELSET_MS = OLDEST_ELSET_DAYS * 86400000;

/** Beyond three days a TLE has drifted far enough to warrant flagging. */
const STALE_AFTER_MS = 3 * 86400000;

const NAV_GROUPS: { label: string; ids: string[] }[] = [
  { label: 'Operations', ids: ['conjunctions', 'viewer', 'catalogue', 'manoeuvres'] },
  { label: 'Configuration', ids: ['thresholds', 'assets', 'alerts', 'apikeys'] },
];

const navClass = (active: boolean) =>
  `block rounded px-2 py-2 text-base ${
    active
      ? 'glass lift bg-panel-raised text-primary shadow-[inset_2px_0_0_0_var(--accent)]'
      : 'text-secondary hover:glass hover:bg-panel hover:text-primary'
  }`;

function NavItem({ feature }: { feature: Feature }) {
  if (!feature.to) {
    return (
      <div
        title={feature.note}
        className="flex cursor-default items-center justify-between gap-2 rounded px-2 py-2 text-base text-tertiary"
      >
        <span className="truncate opacity-70">{feature.label}</span>
        <span className="flex-none rounded-sm border border-hairline px-[5px] py-px font-mono text-[8.5px] uppercase tracking-[0.08em] text-tertiary">
          Not built
        </span>
      </div>
    );
  }

  return (
    <NavLink
      to={feature.to}
      end={feature.to === '/console'}
      className={({ isActive }) => navClass(isActive)}
    >
      {feature.label}
    </NavLink>
  );
}

export function Shell() {
  const now = useNow();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const { theme, toggle } = useTheme();
  const { operator } = useOperator();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey) return;
      const el = document.activeElement;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const fetchAgeMs = OLDEST_ELSET_MS;
  const stale = fetchAgeMs > STALE_AFTER_MS;
  const who = operator?.name ?? 'Signed out';

  return (
    <div className="grid h-screen grid-cols-1 md:grid-cols-[196px_minmax(0,1fr)]">
      <aside className="glass hidden flex-col border-r border-hairline-soft bg-deep md:flex">
        <div className="flex h-[52px] flex-none items-center border-b border-hairline-soft px-[18px]">
          <NavLink to="/" className="text-base font-semibold tracking-[0.06em] text-primary">
            KESSLER
          </NavLink>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-[2px] overflow-auto px-[10px] py-[18px]">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-[2px]">
              <div className="px-2 pb-2 pt-3 font-mono text-2xs uppercase tracking-eyebrow text-tertiary">
                {group.label}
              </div>
              {group.ids.map((id) => {
                const feature = FEATURES.find((f) => f.id === id);
                return feature ? <NavItem key={id} feature={feature} /> : null;
              })}
            </div>
          ))}
        </nav>

        <div className="flex flex-none flex-col gap-[10px] border-t border-hairline-soft px-[18px] py-4">
          <NavLink
            to="/console/status"
            className={({ isActive }) =>
              `font-mono text-2xs uppercase tracking-[0.12em] ${
                isActive ? 'text-accent' : 'text-tertiary hover:text-primary'
              }`
            }
          >
            Prototype status →
          </NavLink>
          <div>
            <div className="font-mono text-2xs uppercase tracking-[0.12em] text-tertiary">
              Propagator
            </div>
            <div className="mt-1 font-mono text-xs text-secondary">SGP4 / AIAA-2006-6753</div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sweep flex h-[52px] flex-none items-center justify-between gap-4 border-b border-hairline-soft px-5">
          <form
            className="glass lift relative z-10 flex h-[30px] w-full max-w-[340px] items-center gap-2 rounded border border-hairline bg-panel px-[10px] focus-within:border-accent-border"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/console/catalogue?q=${encodeURIComponent(query)}`);
            }}
          >
            <SearchIcon className="flex-none text-tertiary" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search objects, NORAD ID, conjunction ID"
              aria-label="Search objects"
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-primary outline-none"
            />
            <kbd className="flex-none rounded-sm border border-hairline px-[5px] py-px font-mono text-xs- text-tertiary">
              /
            </kbd>
          </form>

          <div className="relative z-10 flex items-center gap-5">
            <div
              className="flex items-center gap-2"
              title={`Snapshot captured ${fmtUTC(new Date(SNAPSHOT_EPOCH))} · oldest element set ${OLDEST_ELSET_DAYS.toFixed(2)} d before that`}
            >
              <span
                className={`h-[6px] w-[6px] flex-none rounded-full ${
                  stale ? 'bg-risk-high' : 'animate-blink bg-risk-low'
                }`}
              />
              <span className="whitespace-nowrap font-mono text-xs- tracking-data text-secondary">
                OLDEST ELSET · {fmtAge(fetchAgeMs)}{stale && ' — STALE'}
              </span>
            </div>

            <span className="hidden h-[18px] w-px bg-hairline lg:block" />
            <span className="num hidden text-xs text-secondary lg:block">
              {fmtUTC(new Date(now))}
            </span>

            <button
              type="button"
              onClick={toggle}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="glass lift rounded border border-hairline bg-panel px-2 py-1 font-mono text-2xs uppercase tracking-label text-tertiary hover:text-primary"
            >
              {theme === 'dark' ? 'Dark' : 'Light'}
            </button>

            <NavLink
              to="/signin"
              title={operator ? `Signed in as ${who}` : 'Not signed in — nothing is authenticated'}
              className="glass lift flex h-[26px] w-[26px] flex-none items-center justify-center rounded border border-hairline bg-panel font-mono text-xs- text-secondary hover:text-primary"
            >
              {operator ? initials(who) : '—'}
            </NavLink>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
