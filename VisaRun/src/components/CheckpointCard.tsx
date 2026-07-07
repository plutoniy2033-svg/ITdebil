import { Link } from 'react-router-dom';
import type { Checkpoint } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { AppIcon } from './AppIcon';

const statusLabels = {
  open: { ru: 'Открыт', en: 'Open', class: 'badge--success' },
  closed: { ru: 'Закрыт', en: 'Closed', class: 'badge--danger' },
  busy: { ru: 'Загружен', en: 'Busy', class: 'badge--warning' },
};

interface CheckpointCardProps {
  checkpoint: Checkpoint;
}

export function CheckpointCard({ checkpoint }: CheckpointCardProps) {
  const { t } = useLanguage();
  const status = statusLabels[checkpoint.status];

  return (
    <Link to={`/checkpoints/${checkpoint.id}`} className="checkpoint-card">
      <div className="checkpoint-card__header">
        <div>
          <h3 className="checkpoint-card__name">{checkpoint.name}</h3>
          <span className="checkpoint-card__local">{checkpoint.nameLocal}</span>
        </div>
        <span className={`badge ${status.class}`}>
          {t(status.ru, status.en)}
        </span>
      </div>
      <div className="checkpoint-card__meta">
        <span className="checkpoint-card__type icon-label">
          <AppIcon name={checkpoint.type === 'land' ? 'car' : 'plane'} size={14} />
          {checkpoint.type === 'land'
            ? t('Наземный', 'Land')
            : t('Воздушный', 'Air')}
        </span>
        <span className="checkpoint-card__hours">{checkpoint.hours}</span>
      </div>
    </Link>
  );
}
