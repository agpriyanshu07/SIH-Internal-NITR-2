import { Link, useParams } from 'react-router-dom';
import { conjunctionById, SCREENING_THRESHOLD_KM } from '../data/conjunctions';
import { PROVENANCE, SNAPSHOT_EPOCH, groupOf } from '../data/objects';
import { OriginBadge } from '../components/Provenance';
import { ScoreModel } from '../components/ScoreModel';
import { Consequence } from '../components/Consequence';
import { conjunctionsToCsv, downloadCsv } from '../data/csv';
import { useAcknowledged } from '../hooks/useAcknowledged';
import { fmtNorad, fmtPc, fmtUTC } from '../data/format';
import { Button, Panel, SeverityChip } from '../components/primitives';
import { SeparationChart } from '../components/SeparationChart';
import { EncounterGeometry } from '../components/EncounterGeometry';
import type { SpaceObject } from '../data/types';
import { Countdown } from '../components/Countdown';

function ObjectSpec({ object, role }: { object: SpaceObject; role: 'Primary' | 'Secondary' }) {
  const rows: [string, string][] = [
    ['Type', object.type],
    ['Operator', object.op],
    // A TLE's international designator carries the launch year, not the day.
    ['Launch year', object.launch],
    ['Mean altitude', `${object.alt} km`],
    ['Apogee / perigee', `${object.apogee} / ${object.perigee} km`],
    ['Inclination', `${object.incl.toFixed(4)}°`],
    ['Period', `${object.period.toFixed(1)} min`],
    // Assumed from object class — real RCS is in the SATCAT, not in a TLE.
    ['Radar cross-section', `${object.rcs} (assumed)`],
    ['TLE epoch age', `${object.age.toFixed(2)} d`],
  ];

  return (
    <div className="glass bg-panel p-[18px]">
      <div
        className={`mb-[14px] font-mono text-2xs uppercase tracking-[0.12em] ${
          role === 'Primary' ? 'text-accent' : 'text-tertiary'
        }`}
      >
        {role} object
      </div>
      <div className="mb-[3px] text-xl font-medium text-primary">{object.name}</div>
      <div className="mb-[18px] font-mono text-xs text-tertiary">
        NORAD {fmtNorad(object.norad)} · {object.intl}
      </div>
      <dl className="flex flex-col">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[130px_1fr] gap-2 border-t border-hairline-soft py-2">
            <dt className="font-mono text-xs- uppercase tracking-[0.08em] text-tertiary">{k}</dt>
            <dd className="num text-sm text-primary">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ConjunctionDetail() {
  const { id = '' } = useParams();
  const { toggle: toggleAck, isAcknowledged } = useAcknowledged();
  const event = conjunctionById(id);
  const ackd = event ? isAcknowledged(event.id) : false;

  if (!event) {
    return (
      <div className="p-10">
        <div className="text-2xl text-primary">Event {id} not found</div>
        <Link to="/console" className="mt-3 inline-block text-sm text-accent">
          Back to conjunction screening
        </Link>
      </div>
    );
  }

  const results: [string, string, string][] = [
    ['Miss distance', event.miss.toFixed(3), 'km'],
    ['Relative velocity', event.relv.toFixed(3), 'km/s'],
    ['Probability of collision', fmtPc(event.pc), ''],
    ['Risk score', String(event.score), '/ 100'],
    ['Assumed 1σ uncertainty', event.sigma.toFixed(2), 'km'],
    ['Oldest element set in pair', event.maxAge.toFixed(1), 'd'],
  ];

  return (
    <div className="flex flex-col">
      <div className="flex h-[52px] flex-none items-center gap-[14px] border-b border-hairline-soft px-6">
        <Link to="/console" className="font-mono text-xs text-tertiary hover:text-primary">
          CONJUNCTIONS
        </Link>
        <span className="font-mono text-xs text-tertiary">/</span>
        <span className="font-mono text-xs text-primary">{event.id}</span>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-hairline-soft px-6 pb-[22px] pt-[26px]">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center gap-[10px]">
            <SeverityChip sev={event.sev} size={9} />
            <span className="h-3 w-px bg-hairline" />
            <span className="font-mono text-xs tracking-data text-tertiary">
              RISK SCORE {event.score}
            </span>
          </div>
          <h1 className="text-4xl font-medium tracking-tighter text-primary">
            {event.A.name} <span className="font-normal text-tertiary">×</span> {event.B.name}
          </h1>
          <p className="font-mono text-sm text-secondary">
            {fmtNorad(event.A.norad)} · {fmtNorad(event.B.norad)} — SGP4 screening of{' '}
            {PROVENANCE.source.split(' (')[0]} captured {fmtUTC(new Date(SNAPSHOT_EPOCH))}
          </p>
        </div>

        <div className="mb-1 flex flex-wrap items-center gap-[6px]">
          <OriginBadge group={groupOf(event.A.norad)} />
          <OriginBadge group={groupOf(event.B.norad)} />
          {ackd && (
            <span
              title="Acknowledged in this browser. There is no backend, so this was not recorded against an operator or sent anywhere."
              className="inline-flex items-center gap-[6px] rounded border border-hairline px-[7px] py-[2px] font-mono text-2xs uppercase tracking-[0.08em] text-tertiary"
            >
              <span className="h-[5px] w-[5px] rounded-full bg-[color:var(--t3)]" />
              Acknowledged
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-start gap-[26px]">
          <div className="flex flex-col items-end gap-[6px]">
            <div className="label">Time to TCA</div>
            <Countdown at={event.tca} className="num text-[27px] tracking-tight text-accent" />
            <div className="num text-xs text-tertiary">{fmtUTC(new Date(event.tca))}</div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              className="px-[14px] py-2 text-sm text-secondary"
              onClick={() =>
                void downloadCsv(
                  `kessler-${event.id}.csv`,
                  conjunctionsToCsv([event]),
                )
              }
            >
              Export report
            </Button>
            <Button
              variant={ackd ? 'secondary' : 'primary'}
              className="px-[14px] py-2 text-sm"
              onClick={() => toggleAck(event.id)}
              aria-pressed={ackd}
            >
              {ackd ? 'Acknowledged' : 'Acknowledge event'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_452px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel
            title={`Separation versus time — ±${40} min about TCA`}
            aside={
              <div className="flex flex-none gap-4 font-mono text-2xs tracking-data text-tertiary">
                <span className="flex items-center gap-[6px]">
                  <span className="h-px w-[14px] bg-accent" />SEPARATION
                </span>
                <span className="hidden items-center gap-[6px] sm:flex">
                  <span className="w-[14px] border-t border-dashed border-risk-high" />
                  THRESHOLD {SCREENING_THRESHOLD_KM.toFixed(1)} km
                </span>
              </div>
            }
          >
            <SeparationChart event={event} />
          </Panel>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-hairline bg-hairline md:grid-cols-2">
            <ObjectSpec object={event.A} role="Primary" />
            <ObjectSpec object={event.B} role="Secondary" />
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="Encounter geometry">
            <EncounterGeometry event={event} />
          </Panel>

          <Panel title="Screening result">
            <div className="px-[14px] pb-[14px] pt-1">
              {results.map(([label, value, unit], i) => (
                <div
                  key={label}
                  className={`grid grid-cols-[1fr_auto] gap-3 py-[11px] ${
                    i < results.length - 1 ? 'border-b border-hairline-soft' : ''
                  }`}
                >
                  <div className="text-sm+ text-secondary">{label}</div>
                  <div className="num text-base text-primary">
                    {value} {unit && <span className="text-xs- text-tertiary">{unit}</span>}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <ScoreModel event={event} />

          {/* Deliberate, prominent disclosure — a feature of the product, not fine print. */}
          <div className="glass lift overflow-hidden rounded-md border border-risk-high bg-panel">
            <div className="flex h-9 items-center gap-[9px] border-b border-risk-high bg-[color:var(--accent-wash)] px-[14px]">
              <span className="h-2 w-2 rounded-xs bg-risk-high" />
              <span className="font-mono text-xs- uppercase tracking-label text-risk-high">
                Data quality and intended use
              </span>
            </div>
            <div className="flex flex-col gap-[13px] p-[14px] pt-4">
              <p className="text-base leading-[1.65] text-secondary [text-wrap:pretty]">
                This result is derived from public two-line element sets propagated with SGP4.
                Positional accuracy is on the order of{' '}
                <span className="font-mono text-primary">1–3 km</span> and degrades with
                element-set age. It is a screening product.
              </p>
              <p className="text-base leading-[1.65] text-secondary [text-wrap:pretty]">
                Two inputs to the probability are assumed rather than measured, because a
                TLE carries neither: the 1σ positional covariance, and each object's radar
                cross-section class. The miss distance and relative velocity above are
                neither — both were propagated. You can vary the σ assumption on the{' '}
                <Link
                  to="/console/thresholds"
                  className="text-secondary underline underline-offset-2 hover:text-primary"
                >
                  thresholds
                </Link>{' '}
                screen and watch this event's severity move.
              </p>
              <p className="text-base leading-[1.65] text-secondary [text-wrap:pretty]">
                It is <span className="text-primary">not</span> a basis for a manoeuvre decision.
                Before acting, request a Conjunction Data Message from the 18th Space Defense
                Squadron or your operator's own covariance-bearing analysis.
              </p>
              <div className="flex flex-col gap-[7px] border-t border-hairline-soft pt-[11px]">
                {[
                  ['Miss distance', 'MEASURED — SGP4 AT REFINED TCA'],
                  ['Relative velocity', 'MEASURED — SGP4 AT REFINED TCA'],
                  ['Covariance', 'NOT AVAILABLE IN TLE'],
                  ['Pc method', `FOSTER, ASSUMED ${event.sigma.toFixed(2)} km σ`],
                  ['Radar cross-section', `${event.A.rcs} / ${event.B.rcs} — ASSUMED FROM CLASS`],
                  ['Element-set age', `${event.maxAge.toFixed(2)} d (oldest in pair)`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <span className="font-mono text-xs- uppercase tracking-[0.08em] text-tertiary">{k}</span>
                    <span className="font-mono text-xs text-secondary">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">
        <Consequence event={event} />
      </div>
    </div>
  );
}
