import { useEffect, useRef } from 'react';
import { HERO_OBJECTS } from '../data/landing';
import { angularRate, palette, projectGlobe, projectOrbitPoint } from '../lib/projection';

/**
 * Wireframe Earth with the screened catalogue on it.
 *
 * Restrained on purpose: hairline strokes, no glow, no bloom, slow motion. It
 * should read as an instrument, not a screensaver.
 *
 * Every object drawn is a real one. The nine traced orbits and every point in
 * the field come from OBJECTS — real altitude, inclination, RAAN and mean
 * anomaly — and each point advances at its own orbital rate. The field used to
 * be 200 objects fabricated from modular arithmetic on the loop index
 * (`alt: 350 + ((i * 173) % 1400)`), which is exactly the kind of invented
 * figure the rest of this project refuses to print. It also looked wrong:
 * evenly smeared, where a real catalogue clusters into shells and planes.
 *
 * This is NOT SGP4 and the caption beside it says so. Orbits are circles in
 * their own plane — the same schematic the orbital viewer draws, deliberately
 * the same standard of truth rather than a third one. Time is compressed
 * heavily so the motion is visible.
 */
export function HeroOrbits() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Nine traced orbits, spread across the catalogue rather than taken from
    // its head, so they are not all fragments of one launch.
    const orbits = HERO_OBJECTS.filter((_, i) => i % 37 === 0).slice(0, 9);
    // Everything else, as points. Real objects, real elements.
    const field = HERO_OBJECTS.map((o) => ({
      alt: o.a,
      incl: o.i,
      raan: o.r,
      phase: (o.m * Math.PI) / 180,
      rate: angularRate(o.p),
      debris: o.d === 1,
    }));

    let raf = 0;
    let t = 0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const draw = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const p = palette();
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) * 0.19;
      const spin = t * 0.02;

      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;

      for (let k = -4; k <= 4; k++) {
        ctx.beginPath();
        ctx.strokeStyle = k === 0 ? p.line : p.soft;
        for (let i = 0; i <= 90; i++) {
          const pt = projectGlobe((k * Math.PI) / 10, (i / 90) * Math.PI * 2, cx, cy, scale, spin);
          i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }
      for (let k = 0; k < 12; k++) {
        ctx.beginPath();
        ctx.strokeStyle = p.soft;
        for (let i = 0; i <= 60; i++) {
          const pt = projectGlobe(-Math.PI / 2 + (i / 60) * Math.PI, (k * Math.PI) / 6, cx, cy, scale, spin);
          i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.strokeStyle = p.line;
      ctx.arc(cx, cy, scale, 0, Math.PI * 2);
      ctx.stroke();

      orbits.forEach((o, index) => {
        const params = { alt: o.a, incl: o.i, raan: o.r, phase: (o.m * Math.PI) / 180 };
        ctx.beginPath();
        ctx.strokeStyle = index === 0 ? p.accent : p.soft;
        for (let i = 0; i <= 160; i++) {
          const pt = projectOrbitPoint(params, (i / 160) * Math.PI * 2, cx, cy, scale, spin);
          i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();

        // Time is compressed heavily so the dots visibly move.
        const pt = projectOrbitPoint(params, params.phase + angularRate(o.p) * t * 220, cx, cy, scale, spin);
        ctx.fillStyle = index === 0 ? p.accent : o.d === 1 ? p.t3 : p.t2;
        ctx.fillRect(pt.x - 1.6, pt.y - 1.6, 3.2, 3.2);
      });

      // The rest of the catalogue, one point each, at its own rate.
      ctx.globalAlpha = 0.45;
      for (const f of field) {
        const pt = projectOrbitPoint(f, f.phase + f.rate * t * 220, cx, cy, scale, spin);
        ctx.fillStyle = f.debris ? p.t3 : p.t2;
        ctx.fillRect(pt.x - 0.7, pt.y - 0.7, 1.4, 1.4);
      }
      ctx.globalAlpha = 1;

      if (!reduced) {
        t += 0.016;
        raf = requestAnimationFrame(draw);
      }
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className="absolute inset-0 block h-full w-full" aria-hidden />;
}
