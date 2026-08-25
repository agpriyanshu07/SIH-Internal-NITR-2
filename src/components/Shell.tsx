import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { fmtAge, fmtUTC } from '../data/format';
import { MoonIcon, PersonIcon, SearchIcon, SunIcon } from './Icon';
import { TextField } from './primitives';
import { useTheme } from '../hooks/useTheme';
import { initials, useOperator } from '../hooks/useOperator';
import { FEATURES, STATUS_LABEL, STATUS_SEV, type Feature } from '../data/features';
import { OBJECTS, SNAPSHOT_EPOCH } from '../data/objects';
import { ClockUTC } from './Countdown';

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
 * that was true no matter what the data was.
 *
 * It is now the MEDIAN age across the screened catalogue, measured from each
 * object's own TLE epoch. Median, not maximum: this snapshot's oldest element
 * set is 30 days old, but that is 26 barely-tracked fragments out of 840, and
 * they are excluded by the default screening floor before they can reach an
 * event. A permanently red "30 d — STALE" would describe objects the operator
 * is not looking at. The tail is in the tooltip, where it belongs.
 */
const ELSET_AGES = OBJECTS.map((o) => o.age).sort((a, b) => a - b);
const MEDIAN_ELSET_DAYS = ELSET_AGES[Math.floor(ELSET_AGES.length / 2)] ?? 0;
const OLDEST_ELSET_DAYS = ELSET_AGES[ELSET_AGES.length - 1] ?? 0;
const STALE_COUNT = ELSET_AGES.filter((a) => a > 3).length;
const MEDIAN_ELSET_MS = MEDIAN_ELSET_DAYS * 86400000;

/** Beyond three days a TLE has drifted far enough to warrant flagging. */
const STALE_AFTER_MS = 3 * 86400000;

const NAV_GROUPS: { label: string; ids: string[] }[] = [
  { label: 'Operations', ids: ['conjunctions', 'viewer', 'catalogue', 'manoeuvres', 'consequence'] },
  { label: 'Configuration', ids: ['thresholds', 'assets', 'alerts'] },
];

/*
 * No .glass on nav rows.
 *
 * `hover:glass` put a backdrop-filter on whichever row the pointer was over,
 * which means the browser promotes a new compositing layer and blurs a fresh
 * region on every row the pointer crosses — the whole sidebar, on any pass
 * through it. The sidebar itself is glass over the gradient blobs; a 200x36
 * row sitting on that already-blurred surface has nothing left to blur, so
 * the effect was invisible and only the cost was real. bg-panel-raised keeps
 * the active row reading exactly as it did.
 */
const navClass = (active: boolean) =>
  `block rounded px-2 py-2 text-base ${
    active
      ? 'lift bg-panel-raised text-primary shadow-[inset_2px_0_0_0_var(--accent)]'
      : 'text-secondary hover:bg-panel hover:text-primary'
  }`;

/**
 * Status chip, from the registry rather than from the routing table.
 *
 * This used to read `Not built` whenever a feature had no `to`, which is a
 * question about the router, not about the capability. The asset register is
 * `partial` — its ISRO fleet filter is real and works — and it was labelled
 * NOT BUILT in the sidebar, identically to alert routing and API keys, which
 * genuinely are not built. The registry says one thing and the sidebar said
 * another, on the one project whose argument is that it does not do that.
 *
 * Same `data-sev` + `text-sev` chip Status.tsx and Thresholds.tsx already use,
 * so all three read the same colour for the same status.
 */
const StatusChip = ({ status }: { status: Feature['status'] }) => (
  <span
    data-sev={STATUS_SEV[status]}
    /*
     * `not-built` maps to the NOMINAL severity colour, which is deliberately
     * the quietest thing on the palette — and at 8.5px over the console's
     * backdrop it measured 3.6:1, below AA. It was ten of the thirteen
     * remaining failures after the token lift, and they were introduced by
     * this chip. Tertiary is muted enough to keep NOT BUILT reading as the
     * least urgent state without printing it in a colour nobody can read.
     */
    className={`flex-none rounded-sm border border-hairline px-[5px] py-px font-mono text-[8.5px] uppercase tracking-[0.08em] ${
      status === 'not-built' ? 'text-tertiary' : 'text-sev'
    }`}
  >
    {STATUS_LABEL[status]}
  </span>
);

function NavItem({ feature }: { feature: Feature }) {
  // Router location, not window.location: under a hash router the query string
  // lives inside the fragment, and useLocation is what parses it out.
  const { search } = useLocation();
  // A chip on every row would be noise: `live` is the default and says nothing.
  const chip = feature.status === 'live' ? null : <StatusChip status={feature.status} />;

  if (!feature.to) {
    return (
      <div
        title={feature.note}
        className="flex cursor-default items-center justify-between gap-2 rounded px-2 py-2 text-base text-tertiary"
      >
        <span className="truncate opacity-70">{feature.label}</span>
        {chip}
      </div>
    );
  }

  return (
    <NavLink
      to={feature.to}
      end={feature.to === '/console'}
      title={feature.note}
      className={({ isActive }) =>
        `${navClass(isActive && matchesQuery(feature.to!, search))} flex items-center justify-between gap-2`
      }
    >
      <span className="truncate">{feature.label}</span>
      {chip}
    </NavLink>
  );
}

/**
 * NavLink decides active on pathname alone, and two entries now share a path:
 * the catalogue, and the asset register that is the catalogue with ?isro=1.
 * Without this both highlight at once, which reads as a bug even though both
 * genuinely point at the same screen. So the query string is compared too —
 * an entry that names a parameter is active only when it is set, and an entry
 * that names none is active only when it is not.
 */
function matchesQuery(to: string, search: string): boolean {
  const want = new URLSearchParams(to.split('?')[1] ?? '');
  const have = new URLSearchParams(search);
  for (const [k, v] of want) if (have.get(k) !== v) return false;
  for (const k of have.keys()) if (k !== 'q' && !want.has(k)) return false;
  return true;
}

export function Shell() {
  /*
   * Marks the document while a console route is mounted, so index.css can lift
   * --t3 here and leave the landing page alone. On the root element rather than
   * a wrapper because the tokens are declared on :root and a custom property
   * has to be overridden where it is defined, not below it.
   */
  useEffect(() => {
    document.documentElement.dataset.ksurface = 'console';
    return () => {
      delete document.documentElement.dataset.ksurface;
    };
  }, []);

  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  /*
   * Scroll position on navigation.
   *
   * <main> is the scroll container, not the window, so nothing resets it: page
   * down to row 200 of the catalogue, open an event, and the detail page opens
   * eight screens down showing whitespace. It reads as a broken route.
   *
   * Keyed on pathname alone, deliberately. The catalogue writes its filter and
   * its ISRO toggle into the query string on every keystroke; resetting on the
   * full location would yank the table to the top as you type.
   *
   * Focus moves with it. A keyboard user who follows a link is otherwise left
   * with focus on an element that no longer exists, and the next Tab restarts
   * from the top of the sidebar — every route change costing a walk back
   * through the whole nav. Moving it to the region and marking that region
   * tabindex=-1 also gives a screen reader something to announce on arrival.
   * preventScroll, or the browser undoes the line above it.
   *
   * Not on first mount, though — and this is the part that is easy to get
   * wrong. Focusing the content region on arrival puts the skip link BEHIND
   * the caret, so the first Tab of the session lands somewhere in the page and
   * the skip link can never be reached at all. On a fresh load focus belongs
   * where the browser put it, at the top of the document; the move is only
   * worth making when focus would otherwise be stranded on a link that the
   * navigation just unmounted.
   */
  const firstRender = useRef(true);
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);
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

  const fetchAgeMs = MEDIAN_ELSET_MS;
  const stale = fetchAgeMs > STALE_AFTER_MS;
  const who = operator?.name ?? 'Signed out';

  return (
    <div className="grid h-screen grid-cols-1 md:grid-cols-[196px_minmax(0,1fr)]">
      {/*
       * Every keyboard session on this console starts with eleven Tab presses
       * through the sidebar before reaching anything on the page. This is the
       * standard escape: invisible until focused, first in the tab order, and
       * it moves focus into the content region rather than only scrolling to
       * it. sr-only rather than display:none — a hidden element cannot receive
       * focus, so the usual mistake here is one that removes the feature.
       */}
      <a
        href="#console-main"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
        className="sr-only z-50 focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:rounded focus:border focus:border-accent-border focus:bg-panel-raised focus:px-3 focus:py-2 focus:text-sm focus:text-primary"
      >
        Skip to content
      </a>
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

      {/*
       * min-h-0 alongside min-w-0, and it is not decoration.
       *
       * This column is a grid item, and a grid item's automatic minimum size is
       * its CONTENT, not its track. So this div was 133,910px tall inside an
       * h-screen grid, <main>'s `flex-1 overflow-auto` had a 133,858px box to
       * be an overflow container for, and it therefore never scrolled: the
       * document did. Which meant that scrolling the conjunction table scrolled
       * the sidebar, the top bar and the table's own sticky header off the top
       * of the window, and left the operator looking at unlabelled rows with no
       * navigation. min-w-0 was already here for the same reason on the other
       * axis — the row of numbers that refused to shrink.
       */}
      <div className="flex min-h-0 min-w-0 flex-col">
        <header className="sweep flex h-[52px] flex-none items-center justify-between gap-4 border-b border-hairline-soft px-5">
          <form
            className="relative z-10 w-full max-w-[340px]"
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/console/catalogue?q=${encodeURIComponent(query)}`);
            }}
          >
            <TextField
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search objects, NORAD ID, conjunction ID"
              aria-label="Search objects"
              className="lift h-[30px] px-[10px]"
              icon={<SearchIcon className="flex-none text-tertiary" />}
              trailing={
                <kbd className="flex-none rounded-sm border border-hairline px-[5px] py-px font-mono text-xs- text-tertiary">
                  /
                </kbd>
              }
            />
          </form>

          <div className="relative z-10 flex items-center gap-5">
            <div
              className="flex items-center gap-2"
              title={
                `Snapshot captured ${fmtUTC(new Date(SNAPSHOT_EPOCH))}. ` +
                `Median element set ${MEDIAN_ELSET_DAYS.toFixed(2)} d old, oldest ${OLDEST_ELSET_DAYS.toFixed(2)} d; ` +
                `${STALE_COUNT} of ${ELSET_AGES.length} objects over 3 d.`
              }
            >
              <span
                className={`h-[6px] w-[6px] flex-none rounded-full ${
                  stale ? 'bg-risk-high' : 'animate-blink bg-risk-low'
                }`}
              />
              <span className="whitespace-nowrap font-mono text-xs- tracking-data text-secondary">
                MEDIAN ELSET · {fmtAge(fetchAgeMs)}{stale && ' — STALE'}
              </span>
            </div>

            <span className="hidden h-[18px] w-px bg-hairline lg:block" />
            <ClockUTC className="num hidden text-xs text-secondary lg:block" />

            <button
              type="button"
              onClick={toggle}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="lift flex items-center gap-[6px] rounded border border-hairline bg-panel px-2 py-1 font-mono text-2xs uppercase tracking-label text-tertiary transition-colors hover:border-[color:var(--t3)] hover:text-primary"
            >
              {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
              <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
            </button>

            <NavLink
              to="/signin"
              title={operator ? `Signed in as ${who}` : 'Not signed in — nothing is authenticated'}
              className="lift flex h-[26px] w-[26px] flex-none items-center justify-center rounded border border-hairline bg-panel font-mono text-xs- text-secondary hover:text-primary"
            >
              {operator ? initials(who) : <PersonIcon className="text-tertiary" />}
            </NavLink>
          </div>
        </header>

        <main
          ref={mainRef}
          id="console-main"
          /* -1, not 0: this is a focus TARGET for the skip link and the
             route-change move above, and it must not become a tab stop of its
             own on the way through the page. */
          tabIndex={-1}
          className="min-h-0 flex-1 overflow-auto outline-none"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
