import { Link } from 'react-router-dom';
import { HeroOrbits } from '../components/HeroOrbits';
import { Button } from '../components/primitives';

const HERO_STATS = [
  ['34,182', 'Objects tracked'],
  ['1.2 M', 'Pairs screened / 24 h'],
  ['6 min', 'TLE fetch cadence'],
] as const;

const PROBLEM_FIGURES = [
  ['30,000', '+', '', 'Objects large enough to be tracked from the ground.'],
  ['7.5', '', 'km/s', 'Typical orbital velocity in LEO. Closing speeds reach twice that.'],
  ['1', '', 'cm', 'A fragment this size carries roughly the kinetic energy of a hand grenade.'],
] as const;

const STEPS = [
  ['01', 'Ingest public element sets',
   'Two-line element sets are pulled from public catalogues every six minutes, validated, and stored with their epoch so the age of every state vector is known and shown.'],
  ['02', 'Propagate and screen',
   'Every object is propagated with SGP4 across a seven-day horizon. A coarse apogee–perigee filter removes impossible pairs before fine screening resolves each time of closest approach.'],
  ['03', 'Rank and alert',
   'Miss distance, relative velocity and collision probability are combined into a single ranked list. Events crossing your thresholds reach you by email, webhook or API.'],
] as const;

const PRINCIPLES = [
  ['Open inputs',
   'Built on public catalogue data. No licence negotiation, no minimum contract, no data you cannot inspect yourself.'],
  ['Stated uncertainty',
   'Every result carries its element-set age and an accuracy band. We publish what the method cannot tell you alongside what it can.'],
  ['Reachable by a cubesat team',
   'A university group flying one 3U spacecraft gets the same screening pipeline as an operator with four hundred satellites.'],
  ['Reproducible',
   'Each conjunction record includes the element sets and propagator settings used, so any result can be recomputed independently.'],
] as const;

const Eyebrow = ({ children }: { children: string }) => (
  <div className="font-mono text-2xs uppercase tracking-eyebrow text-accent">{children}</div>
);

export function Landing() {
  return (
    <div className="min-h-screen">
      <div className="glass lift mx-auto w-full max-w-[1440px] border-x border-hairline bg-ground">
        {/* Nav */}
        <header className="flex h-[60px] items-center justify-between border-b border-hairline-soft px-6 lg:px-10">
          <div className="flex items-center gap-9">
            <span className="text-lg font-semibold tracking-[0.04em] text-primary">KESSLER</span>
            <nav className="hidden gap-[26px] text-base text-secondary md:flex">
              {['Platform', 'Methodology', 'Data sources', 'Docs'].map((l) => (
                <span key={l} className="cursor-default">{l}</span>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/signin" className="hidden sm:block">
              <Button className="px-[14px] py-[7px] text-sm">Sign in</Button>
            </Link>
            <Link to="/console">
              <Button variant="primary" className="px-[14px] py-[7px] text-sm">Launch console</Button>
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="grid items-center gap-14 px-6 py-16 lg:grid-cols-[1fr_minmax(0,620px)] lg:px-10 lg:py-[88px]">
          <div className="flex flex-col gap-[26px]">
            <div className="label tracking-eyebrow">Conjunction screening — Low Earth Orbit</div>
            <h1 className="text-[clamp(38px,5.4vw,60px)] font-semibold leading-[1.02] tracking-display text-primary">
              Know which<br />close approach<br />matters.
            </h1>
            <p className="max-w-[480px] text-xl leading-[1.6] text-secondary [text-wrap:pretty]">
              Orbital conjunction screening, open to everyone. KESSLER ingests public element
              sets, propagates every tracked object in Low Earth Orbit, and ranks the close
              approaches that warrant an operator's attention.
            </p>
            <div className="flex flex-wrap gap-3 pt-[6px]">
              <Link to="/console">
                <Button variant="primary" className="px-5 py-[11px] text-base">Screen your catalogue</Button>
              </Link>
              <Button className="px-5 py-[11px] text-base">Read the method</Button>
            </div>
            <dl className="mt-[14px] flex flex-wrap gap-8 border-t border-hairline-soft pt-[22px]">
              {HERO_STATS.map(([value, label]) => (
                <div key={label} className="flex flex-col gap-[5px]">
                  <dt className="num text-[21px] text-primary">{value}</dt>
                  <dd className="label">{label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="glass lift relative h-[380px] overflow-hidden rounded-md border border-hairline-soft bg-deep lg:h-[520px]">
            <HeroOrbits />
            <div className="absolute left-4 top-[14px] label">
              LEO — 200 to 2000 km · propagated live
            </div>
            <div className="absolute bottom-[14px] left-4 flex gap-[18px] font-mono text-2xs text-tertiary">
              <span>PAYLOAD</span><span>ROCKET BODY</span><span>DEBRIS</span>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="border-t border-hairline-soft px-6 py-16 lg:px-10 lg:py-[76px]">
          <div className="grid items-start gap-14 lg:grid-cols-[400px_1fr]">
            <div className="flex flex-col gap-[14px]">
              <Eyebrow>The problem</Eyebrow>
              <h2 className="text-4xl font-semibold tracking-tighter text-primary">
                Orbit is a shared resource with no traffic control.
              </h2>
            </div>
            <div className="flex flex-col gap-[22px] pt-1">
              <p className="max-w-[620px] text-lg leading-[1.72] text-secondary [text-wrap:pretty]">
                In February 2009 the Iridium 33 communications satellite struck the derelict
                Cosmos 2251 at a closing speed near 11.7 km/s. The collision produced more than
                1,800 catalogued fragments, most of which are still in orbit. Every one of them
                is now something else to screen against.
              </p>
              <div className="grid max-w-[620px] grid-cols-1 gap-px overflow-hidden rounded-md border border-hairline bg-hairline sm:grid-cols-3">
                {PROBLEM_FIGURES.map(([value, plus, unit, note]) => (
                  <div key={note} className="glass bg-panel p-5">
                    <div className="num text-[26px] text-primary">
                      {value}
                      {plus && <span className="text-[16px] text-tertiary">{plus}</span>}
                      {unit && <span className="ml-1 text-md text-tertiary">{unit}</span>}
                    </div>
                    <p className="mt-2 text-sm leading-[1.5] text-secondary">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-hairline-soft px-6 py-16 lg:px-10 lg:py-[76px]">
          <div className="mb-[34px]"><Eyebrow>How it works</Eyebrow></div>
          <div className="grid gap-10 md:grid-cols-3">
            {STEPS.map(([n, title, body]) => (
              <div key={n} className="flex flex-col gap-[14px] border-t border-hairline pt-5">
                <div className="font-mono text-xs tracking-label text-accent">{n}</div>
                <h3 className="text-2xl font-medium tracking-tight text-primary">{title}</h3>
                <p className="text-md leading-[1.65] text-secondary [text-wrap:pretty]">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why this exists */}
        <section className="grid items-start gap-14 border-t border-hairline-soft px-6 py-16 lg:grid-cols-[400px_1fr] lg:px-10 lg:py-[76px]">
          <div className="flex flex-col gap-[14px]">
            <Eyebrow>Why this exists</Eyebrow>
            <h2 className="text-4xl font-semibold tracking-tighter text-primary">
              Screening should not be a procurement decision.
            </h2>
          </div>
          <dl className="flex flex-col">
            {PRINCIPLES.map(([term, body], i) => (
              <div key={term}
                   className={`grid gap-7 border-t border-hairline py-[22px] sm:grid-cols-[190px_1fr] ${
                     i === PRINCIPLES.length - 1 ? 'border-b' : ''}`}>
                <dt className="text-md font-medium text-primary">{term}</dt>
                <dd className="max-w-[560px] text-md leading-[1.65] text-secondary">{body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-hairline-soft px-6 py-[34px] lg:px-10">
          <div className="flex items-center gap-5">
            <span className="text-sm font-semibold tracking-[0.04em] text-secondary">KESSLER</span>
            <span className="font-mono text-2xs text-tertiary">Orbital conjunction screening</span>
          </div>
          <div className="flex gap-[22px] text-sm text-tertiary">
            {['Method', 'API', 'Status', 'Contact'].map((l) => <span key={l}>{l}</span>)}
          </div>
        </footer>

        <div className="border-t border-hairline-soft px-6 py-4 lg:px-10">
          <p className="font-mono text-2xs uppercase tracking-[0.08em] text-tertiary">
            Prototype · all data on this site is synthetic
          </p>
        </div>
      </div>
    </div>
  );
}
