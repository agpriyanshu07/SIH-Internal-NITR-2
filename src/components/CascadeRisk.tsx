/**
 * Cascade risk panel — the consequence of the consequence.
 *
 * Everything else in the console stops at the cloud. This closes the loop the
 * project is named after: the cloud is fed back as an environment and the added
 * collision rate on the assets still flying is reported.
 *
 * Naming note: `CascadePanel` is the SCREENING cascade — how many pairs each
 * filter stage rejected. This is the Kessler cascade, an entirely different
 * thing, which is why it is a separate component.
 */
import { useMemo } from 'react';
import { assessCascade, SHELL_KM, CROSS_SECTION_M2 } from '../data/engine/cascade';
import { OBJECTS, groupOf } from '../data/objects';
import { fmtInt } from '../data/format';
import type { FragmentOrbit } from '../data/consequence';
import { Panel } from './primitives';

/** Intact things worth protecting: crewed stations and the ISRO fleet. */
const ASSET_GROUPS = new Set(['stations', 'indian-assets']);

export function CascadeRisk({
  fragments,
  predictedCount,
  cloudInclDeg,
  shellFormationDays,
}: {
  fragments: FragmentOrbit[];
  predictedCount: number;
  cloudInclDeg: number;
  shellFormationDays: number;
}) {
  const assets = useMemo(
    () => OBJECTS.filter((o) => ASSET_GROUPS.has(groupOf(o.norad) ?? '')),
    [],
  );

  const result = useMemo(
    () => assessCascade(fragments, predictedCount, assets, cloudInclDeg),
    [fragments, predictedCount, assets, cloudInclDeg],
  );

  if (!result.shells.length) return null;

  const peakDensity = Math.max(...result.shells.map((s) => s.density), 1e-30);
  const exposed = result.assets.filter((a) => a.addedDensity > 0);
  const worst = exposed[0];

  return (
    <Panel
      title="Cascade risk"
      aside={<span className="num text-2xs text-tertiary">KESSLER &amp; COUR-PALAIS 1978</span>}
      bodyClassName="flex flex-col gap-5 p-[16px]"
    >
      <p className="max-w-[72ch] text-sm leading-[1.6] text-secondary [text-wrap:pretty]">
        A conjunction screen cannot answer this. Days after a breakup a fragment&rsquo;s
        position <em className="not-italic text-primary">around</em> its orbit is no longer
        known — only the orbit&rsquo;s shape is. So the spread cloud is treated as a gas
        and a rate is computed, <span className="num text-primary">n · v · A</span>, which
        is the particle-in-a-box method this console is named after. It yields a rate, not
        a schedule, and that is the honest form of the answer.
      </p>

      {worst ? (
        <div className="rounded-sm border border-accent-border bg-accent-wash p-4">
          <div className="label mb-1">What this one collision does</div>
          <p className="max-w-[68ch] text-sm leading-[1.6] text-primary [text-wrap:pretty]">
            Once spread, the cloud raises the collision rate on{' '}
            <span className="num">{exposed.length}</span> tracked{' '}
            {exposed.length === 1 ? 'asset' : 'assets'}. Worst affected is{' '}
            <span className="num">{worst.name}</span> at{' '}
            <span className="num">{worst.altKm.toFixed(0)} km</span>, where the added rate is{' '}
            <span className="num">{worst.ratePerYear.toExponential(2)}</span> per year —{' '}
            <span className="num">{(worst.probability10y * 100).toFixed(3)}%</span> over a
            decade, or one strike every{' '}
            <span className="num">
              {Number.isFinite(worst.meanIntervalYears)
                ? fmtInt(Math.round(worst.meanIntervalYears))
                : '∞'}
            </span>{' '}
            years at that rate.
          </p>
        </div>
      ) : null}

      {/* density profile */}
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <div className="label">Added spatial density</div>
          <span className="num text-2xs text-tertiary">
            PEAK {result.peakShell?.density.toExponential(1)} /km³ AT{' '}
            {result.peakShell?.altKm.toFixed(0)} KM
          </span>
        </div>
        <div className="flex flex-col gap-[2px]">
          {[...result.shells].reverse().map((s) => (
            <div key={s.altKm} className="flex items-center gap-2">
              <span className="num w-[52px] flex-none text-right text-2xs text-tertiary">
                {s.altKm.toFixed(0)}
              </span>
              <div className="h-[7px] flex-1 overflow-hidden rounded-xs bg-panel-raised">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${((s.density / peakDensity) * 100).toFixed(1)}%` }}
                />
              </div>
              <span className="num w-[54px] flex-none text-right text-2xs text-tertiary">
                {s.fragments >= 0.5 ? fmtInt(Math.round(s.fragments)) : '—'}
              </span>
            </div>
          ))}
        </div>
        <p className="text-2xs text-tertiary">
          altitude (km) · fragments resident per {SHELL_KM} km shell, weighted by time
          spent there rather than by orbit span
        </p>
      </div>

      {/* per-asset table */}
      <div className="flex flex-col gap-2">
        <div className="label">Added risk per asset</div>
        <div className="max-h-[280px] overflow-auto">
          <table className="w-full border-collapse text-left">
            <thead className="sticky-head sticky top-0">
              <tr>
                {['Asset', 'Alt km', 'Closing km/s', 'Added /yr', 'P over 10 y'].map((h) => (
                  <th
                    key={h}
                    className="border-b border-hairline px-3 py-2 font-mono text-2xs uppercase tracking-[0.08em] text-tertiary"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.assets.slice(0, 24).map((a) => (
                <tr key={a.norad} className="border-b border-hairline-soft">
                  <td className="px-3 py-1.5 text-sm text-primary">{a.name}</td>
                  <td className="num px-3 py-1.5 text-sm text-secondary">{a.altKm.toFixed(0)}</td>
                  <td className="num px-3 py-1.5 text-sm text-secondary">{a.relSpeedKmS.toFixed(1)}</td>
                  <td className="num px-3 py-1.5 text-sm text-secondary">
                    {a.ratePerYear > 0 ? a.ratePerYear.toExponential(2) : '—'}
                  </td>
                  <td className="num px-3 py-1.5 text-sm text-secondary">
                    {a.probability10y > 0 ? `${(a.probability10y * 100).toFixed(4)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="max-w-[72ch] text-sm leading-[1.6] text-secondary [text-wrap:pretty]">
        <span className="text-primary">What bounds these numbers.</span> The gas picture
        needs the cloud spread around the Earth, which differential nodal precession takes{' '}
        <span className="num text-primary">
          {Number.isFinite(shellFormationDays) ? fmtInt(Math.round(shellFormationDays)) : '—'}
        </span>{' '}
        days to do; before then the debris is a clump and the risk is concentrated rather
        than diffuse, so these are a floor for the first weeks. Only fragments at or above
        10 cm are modelled, and cross-sections are assumed by size class (
        {CROSS_SECTION_M2.LARGE} / {CROSS_SECTION_M2.MEDIUM} / {CROSS_SECTION_M2.SMALL} m²)
        because a TLE carries no geometry — rate is linear in that, so it scales the answer
        directly. This is the <em className="not-italic text-primary">increment</em> from
        one event, not total environmental risk.
      </p>
    </Panel>
  );
}
