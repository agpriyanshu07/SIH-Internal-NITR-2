import { useEffect, useRef } from 'react';
import { OBJECTS } from '../data/objects';
import { angularRate, palette, projectGlobe, projectOrbitPoint } from '../lib/projection';

/**
 * Decorative wireframe Earth with a handful of orbits.
 *
 * Restrained on purpose: hairline strokes, no glow, no bloom, slow motion. It
 * should read as an instrument, not a screensaver.
 */
export function HeroOrbits() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // A small, visually varied slice of the catalogue.
    const orbits = OBJECTS.filter((_, i) => i % 37 === 0).slice(0, 9);

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
        const params = { alt: o.alt, incl: o.incl, raan: o.raan, phase: (o.ma * Math.PI) / 180 };
        ctx.beginPath();
        ctx.strokeStyle = index === 0 ? p.accent : p.soft;
        for (let i = 0; i <= 160; i++) {
          const pt = projectOrbitPoint(params, (i / 160) * Math.PI * 2, cx, cy, scale, spin);
          i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();

        // Time is compressed heavily so the dots visibly move.
        const pt = projectOrbitPoint(params, params.phase + angularRate(o.period) * t * 220, cx, cy, scale, spin);
        ctx.fillStyle = index === 0 ? p.accent : o.type === 'DEBRIS' ? p.t3 : p.t2;
        ctx.fillRect(pt.x - 1.6, pt.y - 1.6, 3.2, 3.2);
      });

      // Sparse debris haze.
      ctx.fillStyle = p.t3;
      ctx.globalAlpha = 0.45;
      for (let i = 0; i < 200; i++) {
        const params = {
          alt: 350 + ((i * 173) % 1400),
          incl: (i * 53) % 104,
          raan: (i * 67) % 360,
          phase: ((i * 89) % 360) * (Math.PI / 180),
        };
        const pt = projectOrbitPoint(params, params.phase + t * 0.04, cx, cy, scale, spin);
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
