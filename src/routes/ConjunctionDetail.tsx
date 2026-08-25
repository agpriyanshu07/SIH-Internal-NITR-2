import { Link, useParams } from 'react-router-dom';
import { conjunctionById, SCREENING_THRESHOLD_KM } from '../data/conjunctions';
import { PROVENANCE, SNAPSHOT_EPOCH, groupOf } from '../data/objects';
import { OriginBadge } from '../components/Provenance';
import { ScoreModel } from '../components/ScoreModel';
import { SigmaSensitivity } from '../components/SigmaSensitivity';
import { Consequence } from '../components/Consequence';
import { conjunctionsToCsv, downloadCsv, downloadText } from '../data/csv';
import { toCdmKvn } from '../data/cdm';
import { useAcknowledged } from '../hooks/useAcknowledged';
import { fmtNorad, fmtPc, fmtUTC } from '../data/format';
import { Button, Panel, SeverityChip } from '../components/primitives';
import { SeparationChart } from '../components/SeparationChart';
import { EncounterGeometry } from '../components/EncounterGeometry';
import type { SpaceObject } from '../data/types';
import { Countdown } from '../components/Countdown';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

function ObjectSpec({ object, role }: { object: SpaceObject; role: 'Primary' | 'Secondary' }) {
  /*
   * Three clusters rather than nine identical rows, matching the catalogue
   * drawer. What the object IS, where it is GOING, and how much of either to
   * trust are three different questions, and rendering them at one weight in
   * one column made the panel scan as a form rather than a readout.
   */
  const groups: { label: string; rows: [string, string][] }[] = [
    {
      label: 'Identity',
      rows: [
        ['Type', object.type],
        ['Operator', object.op],
        // A TLE's international designator carries the launch year, not the day.
        ['Launch year', object.launch],
      ],
    },
    {
      label: 'Orbit',
      rows: [
        ['Mean altitude', `${object.alt} km`],
        ['Apogee / perigee', `${object.apogee} / ${object.perigee} km`],
        ['Inclination', `${object.incl.toFixed(4)}°`],
        ['Period', `${object.period.toFixed(1)} min`],
      ],
    },
    {
      label: 'Data quality',
      rows: [
        // Assumed from object class — real RCS is in the SATCAT, not in a TLE.
        ['Radar cross-section', `${object.rcs} (assumed)`],
        ['TLE epoch age', `${object.age.toFixed(2)} d`],
      ],
    },
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
      {groups.map((g) => (
        <section key={g.label} className="mb-[14px] last:mb-0">
          <div className="label mb-[6px]">{g.label}</div>
          <dl className="flex flex-col rounded border border-hairline-soft bg-deep px-[10px]">
            {g.rows.map(([k, v]) => (
              <div
                key={k}
                className="grid grid-cols-[128px_1fr] gap-2 py-[7px] [&+&]:border-t [&+&]:border-hairline-soft"
              >
                <dt className="font-mono text-xs- uppercase tracking-[0.08em] text-tertiary">{k}</dt>
                <dd className="num text-sm text-primary">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

export function ConjunctionDetail() {
  const { id = '' } = useParams();
  const { toggle: toggleAck, isAcknowledged } = useAcknowledged();
  const event = conjunctionById(id);
  /*
   * Named after the pair, not after the ID. Someone comparing two events has
   * both open, and "CJ-33764-34874" in a truncated tab tells them nothing that
   * "ISS (ZARYA) x ..." does not tell them better. Called before the missing-
   * event branch below, because a hook cannot sit behind a return.
   */
  useDocumentTitle(event ? `${event.A.name} \u00d7 ${event.B.name}` : 'Event not found');
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
          {/*
           * Rendered in both states, hidden rather than absent when it does not
           * apply — because ADDING it on click was relaying out the whole page.
           *
           * This chip is 101px wide. It sits in a badge row that is a sibling of
           * the title block and the button group inside a `flex-wrap` header, so
           * between 1460px and 1540px those 101px were exactly enough to push
           * the header from one line to two: 142px tall to 245px, and every
           * panel on the screen jumped 104px down at the instant of the click.
           * Measured at 20px increments from 1240 to 1620px — it reproduces on
           * that band and nowhere else, which is why it reads as intermittent.
           *
           * `invisible` is visibility:hidden, which keeps the box in layout and
           * takes the element out of the accessibility tree, so the row is the
           * same width in both states and a screen reader is not told about an
           * acknowledgement that has not happened. `display:none` — which is
           * what a conditional render compiles to — is the thing that cannot
           * work here, because reserving the space is the entire fix.
           */}
          <span
            aria-hidden={!ackd}
            title={
              ackd
                ? 'Acknowledged in this browser. There is no backend, so this was not recorded against an operator or sent anywhere.'
                : undefined
            }
            className={`inline-flex items-center gap-[6px] rounded border border-hairline px-[7px] py-[2px] font-mono text-2xs uppercase tracking-[0.08em] text-tertiary ${
              ackd ? '' : 'invisible'
            }`}
          >
            <span className="h-[5px] w-[5px] rounded-full bg-[color:var(--t3)]" />
            Acknowledged
          </span>
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
              Export CSV
            </Button>
            {/*
             * The format the field actually exchanges. Everything a CDM
             * requires was already computed here; this hands it over in the
             * form an operator's existing tooling can read, with
             * COVARIANCE_METHOD = DEFAULT on both objects so the assumption
             * survives the trip out of this application.
             */}
            <Button
              className="px-[14px] py-2 text-sm text-secondary"
              title="CCSDS 508.0-B-1 Conjunction Data Message. Covariance is declared DEFAULT, because ours is assumed rather than determined."
              onClick={() =>
                void downloadText(
                  `${event.id}.cdm`,
                  toCdmKvn(event, { snapshotEpochMs: SNAPSHOT_EPOCH }),
                  'text/plain',
                )
              }
            >
              Export CDM
            </Button>
            <Button
              variant={ackd ? 'secondary' : 'primary'}
              /*
               * min-w sized to the longer of the two labels. "Acknowledge event"
               * is 141px and "Acknowledged" is 112px, and a control that changes
               * size when you press it is unpleasant on its own account — the
               * button moves out from under the cursor. This is not what caused
               * the page-wide jump; that was the chip above. Both are fixed, and
               * both are the same rule: a state change must not resize a box
               * that something else is laid out against.
               */
              className="min-w-[152px] px-[14px] py-2 text-sm"
              onClick={() => toggleAck(event.id)}
              aria-pressed={ackd}
            >
              {ackd ? 'Acknowledged' : 'Acknowledge event'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_452px]">
        {/*
         * Same defect as the analysis workbench, same fix. This column holds the
         * separation chart and the two object specs and ends around 800px; the
         * column beside it — score model, sigma sensitivity, data quality — runs
         * past 1,700px. Everything below the fold was a wall of prose in a
         * 452px gutter with 900px of empty page to its left.
         *
         * The chart is exactly what you want pinned while you read that prose:
         * the sigma-sensitivity panel talks about where this event sits against
         * the threshold, and the threshold is the dashed line on the chart.
         */}
        <div className="flex min-w-0 flex-col gap-6 xl:sticky xl:top-0 xl:max-h-[calc(100vh-100px)] xl:overflow-y-auto xl:pr-1">
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

          <Panel
            title="Sensitivity to the assumed covariance"
            aside={
              <Link
                to="/console/thresholds"
                className="font-mono text-2xs uppercase tracking-label text-tertiary hover:text-primary"
              >
                Adjust σ →
              </Link>
            }
          >
            <SigmaSensitivity event={event} />
          </Panel>

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
