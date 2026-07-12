import { Link } from 'react-router-dom';
import type { Checkpoint } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { AppIcon } from './AppIcon';
import { getCheckpointStatusLabel } from '../utils/checkpointStatus';

interface CheckpointCardProps {
  checkpoint: Checkpoint;
}

export function CheckpointCard({ checkpoint }: CheckpointCardProps) {
  const { t } = useLanguage();
  const status = getCheckpointStatusLabel(checkpoint.status);

  return (
    <Link to={`/checkpoints/${checkpoint.id}`} className="checkpoint-card">
      <div className="checkpoint-card__header">
        <div>
          <h3 className="checkpoint-card__name">{checkpoint.name}</h3>
          <span className="checkpoint-card__local">{checkpoint.nameLocal}</span>
        </div>
        <span className={`badge ${status.className}`}>
          {t(status.ru, status.en, status.vi)}
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
