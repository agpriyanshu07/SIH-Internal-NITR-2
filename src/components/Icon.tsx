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

export const SearchIcon = ({ size = 11, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="8" cy="8" r="6.5" />
  </svg>
);

export const ChevronRight = ({ size = 12, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M6 3.5 10.5 8 6 12.5" />
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
