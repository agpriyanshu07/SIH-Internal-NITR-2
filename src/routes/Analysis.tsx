import { useMemo, useState } from 'react';
import { RESOLVED } from '../data/conjunctions';
import { analyseConsequence, type ConsequenceOptions } from '../data/consequence';
import { assumedMass } from '../data/engine/breakup';
import { DEFAULT_MATERIAL_MIX } from '../data/engine/thermal';
import { entryById } from '../data/objects';
import { fmtInt } from '../data/format';
import { downloadCsv } from '../data/csv';
import { Button, Panel, Select } from '../components/primitives';
import { LatitudePlot } from '../components/LatitudePlot';
import { GabbardPlot } from '../components/GabbardPlot';
import { CascadeRisk } from '../components/CascadeRisk';
import { sliderFill } from '../lib/slider';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/**
 * Consequence analysis workbench.
 *
 * The detail view's consequence panel answers "what would this collision do?"
 * with one set of assumptions. This screen exists because the honest answer to
 * that question is a range, and the range is set by inputs nobody can measure
 * from a TLE — the objects' masses, what their fragments are made of, and how
 * active the Sun happens to be.
 *
 * So every one of those is a control here rather than a constant, and the
 * fragment-level output is exportable. An assumption you can sweep is a
 * finding; an assumption buried in a constant is a claim.
 */

function Field({
  label,
  hint,
  value,
  children,
}: {
  label: string;
  hint?: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[7px] border-t border-hairline-soft py-[13px]">
      <div className="flex items-baseline justify-between gap-3">
        <span className="label">{label}</span>
        <span className="num flex-none text-sm text-primary">{value}</span>
      </div>
      {children}
      {hint && (
        <p className="text-xs- leading-[1.5] text-tertiary [text-wrap:pretty]">{hint}</p>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  hint,
  accent = false,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="label">{label}</div>
      <div className={`num text-lg ${accent ? 'text-accent' : 'text-primary'}`}>
        {value}
        {unit && <span className="ml-1 text-xs- text-tertiary">{unit}</span>}
      </div>
      {hint && <div className="num text-2xs text-tertiary">{hint}</div>}
    </div>
  );
}

export function Analysis() {
  useDocumentTitle('Consequence analysis');
  // Default to the highest-scoring event that has both element sets available.
  const candidates = useMemo(
    () => [...RESOLVED].sort((a, b) => b.score - a.score).slice(0, 40),
    [],
  );
  const [eventId, setEventId] = useState<string>('');
  const event = candidates.find((c) => c.id === eventId) ?? candidates[0];

  const A = event ? entryById(event.a) : undefined;
  const B = event ? entryById(event.b) : undefined;

  const defaultMassA = A ? assumedMass(A.group) : 1000;
  const defaultMassB = B ? assumedMass(B.group) : 1;

  const [massA, setMassA] = useState<number | null>(null);
  const [massB, setMassB] = useState<number | null>(null);
  const [cd, setCd] = useState(2.2);
  const [solar, setSolar] = useState(1);
  const [entryAngle, setEntryAngle] = useState(0.1);
  const [alFrac, setAlFrac] = useState(DEFAULT_MATERIAL_MIX.aluminium);

  // Aluminium's share is the control; the remainder keeps the other three in
  // their default proportions, so one slider spans the useful range.
  const materialMix = useMemo(() => {
    const rest = 1 - alFrac;
    const others = { titanium: 0.08, steel: 0.1, cfrp: 0.2 };
    const sum = others.titanium + others.steel + others.cfrp;
    return {
      aluminium: alFrac,
      titanium: (others.titanium / sum) * rest,
      steel: (others.steel / sum) * rest,
      cfrp: (others.cfrp / sum) * rest,
    };
  }, [alFrac]);

  /*
   * Resolved once: the label, the input's value and the slider's fill all have
   * to agree, and reading them off `opts` reintroduces the optional type for no
   * benefit.
   */
  const massTarget = massA ?? defaultMassA;
  const massProjectile = massB ?? defaultMassB;

  const opts: ConsequenceOptions = useMemo(
    () => ({
      massTargetKg: massTarget,
      massProjectileKg: massProjectile,
      cd,
      solarActivity: solar,
      entryAngleDeg: entryAngle,
      materialMix,
    }),
    [massTarget, massProjectile, cd, solar, entryAngle, materialMix],
  );

  const result = useMemo(
    () => (event && A && B ? analyseConsequence(event, A, B, opts) : null),
    [event, A, B, opts],
  );

  if (!event || !result) {
    return (
      <div className="p-6 text-base text-secondary">
        No screened event has both element sets available to analyse.
      </div>
    );
  }

  const { impact: imp, breakup: bk } = result;
  const meanDv =
    result.fragments.reduce((s, f) => s + f.dvMs, 0) /
    Math.max(1, result.fragments.length);
  // A correction comparable to the ejection speeds means the sample is too
  // small for its statistics to mean anything.
  const sampleWeak = result.momentumResidualMs > meanDv * 0.25;

  const exportFragments = () => {
    const rows = [
      [
        'index', 'characteristic_length_m', 'mass_kg', 'area_m2', 'area_to_mass_m2_per_kg',
        'ejection_dv_m_s', 'material', 'perigee_km', 'apogee_km', 'inclination_deg',
        'nodal_precession_deg_per_day', 'lifetime_days', 'lifetime_band',
        'immediate_reentry', 'peak_heat_flux_W_m2', 'peak_heating_alt_km',
        'melt_fraction', 'demised', 'demise_alt_km', 'terminal_velocity_m_s',
      ].join(','),
      ...result.fragments.map((f, i) =>
        [
          i, f.lc, f.mass, f.area, f.aOverM, f.dvMs, f.material,
          f.perigee, f.apogee, f.incl, f.nodalDegPerDay,
          Number.isFinite(f.lifetimeDays) ? f.lifetimeDays : '', f.band,
          f.immediate, f.entry.peakFluxWm2, f.entry.peakAltKm,
          f.entry.meltFraction, f.entry.demised, f.entry.demiseAltKm ?? '',
          f.entry.terminalMs,
        ].join(','),
      ),
    ].join('\r\n');
    void downloadCsv(`kessler-fragments-${event.id}.csv`, rows);
  };

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-[5px]">
          <h1 className="text-2xl font-medium tracking-tight text-primary">
            Consequence analysis
          </h1>
          <p className="font-mono text-xs text-tertiary">
            Breakup, orbital decay and re-entry survival · every assumption is an
            input, not a constant
          </p>
        </div>
        <Button className="px-[13px] py-[7px] text-sm text-secondary" onClick={exportFragments}>
          Export fragments ({result.fragments.length})
        </Button>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        {/*
         * The controls follow you down the page.
         *
         * This column is ~700px of sliders; the results column beside it runs
         * to about 4,000px. So for five sixths of the scroll there was nothing
         * at all on the left of the screen and every word of the analysis was
         * crammed into the right-hand two thirds — the reading column narrow,
         * a third of a 1600px display blank.
         *
         * Sticky fixes the dead space and is the better interaction anyway.
         * This is a workbench: the entire argument of the screen is that you
         * change an assumption and watch the consequence move. Having to scroll
         * 3,000px back to the drag coefficient, change it, and scroll down again
         * to see what it did is the workbench failing at its one job.
         *
         * items-start on the grid is what allows it: a grid item stretches to
         * the row height by default, which makes the column as tall as the
         * results and leaves sticky with nothing to stick within.
         *
         * max-h/overflow-y for the case where the controls are taller than the
         * window — they scroll inside themselves rather than becoming
         * unreachable. top-0 is against <main>, which is the scroll container.
         */}
        <div className="flex flex-col gap-5 xl:sticky xl:top-0 xl:max-h-[calc(100vh-92px)] xl:overflow-y-auto xl:pr-1">
          <Panel title="Scenario" bodyClassName="px-[14px] pb-[14px] pt-1">
            <div className="flex flex-col gap-[7px] pt-3">
              <label htmlFor="ev" className="label">Event</label>
              <Select
                id="ev"
                value={event.id}
                onChange={(e) => setEventId(e.target.value)}
                className="py-2 pl-3 font-mono text-xs"
              >
                {candidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.sev} · {c.relv.toFixed(1)} km/s · {c.A.name} × {c.B.name}
                  </option>
                ))}
              </Select>
            </div>

            <Field
              label="Target mass"
              value={`${fmtInt(massTarget)} kg`}
              hint="A TLE carries no mass. Fragment count scales as mass^0.75, so this is the single most consequential input on the screen."
            >
              <input type="range" min={1} max={20000} step={1}
                     value={massTarget} onChange={(e) => setMassA(+e.target.value)}
                     aria-label="Target mass in kilograms" style={sliderFill(massTarget, 1, 20000)}
              className="k-slider" />
            </Field>

            <Field label="Projectile mass" value={`${massProjectile.toFixed(1)} kg`}>
              <input type="range" min={0.1} max={2000} step={0.1}
                     value={massProjectile} onChange={(e) => setMassB(+e.target.value)}
                     aria-label="Projectile mass in kilograms" style={sliderFill(massProjectile, 0.1, 2000)}
              className="k-slider" />
            </Field>

            <Field
              label="Aluminium fraction"
              value={`${(alFrac * 100).toFixed(0)} %`}
              hint="Aluminium demises readily; titanium and steel are the survivors. The remainder keeps the other three materials in proportion."
            >
              <input type="range" min={0} max={1} step={0.01} value={alFrac}
                     onChange={(e) => setAlFrac(+e.target.value)}
                     aria-label="Aluminium fraction of the fragment mix" style={sliderFill(alFrac, 0, 1)}
              className="k-slider" />
            </Field>

            <Field
              label="Solar activity"
              value={`${solar.toFixed(2)}×`}
              hint="Multiplier on atmospheric density. Density at these altitudes swings by more than ten times across the solar cycle, and it acts directly on orbital lifetime."
            >
              <input type="range" min={0.3} max={3} step={0.05} value={solar}
                     onChange={(e) => setSolar(+e.target.value)}
                     aria-label="Solar activity density multiplier" style={sliderFill(solar, 0.3, 3)}
              className="k-slider" />
            </Field>

            <Field
              label="Entry angle"
              value={`${entryAngle.toFixed(2)}°`}
              hint="Flight path below local horizontal. Natural decay enters at about 0.1°, and shallower means longer in the heat pulse."
            >
              <input type="range" min={0.02} max={2} step={0.01} value={entryAngle}
                     onChange={(e) => setEntryAngle(+e.target.value)}
                     aria-label="Entry flight path angle in degrees" style={sliderFill(entryAngle, 0.02, 2)}
              className="k-slider" />
            </Field>

            <Field label="Drag coefficient" value={cd.toFixed(2)}>
              <input type="range" min={1.5} max={3} step={0.05} value={cd}
                     onChange={(e) => setCd(+e.target.value)}
                     aria-label="Drag coefficient" style={sliderFill(cd, 1.5, 3)}
              className="k-slider" />
            </Field>
          </Panel>

          <Panel title="Model diagnostics" bodyClassName="flex flex-col gap-3 p-[14px]">
            <Stat
              label="Momentum correction"
              value={result.momentumResidualMs.toFixed(1)}
              unit="m/s"
              hint={`mean ejection ${meanDv.toFixed(0)} m/s`}
            />
            <Stat
              label="Energy into fragment motion"
              value={(result.energyIntoFragments * 100).toFixed(2)}
              unit="%"
              hint="of centre-of-mass impact energy"
            />
            {sampleWeak && (
              <p role="alert" className="text-xs- leading-[1.5] text-risk-high [text-wrap:pretty]">
                The momentum correction is a large fraction of the mean ejection speed.
                This cloud has too few fragments for its statistics to be reliable —
                read the aggregate outcome, not any individual orbit.
              </p>
            )}
          </Panel>
        </div>

        {/* ── Results ── */}
        <div className="flex flex-col gap-5">
          <Panel title="Impact" bodyClassName="p-[16px]">
            <div className="grid gap-x-5 gap-y-4 sm:grid-cols-3">
              <Stat label="Closing speed" value={imp.speed.toFixed(3)} unit="km/s"
                    hint={`${imp.approachAngleDeg.toFixed(0)}° between velocity vectors`} />
              <Stat label="Centre-of-mass energy" value={(imp.energyCmJ / 1e6).toFixed(1)} unit="MJ"
                    hint={`${imp.tntKg.toFixed(1)} kg TNT equivalent`} accent />
              <Stat label="Specific energy" value={fmtInt(bk.specificEnergyJg)} unit="J/g"
                    hint={`threshold 40 J/g`} />
              <Stat label="Reduced mass" value={imp.reducedMassKg.toFixed(2)} unit="kg"
                    hint="μ = m₁m₂/(m₁+m₂)" />
              <div className="flex flex-col gap-1">
                <div className="label">Outcome</div>
                <div data-sev={bk.catastrophic ? 'CRITICAL' : 'MEDIUM'} className="num text-lg text-sev">
                  {bk.catastrophic ? 'CATASTROPHIC' : 'NON-CATASTROPHIC'}
                </div>
              </div>
              <Stat label="Fragments ≥ 10 cm" value={fmtInt(bk.predictedCount)}
                    hint={`${result.fragments.length} modelled`} />
            </div>
            <p className="mt-4 max-w-[72ch] text-xs- leading-[1.55] text-tertiary [text-wrap:pretty]">
              Energy is taken in the centre-of-mass frame, which is the only frame in
              which it means anything: in Earth-centred coordinates each object carries
              tens of gigajoules simply by being in orbit, and almost none of that is
              available to break anything.
            </p>
          </Panel>

          <Panel title="Debris cloud" bodyClassName="p-[16px]">
            <div className="grid gap-x-5 gap-y-4 sm:grid-cols-3">
              <Stat label="Altitude spread" value={`${result.altitudeSpread.min.toFixed(0)}–${result.altitudeSpread.max.toFixed(0)}`} unit="km" />
              <Stat label="Crossing the ISS band" value={fmtInt(result.crossingStationAltitude)} />
              <Stat label="Down immediately" value={fmtInt(result.immediateReentries)} />
              <Stat label="Nodal spread" value={result.nodalSpreadDegPerDay.toFixed(3)} unit="°/day"
                    hint="differential J2 precession" />
              <Stat
                label="Cloud becomes a shell"
                value={Number.isFinite(result.shellFormationDays)
                  ? (result.shellFormationDays / 365.25).toFixed(1)
                  : '—'}
                unit={Number.isFinite(result.shellFormationDays) ? 'years' : ''}
                accent
              />
              <Stat label="Still up after 10 y" value={fmtInt(result.stillUp[1].count)} />
            </div>
            <p className="mt-4 max-w-[72ch] text-xs- leading-[1.55] text-tertiary [text-wrap:pretty]">
              Fragments from each parent stay near that parent's orbit — a hypervelocity
              breakup is not an inelastic merger — so the cloud is bimodal rather than
              centred on the pair's centre of mass. Each fragment then precesses its
              node at a slightly different rate, and that differential is what smears a
              compact cloud into a shell around the Earth.
            </p>
          </Panel>

          <Panel
            title="Re-entry survival"
            aside={<span className="num text-2xs text-tertiary">SUTTON-GRAVES HEATING · LUMPED-MASS DEMISE</span>}
            bodyClassName="p-[16px]"
          >
            <div className="grid gap-x-5 gap-y-4 sm:grid-cols-3">
              <Stat label="Survive the heating" value={`${result.survivors} / ${result.fragments.length}`}
                    accent hint={`${((result.survivors / Math.max(1, result.fragments.length)) * 100).toFixed(0)}% of the cloud`} />
              <Stat label="Surviving mass" value={result.survivingMassKg.toFixed(1)} unit="kg" />
              <Stat label="Casualty area" value={result.casualtyAreaM2.toFixed(1)} unit="m²"
                    hint="DAS form Σ(√A + 0.3)²" />
            </div>
            <p className="mt-4 max-w-[72ch] text-xs- leading-[1.55] text-tertiary [text-wrap:pretty]">
              Most debris never reaches the ground — it is destroyed by aerodynamic
              heating in the upper atmosphere. Demise altitudes here run higher than the
              65–80 km that ORSAT and SCARAB report; the area-to-mass dependence and the
              survive/demise boundary are the meaningful outputs, the absolute altitude
              is not calibrated against flight data.
            </p>
          </Panel>

          <Panel
            title="Gabbard diagram"
            aside={<span className="num text-2xs text-tertiary">APOGEE + PERIGEE vs PERIOD</span>}
            bodyClassName="p-[16px]"
          >
            <p className="mb-4 max-w-[72ch] text-sm leading-[1.6] text-secondary [text-wrap:pretty]">
              The standard picture of a breakup, and the one every published
              reconstruction of Fengyun-1C and Iridium–Kosmos uses. Each fragment is
              plotted twice at its own period — apogee and perigee. Fragments thrown
              forwards raise their apogee while keeping perigee near the collision
              altitude; those thrown backwards do the reverse. The two arms cross at the
              parent orbit, which is why a breakup always draws an{' '}
              <span className="text-primary">X</span>. Horizontal spread is the energy
              imparted; vertical spread is the eccentricity it produced.
            </p>
            <GabbardPlot
              fragments={result.fragments}
              parentAltKm={(event.A.alt + event.B.alt) / 2}
            />
          </Panel>

          <CascadeRisk
            fragments={result.fragments}
            predictedCount={result.breakup.predictedCount}
            cloudInclDeg={event.A.incl}
            shellFormationDays={result.shellFormationDays}
          />

          <Panel title="Where it comes down" bodyClassName="p-[16px]">
            <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="num text-lg text-primary">
                ±{result.reachableLatitudeDeg.toFixed(1)}°
              </span>
              <span className="text-sm text-secondary">
                hard bound — nothing re-enters outside it
              </span>
            </div>
            <p className="mb-4 max-w-[72ch] text-sm leading-[1.6] text-secondary [text-wrap:pretty]">
              <span className="text-primary">Longitude is not predictable.</span> A
              re-entry prediction carries ±10–20% error on remaining lifetime; at
              7.7 km/s that is a quarter of the planet. There is no map here on purpose.
              Latitude is a different matter: debris is likeliest near{' '}
              <span className="num text-primary">{result.likeliestLatitude.toFixed(0)}°</span>{' '}
              and least likely over the equator.
            </p>
            <LatitudePlot bins={result.latitudeDistribution} bound={result.reachableLatitudeDeg} />
          </Panel>

          <Panel
            title="Fragment population"
            aside={<span className="num text-2xs text-tertiary">{result.fragments.length} MODELLED</span>}
          >
            <div className="max-h-[340px] overflow-auto">
              <table className="w-full border-collapse text-left">
                <thead className="sticky-head sticky top-0">
                  <tr>
                    {['Lc m', 'Mass kg', 'A/m', 'Δv m/s', 'Material', 'Perigee', 'Apogee', 'Lifetime', 'Entry'].map((h) => (
                      <th key={h} className="border-b border-hairline px-3 py-2 font-mono text-2xs uppercase tracking-[0.08em] text-tertiary">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.fragments.slice(0, 200).map((f, i) => (
                    <tr key={i} className="border-b border-hairline-soft">
                      <td className="num px-3 py-[7px] text-xs text-secondary">{f.lc.toFixed(3)}</td>
                      <td className="num px-3 py-[7px] text-xs text-secondary">{f.mass.toFixed(3)}</td>
                      <td className="num px-3 py-[7px] text-xs text-secondary">{f.aOverM.toFixed(3)}</td>
                      <td className="num px-3 py-[7px] text-xs text-secondary">{f.dvMs.toFixed(0)}</td>
                      <td className="px-3 py-[7px] font-mono text-2xs uppercase text-tertiary">{f.material}</td>
                      <td className="num px-3 py-[7px] text-xs text-primary">{f.perigee.toFixed(0)}</td>
                      <td className="num px-3 py-[7px] text-xs text-primary">{f.apogee.toFixed(0)}</td>
                      <td className="num px-3 py-[7px] text-xs text-secondary">{f.immediate ? 'immediate' : f.band}</td>
                      <td className="px-3 py-[7px] font-mono text-2xs uppercase">
                        <span className={f.survivesEntry ? 'text-risk-high' : 'text-tertiary'}>
                          {f.survivesEntry ? 'survives' : 'demises'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
