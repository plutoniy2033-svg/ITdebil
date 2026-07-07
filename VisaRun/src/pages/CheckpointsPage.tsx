import { useState } from 'react';
import { checkpoints } from '../data/checkpoints';
import { CheckpointMap } from '../components/CheckpointMap';
import { CheckpointCard } from '../components/CheckpointCard';
import { AppIcon } from '../components/AppIcon';
import { useLanguage } from '../context/LanguageContext';
import type { CheckpointType } from '../types';

export function CheckpointsPage() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<CheckpointType | 'all'>('all');

  const filtered = checkpoints.filter(
    (cp) => filter === 'all' || cp.type === filter,
  );

  return (
    <div className="page checkpoints-page">
      <h2 className="page__title">{t('КПП и маршруты', 'Checkpoints & routes')}</h2>
      <p className="page__subtitle">
        {t(
          'Карта и справочник наземных и воздушных точек для визарана',
          'Map and directory of land and air visa run points',
        )}
      </p>

      <div className="filter-tabs">
        <button
          type="button"
          className={`filter-tabs__btn${filter === 'all' ? ' filter-tabs__btn--active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {t('Все', 'All')}
        </button>
        <button
          type="button"
          className={`filter-tabs__btn${filter === 'land' ? ' filter-tabs__btn--active' : ''}`}
          onClick={() => setFilter('land')}
        >
          <AppIcon name="car" size={15} />
          {t('Наземные', 'Land')}
        </button>
        <button
          type="button"
          className={`filter-tabs__btn${filter === 'air' ? ' filter-tabs__btn--active' : ''}`}
          onClick={() => setFilter('air')}
        >
          <AppIcon name="plane" size={15} />
          {t('Воздушные', 'Air')}
        </button>
      </div>

      <CheckpointMap checkpoints={filtered} height="360px" />

      <div className="checkpoint-list">
        {filtered.map((cp) => (
          <CheckpointCard key={cp.id} checkpoint={cp} />
        ))}
      </div>
    </div>
  );
}
