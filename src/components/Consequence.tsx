import { useMemo } from 'react';
import { analyseConsequence } from '../data/consequence';
import { CATASTROPHIC_THRESHOLD_JG, MIN_FRAGMENT_M } from '../data/engine/breakup';
import { entryById } from '../data/objects';
import { fmtInt } from '../data/format';
import type { ResolvedConjunction } from '../data/types';
import { Panel } from './primitives';
import { LatitudePlot } from './LatitudePlot';
import { GabbardPlot } from './GabbardPlot';

/**
 * Consequence analysis: what this cloud would do if the pass were a hit.
 *
 * Three published models chained onto a real screened event — NASA Standard
 * Breakup Model, isotropic ejection onto the parent's real SGP4 state, and
 * King-Hele drag decay.
 *
 * The panel is laid out around how much each answer can be trusted, because
 * that varies enormously: fragment counts are solid, lifetimes are
 * order-of-magnitude, and the re-entry LONGITUDE is not knowable at all. That
 * last one is the section people expect a map for, and it deliberately does not
 * have one.
 */

export function Consequence({ event }: { event: ResolvedConjunction }) {
  const result = useMemo(() => {
    const A = entryById(event.a);
    const B = entryById(event.b);
    if (!A || !B) return null;
    return analyseConsequence(event, A, B);
  }, [event]);

  if (!result) return null;
  const { breakup: bk } = result;

  return (
    <Panel
      title="If this pass were a collision"
      aside={
        <span className="num text-2xs text-tertiary">
          NASA STANDARD BREAKUP MODEL · KING-HELE DECAY
        </span>
      }
      bodyClassName="flex flex-col gap-6 p-[18px]"
    >
      {/* ── 1. The impact ── */}
      <div className="flex flex-col gap-3">
        <div className="grid gap-x-5 gap-y-3 sm:grid-cols-3">
          <div>
            <div className="label mb-1">Impact energy</div>
            <div className="num text-xl text-primary">
              {bk.specificEnergyJg < 1
                ? bk.specificEnergyJg.toFixed(2)
                : fmtInt(bk.specificEnergyJg)}
              <span className="ml-1 text-xs- text-tertiary">J/g</span>
            </div>
          </div>
          <div>
            <div className="label mb-1">Outcome</div>
            <div
              data-sev={bk.catastrophic ? 'CRITICAL' : 'MEDIUM'}
              className="num text-xl text-sev"
            >
              {bk.catastrophic ? 'CATASTROPHIC' : 'NON-CATASTROPHIC'}
            </div>
          </div>
          <div>
            <div className="label mb-1">
              Fragments &ge; {(MIN_FRAGMENT_M * 100).toFixed(0)} cm
            </div>
            <div className="num text-xl text-primary">{fmtInt(bk.predictedCount)}</div>
          </div>
        </div>
        <p className="max-w-[70ch] text-sm leading-[1.6] text-secondary [text-wrap:pretty]">
          The model's threshold is {CATASTROPHIC_THRESHOLD_JG} J/g: above it the target
          is fragmented entirely, below it only a crater's worth of mass is liberated.
          This impact is{' '}
          <span className="text-primary">
            {bk.specificEnergyJg < 1
              ? bk.specificEnergyJg.toFixed(2)
              : fmtInt(bk.specificEnergyJg)}{' '}
            J/g
          </span>
          , from an assumed {fmtInt(bk.massProjectileKg)} kg striking an assumed{' '}
          {fmtInt(bk.massTargetKg)} kg at {event.relv.toFixed(2)} km/s.
        </p>
        <p className="max-w-[70ch] text-base leading-[1.7] text-tertiary [text-wrap:pretty]">
          Those two masses are <span className="text-secondary">assumptions</span>, and
          load-bearing ones — fragment count scales as mass<sup>0.75</sup>. A TLE carries
          no mass and the SATCAT is not in this snapshot, so they are class
          representatives rather than lookups. Only fragments at or above{' '}
          {(MIN_FRAGMENT_M * 100).toFixed(0)} cm are modelled; the real cloud contains
          orders of magnitude more debris too small for any catalogue to track.
        </p>
      </div>

      {/* ── 2. The cloud ── */}
      <div className="flex flex-col gap-3 border-t border-hairline-soft pt-5">
        <div className="label">Where the fragments go</div>
        <div className="grid gap-x-5 gap-y-3 sm:grid-cols-3">
          <div>
            <div className="label mb-1">Orbit spread</div>
            <div className="num text-md text-primary">
              {result.altitudeSpread.min.toFixed(0)} – {result.altitudeSpread.max.toFixed(0)}
              <span className="ml-1 text-xs- text-tertiary">km</span>
            </div>
          </div>
          <div>
            <div className="label mb-1">Crossing the ISS band</div>
            <div className="num text-md text-primary">{result.crossingStationAltitude}</div>
          </div>
          <div>
            <div className="label mb-1">Down immediately</div>
            <div className="num text-md text-primary">{result.immediateReentries}</div>
          </div>
        </div>

        <div className="mt-1 flex flex-col gap-[7px]">
          <div className="label">How long they stay up</div>
          {result.byBand.map((b) => {
            const total = Math.max(1, result.fragments.length);
            return (
              <div key={b.band} className="flex items-center gap-3">
                <span className="num w-[64px] flex-none text-2xs text-tertiary">{b.band}</span>
                <div className="h-[7px] flex-1 overflow-hidden rounded-xs bg-panel-raised">
                  <div
                    className="h-full bg-[color:var(--t2)]"
                    style={{ width: `${((b.count / total) * 100).toFixed(1)}%` }}
                  />
                </div>
                <span className="num w-[44px] flex-none text-right text-2xs text-secondary">
                  {b.count}
                </span>
              </div>
            );
          })}
          <p className="text-base leading-[1.7] text-tertiary [text-wrap:pretty]">
            Bands, not dates. Drag depends on atmospheric density, which swings by more
            than a factor of ten over the eleven-year solar cycle — and solar activity is
            not modelled here. Anything finer than an order of magnitude would be
            invented precision.
          </p>
        </div>
      </div>

      {/* ── 2b. The cloud, drawn the way the field draws it ── */}
      <div className="flex flex-col gap-3 border-t border-hairline-soft pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <div className="label">Gabbard diagram</div>
          <span className="num text-2xs text-tertiary">
            {fmtInt(result.fragments.length)} FRAGMENTS PLOTTED
          </span>
        </div>

        <p className="max-w-[70ch] text-sm leading-[1.6] text-secondary [text-wrap:pretty]">
          Each fragment appears twice at its own orbital period — once at its apogee,
          once at its perigee. The <span className="text-primary">X</span> is the
          signature of a breakup, and it is geometry rather than coincidence: a fragment
          thrown forwards keeps its perigee near the collision point and flings its
          apogee outwards, while one thrown backwards does the exact opposite. Both arms
          therefore cross at the parent orbit, marked here in the accent colour.
        </p>
        <p className="max-w-[70ch] text-sm leading-[1.6] text-secondary [text-wrap:pretty]">
          The fragments on the floor of the plot have had their perigee pushed into the
          atmosphere and are already coming down — they are the same{' '}
          <span className="num text-primary">{fmtInt(result.immediateReentries)}</span>{' '}
          counted above, seen from a different angle.
        </p>

        <div className="mt-1">
          <GabbardPlot
            fragments={result.fragments}
            parentAltKm={(event.A.alt + event.B.alt) / 2}
          />
        </div>
      </div>

      {/* ── 3. Where it comes down ── */}
      <div className="flex flex-col gap-3 border-t border-hairline-soft pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <div className="label">Where it comes down</div>
          <span className="num text-2xs text-tertiary">
            REACHABLE BAND ±{result.reachableLatitudeDeg.toFixed(1)}°
          </span>
        </div>

        <p className="max-w-[70ch] text-sm leading-[1.6] text-secondary [text-wrap:pretty]">
          <span className="text-primary">The longitude is not predictable, and no
          honest tool will give you one.</span> A re-entry prediction carries roughly
          ±10–20% error on the remaining lifetime; applied to the final orbit that is
          minutes of uncertainty, and an object at 7.7 km/s crosses a quarter of the
          planet in ten. Any map pinning this to a country would be decoration.
        </p>
        <p className="max-w-[70ch] text-sm leading-[1.6] text-secondary [text-wrap:pretty]">
          The <span className="text-primary">latitude</span> is a different matter. An
          orbit of inclination {event.A.incl.toFixed(1)}° never crosses{' '}
          ±{result.reachableLatitudeDeg.toFixed(1)}°, and within that band the time spent
          at each latitude follows a closed form. Debris is likeliest to come down near{' '}
          <span className="num text-primary">{result.likeliestLatitude.toFixed(0)}°</span>{' '}
          and <em className="not-italic text-primary">least</em> likely over the equator —
          an object lingers where its motion turns parallel to a line of latitude, and
          races through the tropics.
        </p>

        <div className="mt-1">
          <LatitudePlot
            bins={result.latitudeDistribution}
            bound={result.reachableLatitudeDeg}
          />
        </div>
      </div>
    </Panel>
  );
}
