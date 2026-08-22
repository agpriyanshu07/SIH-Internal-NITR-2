import type { ReactNode, ButtonHTMLAttributes } from 'react';
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
  segments,
  value,
  onChange,
}: {
  label?: string;
  segments: readonly Segment<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-[7px]">
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
      <div className="mb-1 h-[26px] w-[26px] rounded-full border border-hairline" />
      <div className="text-base text-primary">{title}</div>
      <div className="max-w-[300px] text-sm+ leading-[1.6] text-secondary [text-wrap:pretty]">
        {body}
      </div>
      {action}
    </div>
  );
}
