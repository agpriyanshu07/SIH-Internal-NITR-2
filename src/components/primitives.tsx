import type {
  ReactNode,
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
} from 'react';
import { forwardRef } from 'react';
import { ChevronDown } from './Icon';
import type { Severity } from '../data/types';

/* The small, repeated pieces of the design's component library. */

// ── Buttons ─────────────────────────────────────────────────────────────────

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function Button({ variant = 'secondary', className = '', ...rest }: ButtonProps) {
  // Every variant lifts 1px on hover; the primary also grows its accent glow.
  const styles = {
    primary:
      'bg-accent border-accent text-[color:var(--accent-ink)] font-medium ' +
      'shadow-[0_6px_20px_-6px_var(--accent-border)] ' +
      'hover:bg-accent-hover hover:shadow-[0_10px_26px_-6px_var(--accent-border)] hover:-translate-y-px',
    secondary:
      'bg-transparent border-hairline text-primary ' +
      'hover:border-[color:var(--t2)] hover:bg-panel-raised hover:-translate-y-px',
    ghost:
      'bg-transparent border-transparent text-secondary hover:bg-panel-raised hover:text-primary',
  }[variant];

  return (
    <button
      {...rest}
      className={`rounded border px-[15px] py-2 text-sm disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 ${styles} ${className}`}
    />
  );
}

// ── Panel ───────────────────────────────────────────────────────────────────

export function Panel({
  title,
  aside,
  children,
  className = '',
  bodyClassName = '',
}: {
  title?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={`glass-panel flex min-h-0 flex-col overflow-hidden rounded-md ${className}`}
    >
      {title !== undefined && (
        <div className="flex h-9 flex-none items-center justify-between gap-3 border-b border-hairline px-[14px]">
          <div className="label truncate">{title}</div>
          {aside}
        </div>
      )}
      <div className={`min-h-0 ${bodyClassName}`}>{children}</div>
    </div>
  );
}

// ── Severity ────────────────────────────────────────────────────────────────

/**
 * Severity is always a solid colour swatch *plus* its text label. Colour is
 * never the only carrier — that is a deliberate accessibility choice in the
 * design, and it also survives greyscale projectors.
 */
export function SeverityChip({
  sev,
  bordered = false,
  size = 8,
  label,
}: {
  sev: Severity;
  bordered?: boolean;
  size?: number;
  /** Overrides the printed text — used where the palette is borrowed for a
      non-severity status, such as a manoeuvre's state. */
  label?: string;
}) {
  return (
    <div
      data-sev={sev}
      className={
        bordered
          ? 'glass-panel inline-flex items-center gap-[7px] rounded px-[9px] py-[5px]'
          : 'inline-flex items-center gap-2'
      }
    >
      {/* .sev-swatch is what the CRITICAL pulse animation targets. */}
      <span
        className="sev-swatch flex-none rounded-xs bg-sev"
        style={{ width: size, height: size }}
      />
      <span className="font-mono text-xs- tracking-data text-sev">{label ?? sev}</span>
    </div>
  );
}

// ── Segmented control ───────────────────────────────────────────────────────

export interface Segment<T extends string> {
  label: string;
  value: T;
}

export function Segmented<T extends string>({
  label,
  hint,
  segments,
  value,
  onChange,
}: {
  label?: string;
  /** One line explaining what picking a segment does, if it is not obvious. */
  hint?: string;
  segments: readonly Segment<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-[7px]" title={hint}>
      {label && <div className="label whitespace-nowrap">{label}</div>}
      <div className="flex overflow-hidden rounded border border-hairline">
        {segments.map((s, i) => {
          const on = s.value === value;
          return (
            <button
              key={s.value}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(s.value)}
              className={`px-[9px] py-1 font-mono text-2xs tracking-[0.08em] ${
                i > 0 ? 'border-l border-hairline-soft' : ''
              } ${on ? 'bg-panel-high text-primary' : 'bg-transparent text-tertiary hover:bg-panel hover:text-primary'}`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Text field ─────────────────────────────────────────────────

/**
 * A place to type, with an optional leading icon.
 *
 * There were four of these and three different treatments: the top-bar search
 * had glass, a lift and an accent border on focus; the catalogue filter was the
 * same control one screen over with none of it; the two sign-in fields used
 * `focus:` rather than `focus-visible:`, so their border lit up on a mouse
 * click as well as a tab. Same control, one surface.
 *
 * The ring goes on the wrapper rather than the input because the icon sits
 * inside the border, so the input's own box is not the box worth ringing.
 */
export type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
  trailing?: ReactNode;
  inputClassName?: string;
};

/* Forwards its ref to the input, not the wrapper — the top bar's `/` shortcut
   focuses this field, and a div cannot take focus. */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { icon, trailing, className = '', inputClassName = '', ...rest },
    ref,
  ) {
    return (
      <div
        className={`k-control flex items-center gap-[10px] ${className}`}
        /* A styling hook, not an ARIA claim: the invalid state belongs to the
           input, which carries the real aria-invalid via {...rest}. Announcing
           it on the wrapper too would have a screen reader say it twice. */
        data-invalid={rest['aria-invalid'] ? 'true' : undefined}
      >
        {icon}
        <input
          /*
           * Spellcheck off by default, and before the spread so a field that
           * genuinely wants it can say so. Everything typed into this app is a
           * NORAD ID, a designator, or a name like "COSMOS 1408 DEB" — the
           * dictionary has an opinion about all of them, and a red squiggle
           * under an object name in an operations console reads as an error
           * state the app is reporting, not as a browser feature.
           */
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          {...rest}
          ref={ref}
          className={`min-w-0 flex-1 border-0 bg-transparent text-sm text-primary outline-none ${inputClassName}`}
        />
        {trailing}
      </div>
    );
  },
);

// ── Select ───────────────────────────────────────────────────────

/**
 * A native select wearing the app's chevron instead of the platform's.
 *
 * The list that drops down still belongs to the operating system, and that is
 * the right trade: a hand-rolled listbox would have to re-earn keyboard
 * behaviour, type-ahead and touch handling that the native control already
 * has. What is replaced is the closed state — the part that sits inside a panel
 * all day next to hairlines this app drew itself.
 */
export function Select({
  className = '',
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative flex w-full items-center">
      <select {...rest} className={`k-control k-select ${className}`} />
      <ChevronDown
        size={11}
        className="pointer-events-none absolute right-[10px] text-tertiary"
      />
    </div>
  );
}

// ── Metric tile ─────────────────────────────────────────────────────────────

export function MetricTile({
  label,
  value,
  unit,
  foot,
  valueClass = 'text-primary',
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  foot?: ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="glass lift flex flex-col gap-[9px] bg-panel px-4 py-[15px]">
      <div className="label">{label}</div>
      <div className={`num text-3xl tracking-tight ${valueClass}`}>
        {value}
        {unit && <span className="ml-1 text-md text-tertiary">{unit}</span>}
      </div>
      {/* text-tertiary, which inside the console IS --t2: the shell sets
          data-ksurface and index.css lifts --t3 to --t2 there. Worth knowing
          before "fixing" this line — MetricTile renders nowhere else, so
          naming secondary here changes precisely nothing. */}
      <div className="num text-xs- text-tertiary">{foot ?? ' '}</div>
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-[10px] px-6 py-8 text-center">
      {/*
        A reticle rather than a bare circle. The empty ring this replaced read
        as a placeholder someone had not got round to — which is the one thing
        an empty state must not look like. Kept at 26px and on the hairline
        weight: this marks the absence of data, it is not an illustration of it.
      */}
      <svg
        viewBox="0 0 26 26"
        aria-hidden="true"
        className="mb-1 h-[26px] w-[26px] flex-none text-tertiary"
      >
        <circle
          cx="13"
          cy="13"
          r="8.5"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.55"
        />
        <path
          d="M13 0.5v5M13 20.5v5M0.5 13h5M20.5 13h5"
          stroke="currentColor"
          strokeOpacity="0.35"
        />
        <circle cx="13" cy="13" r="1.25" fill="currentColor" fillOpacity="0.5" />
      </svg>
      <div className="text-base text-primary">{title}</div>
      <div className="max-w-[300px] text-sm+ leading-[1.6] text-secondary [text-wrap:pretty]">
        {body}
      </div>
      {action}
    </div>
  );
}
