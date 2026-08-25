/**
 * Icons.
 *
 * The design draws its icons as bare geometric primitives — an unfilled circle
 * for search, squares and rings in the mobile tab bar — all at a 1–1.5px stroke.
 * They are reproduced here rather than pulled from an icon set, so the stroke
 * weight matches the hairlines around them exactly.
 */
interface IconProps {
  size?: number;
  className?: string;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 16 16',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.25,
  'aria-hidden': true,
});

/*
 * A magnifier, not a circle.
 *
 * This was an unfilled circle — true to the design's "bare geometric
 * primitives" rule, and unreadable as a search affordance: at 11px in a text
 * field it reads as a bullet point. The handle is two-thirds of what makes the
 * shape a magnifier and costs one line at the same stroke weight. It sits in
 * the top bar and the catalogue filter, so it is on screen more than any other
 * icon in the app.
 */
export const SearchIcon = ({ size = 12, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="7" cy="7" r="5" />
    <path d="M10.8 10.8 14 14" strokeLinecap="round" />
  </svg>
);

/** Theme state, so the toggle shows what it IS rather than only naming it. */
export const MoonIcon = ({ size = 11, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M13 9.5A5.6 5.6 0 0 1 6.5 3 5.8 5.8 0 1 0 13 9.5Z" strokeLinejoin="round" />
  </svg>
);

export const SunIcon = ({ size = 11, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="8" cy="8" r="3.1" />
    <path
      d="M8 1.4v1.7M8 12.9v1.7M14.6 8h-1.7M3.1 8H1.4M12.66 3.34l-1.2 1.2M4.54 11.46l-1.2 1.2M12.66 12.66l-1.2-1.2M4.54 4.54l-1.2-1.2"
      strokeLinecap="round"
    />
  </svg>
);

/** The signed-out avatar. An em dash there read as a rendering fault. */
export const PersonIcon = ({ size = 12, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="8" cy="5.6" r="2.6" />
    <path d="M2.9 14a5.1 5.1 0 0 1 10.2 0" strokeLinecap="round" />
  </svg>
);

export const ChevronRight = ({ size = 12, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M6 3.5 10.5 8 6 12.5" />
  </svg>
);

export const ChevronDown = ({ size = 12, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3.5 6 8 10.5 12.5 6" />
  </svg>
);

export const CloseIcon = ({ size = 12, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3.5 3.5 12.5 12.5M12.5 3.5 3.5 12.5" />
  </svg>
);

export const PlayIcon = ({ size = 11, className }: IconProps) => (
  <svg {...base(size)} className={className} fill="currentColor" stroke="none">
    <path d="M4.5 3 12.5 8l-8 5z" />
  </svg>
);

export const PauseIcon = ({ size = 11, className }: IconProps) => (
  <svg {...base(size)} className={className} fill="currentColor" stroke="none">
    <rect x="4" y="3.5" width="3" height="9" />
    <rect x="9" y="3.5" width="3" height="9" />
  </svg>
);

export const SquareIcon = ({ size = 13, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="2" y="2" width="12" height="12" rx="1" />
  </svg>
);

export const RingIcon = ({ size = 13, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="8" cy="8" r="6" />
  </svg>
);

export const ArrowUp = ({ size = 9, className }: IconProps) => (
  <svg {...base(size)} className={className} fill="currentColor" stroke="none">
    <path d="M8 4l4 7H4z" />
  </svg>
);

export const ArrowDown = ({ size = 9, className }: IconProps) => (
  <svg {...base(size)} className={className} fill="currentColor" stroke="none">
    <path d="M8 12 4 5h8z" />
  </svg>
);
