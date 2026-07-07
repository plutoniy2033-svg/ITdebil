export type AppIconName =
  | 'clock'
  | 'van'
  | 'bus'
  | 'handshake'
  | 'car'
  | 'plane'
  | 'warning'
  | 'check'
  | 'star'
  | 'arrow-left'
  | 'arrow-right'
  | 'x';

interface AppIconProps {
  name: AppIconName;
  size?: number;
  className?: string;
}

// Minimal stroke icons — same visual language as NavIcon
export function AppIcon({ name, size = 18, className }: AppIconProps) {
  const shared = {
    className,
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (name) {
    case 'clock':
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l2.5 2.5" />
        </svg>
      );
    case 'van':
      return (
        <svg {...shared}>
          <path d="M3 8h11v8H3z" />
          <path d="M14 10h4l3 4v2h-7V10z" />
          <circle cx="7" cy="17" r="1.5" />
          <circle cx="17" cy="17" r="1.5" />
        </svg>
      );
    case 'bus':
      return (
        <svg {...shared}>
          <path d="M5 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
          <path d="M3 10h18M7 14h2M15 14h2" />
          <circle cx="7.5" cy="18" r="1" />
          <circle cx="16.5" cy="18" r="1" />
        </svg>
      );
    case 'handshake':
      return (
        <svg {...shared}>
          <path d="M8 12l2-2 3 3 4-4 3 3" />
          <path d="M4 14l2 2a2 2 0 0 0 2.8 0l1.2-1.2" />
          <path d="M20 14l-2 2a2 2 0 0 1-2.8 0l-1.2-1.2" />
          <path d="M8 8V6a2 2 0 0 1 2-2h1M16 8V6a2 2 0 0 0-2-2h-1" />
        </svg>
      );
    case 'car':
      return (
        <svg {...shared}>
          <path d="M5 11l1.5-4h11L19 11" />
          <path d="M4 11h16v6a1 1 0 0 1-1 1h-1a2 2 0 0 1-4 0H10a2 2 0 0 1-4 0H5a1 1 0 0 1-1-1v-6z" />
          <circle cx="8" cy="16" r="1" />
          <circle cx="16" cy="16" r="1" />
        </svg>
      );
    case 'plane':
      return (
        <svg {...shared}>
          <path d="M3 12h5l2-5 4 1-1 6 3-1 1 4-2-2-4 2-1-1 3-1-4 1-2-5z" />
        </svg>
      );
    case 'warning':
      return (
        <svg {...shared}>
          <path d="M12 4l8 14H4L12 4z" />
          <path d="M12 10v3M12 16h.01" />
        </svg>
      );
    case 'check':
      return (
        <svg {...shared}>
          <path d="M5 12l4 4L19 6" />
        </svg>
      );
    case 'star':
      return (
        <svg {...shared} fill="currentColor" stroke="none">
          <path d="M12 3l2.4 5.5L20 9.3l-4.2 3.8L17 19l-5-3-5 3 1.2-5.9L4 9.3l5.6-.8L12 3z" />
        </svg>
      );
    case 'arrow-left':
      return (
        <svg {...shared}>
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg {...shared}>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      );
    case 'x':
      return (
        <svg {...shared}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );
    default:
      return null;
  }
}
