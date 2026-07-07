export type NavIconName =
  | 'tracker'
  | 'checkpoints'
  | 'evisa'
  | 'tours'
  | 'community'
  | 'settings';

export interface NavItem {
  to: string;
  icon: NavIconName;
  labelRu: string;
  labelEn: string;
}

export const navItems: NavItem[] = [
  { to: '/', icon: 'tracker', labelRu: 'Трекер', labelEn: 'Tracker' },
  { to: '/community', icon: 'community', labelRu: 'Чат', labelEn: 'Chat' },
  { to: '/tours', icon: 'tours', labelRu: 'Туры', labelEn: 'Tours' },
  { to: '/e-visa', icon: 'evisa', labelRu: 'E-Visa', labelEn: 'E-Visa' },
  { to: '/checkpoints', icon: 'checkpoints', labelRu: 'КПП', labelEn: 'Borders' },
  { to: '/settings', icon: 'settings', labelRu: 'Настройки', labelEn: 'Settings' },
];

// Порядок разделов — для анимации «вверх/вниз» при переходе
export function getRouteIndex(pathname: string): number {
  if (pathname.startsWith('/community')) return 1;
  if (pathname.startsWith('/tours')) return 2;
  if (pathname.startsWith('/e-visa')) return 3;
  if (pathname.startsWith('/checkpoints')) return 4;
  if (pathname.startsWith('/settings')) return 5;
  return 0;
}
