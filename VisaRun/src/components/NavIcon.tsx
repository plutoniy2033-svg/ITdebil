import type { NavIconName } from '../config/navConfig';

interface NavIconProps {
  name: NavIconName;
  className?: string;
}

// Минималистичные stroke-иконки без заливки — прозрачный контур
export function NavIcon({ name, className }: NavIconProps) {
  const shared = {
    className,
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (name) {
    case 'tracker':
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'checkpoints':
      return (
        <svg {...shared}>
          <path d="M4 8h16M4 12h16M4 16h10" />
          <circle cx="18" cy="16" r="2" />
        </svg>
      );
    case 'evisa':
      return (
        <svg {...shared}>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      );
    case 'tours':
      return (
        <svg {...shared}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4v2M12 18v2M4 12h2M18 12h2" />
          <path d="M12 8l2 4-2 4-2-4z" />
        </svg>
      );
    case 'community':
      return (
        <svg {...shared}>
          <path d="M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
          <path d="M16 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
          <path d="M3 20v-1a4 4 0 0 1 4-4h2M13 18h5a3 3 0 0 1 3 3v1" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...shared}>
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    default:
      return null;
  }
}
