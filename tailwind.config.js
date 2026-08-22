/**
 * KESSLER design tokens.
 *
 * Every colour resolves to a CSS custom property declared in src/index.css.
 * Two consequences worth knowing:
 *   1. Components only ever name colours semantically (bg-panel, text-secondary,
 *      border-hairline, text-risk-critical) — no raw hex in the component tree.
 *   2. The light theme is a variable swap on <html data-ktheme="light">, so it
 *      costs nothing at the component level.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ground: 'var(--ground)',
        deep: 'var(--deep)',
        panel: {
          DEFAULT: 'var(--panel)',
          raised: 'var(--panel-raised)',
          high: 'var(--panel-high)',
        },
        hairline: {
          DEFAULT: 'var(--hairline)',
          soft: 'var(--hairline-soft)',
        },
        grid: 'var(--grid)',
        accent: {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          wash: 'var(--accent-wash)',
          border: 'var(--accent-border)',
          ink: 'var(--accent-ink)',
        },
        primary: 'var(--t1)',
        secondary: 'var(--t2)',
        tertiary: 'var(--t3)',
        risk: {
          critical: 'var(--risk-critical)',
          high: 'var(--risk-high)',
          medium: 'var(--risk-medium)',
          low: 'var(--risk-low)',
          nominal: 'var(--risk-nominal)',
        },
        // Resolves to whichever risk colour the nearest [data-sev] ancestor sets.
        sev: 'var(--sev)',
      },
      textColor: {
        primary: 'var(--t1)',
        secondary: 'var(--t2)',
        tertiary: 'var(--t3)',
      },
      borderColor: {
        hairline: { DEFAULT: 'var(--hairline)', soft: 'var(--hairline-soft)' },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // The design works in half-pixel steps below 14px; these are the exact
        // sizes used across the artboards.
        '2xs': ['9px', { lineHeight: '1.3' }],
        'xs-': ['10px', { lineHeight: '1.3' }],
        xs: ['11px', { lineHeight: '1.4' }],
        sm: ['12px', { lineHeight: '1.5' }],
        'sm+': ['12.5px', { lineHeight: '1.5' }],
        base: ['13px', { lineHeight: '1.65' }],
        md: ['14px', { lineHeight: '1.65' }],
        lg: ['15px', { lineHeight: '1.6' }],
        xl: ['17px', { lineHeight: '1.5' }],
        '2xl': ['19px', { lineHeight: '1.3' }],
        '3xl': ['25px', { lineHeight: '1.1' }],
        '4xl': ['30px', { lineHeight: '1.18' }],
        '5xl': ['44px', { lineHeight: '1.02' }],
        '6xl': ['60px', { lineHeight: '1.02' }],
      },
      letterSpacing: {
        label: '0.10em',
        eyebrow: '0.14em',
        data: '0.06em',
        tight: '-0.01em',
        tighter: '-0.02em',
        display: '-0.035em',
      },
      /*
       * Glass rev bumps every radius: 3px -> 11px for controls, 4px -> 18px
       * for containers. `xs` stays sharp for the 8px severity swatch.
       */
      borderRadius: {
        xs: '2px',
        sm: '7px',
        DEFAULT: '11px',
        md: '18px',
        lg: '22px',
      },
      transitionDuration: { DEFAULT: '150ms' },
      keyframes: {
        skel: { '0%,100%': { opacity: '0.30' }, '50%': { opacity: '0.62' } },
        blink: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.25' } },
      },
      animation: {
        skel: 'skel 1.6s ease-in-out infinite',
        blink: 'blink 2.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
