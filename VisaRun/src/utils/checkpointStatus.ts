import type { CheckpointStatus } from '../types';

type StatusLabel = {
  ru: string;
  en: string;
  vi: string;
  className: 'badge--success' | 'badge--danger' | 'badge--warning';
};

const STATUS_LABELS: Record<CheckpointStatus, StatusLabel> = {
  open: { ru: 'Открыт', en: 'Open', vi: 'Mở', className: 'badge--success' },
  closed: { ru: 'Закрыт', en: 'Closed', vi: 'Đóng', className: 'badge--danger' },
  busy: { ru: 'Загружен', en: 'Busy', vi: 'Đông', className: 'badge--warning' },
};

export function getCheckpointStatusLabel(status: CheckpointStatus): StatusLabel {
  return STATUS_LABELS[status];
}
