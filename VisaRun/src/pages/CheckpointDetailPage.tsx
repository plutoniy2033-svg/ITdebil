import { Link, useParams } from 'react-router-dom';
import { getCheckpointById } from '../data/checkpoints';
import { CheckpointMap } from '../components/CheckpointMap';
import { checkpoints } from '../data/checkpoints';
import { AppIcon } from '../components/AppIcon';
import { useLanguage } from '../context/LanguageContext';

const statusLabels = {
  open: { ru: 'Открыт', en: 'Open', class: 'badge--success' },
  closed: { ru: 'Закрыт', en: 'Closed', class: 'badge--danger' },
  busy: { ru: 'Загружен', en: 'Busy', class: 'badge--warning' },
};

export function CheckpointDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const checkpoint = id ? getCheckpointById(id) : undefined;

  if (!checkpoint) {
    return (
      <div className="page">
        <p>{t('КПП не найден', 'Checkpoint not found')}</p>
        <Link to="/checkpoints" className="btn btn--secondary icon-label">
          <AppIcon name="arrow-left" size={16} />
          {t('Назад к списку', 'Back to list')}
        </Link>
      </div>
    );
  }

  const status = statusLabels[checkpoint.status];
  const mapsUrl = `https://www.google.com/maps?q=${checkpoint.lat},${checkpoint.lng}`;

  return (
    <div className="page checkpoint-detail-page">
      <Link to="/checkpoints" className="back-link icon-label">
        <AppIcon name="arrow-left" size={16} />
        {t('Все КПП', 'All checkpoints')}
      </Link>

      <div className="checkpoint-detail__header">
        <div>
          <h2 className="page__title">{checkpoint.name}</h2>
          <span className="checkpoint-card__local">{checkpoint.nameLocal}</span>
        </div>
        <span className={`badge ${status.class}`}>{t(status.ru, status.en)}</span>
      </div>

      <p className="checkpoint-detail__desc">{checkpoint.description}</p>

      <div className="detail-grid">
        <div className="detail-item">
          <span className="detail-item__label">{t('Часы работы', 'Hours')}</span>
          <span>{checkpoint.hours}</span>
        </div>
        <div className="detail-item">
          <span className="detail-item__label">{t('Тип', 'Type')}</span>
          <span>
            {checkpoint.type === 'land'
              ? t('Наземный', 'Land')
              : t('Воздушный', 'Air')}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-item__label">{t('Координаты', 'Coordinates')}</span>
          <span>{checkpoint.lat.toFixed(3)}, {checkpoint.lng.toFixed(3)}</span>
        </div>
      </div>

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn--primary"
      >
        {t('Открыть в Google Maps', 'Open in Google Maps')}
      </a>

      <CheckpointMap checkpoints={checkpoints} selectedId={checkpoint.id} height="280px" />

      <div className="pitfalls card">
        <h3 className="icon-label">
          <AppIcon name="warning" size={18} />
          {t('Подводные камни', 'Pitfalls')}
        </h3>
        <ul>
          {checkpoint.pitfalls.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>

      <Link
        to={`/community?checkpoint=${checkpoint.id}`}
        className="btn btn--secondary icon-label"
      >
        {t('Смотреть ленту этого КПП', 'View live feed for this checkpoint')}
        <AppIcon name="arrow-right" size={16} />
      </Link>
    </div>
  );
}
