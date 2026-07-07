import { useState } from 'react';
import { tours } from '../data/tours';
import { agents } from '../data/agents';
import { TourCard } from '../components/TourCard';
import { AgentCard } from '../components/AgentCard';
import { AppIcon } from '../components/AppIcon';
import { useLanguage } from '../context/LanguageContext';

type Tab = 'tours' | 'agents';

export function ToursPage() {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>('tours');

  return (
    <div className="page tours-page">
      <h2 className="page__title">{t('Туры и агенты', 'Tours & agents')}</h2>
      <p className="page__subtitle">
        {t(
          'Визаран-автобусы и проверенные помогаторы',
          'Visa run buses and verified agents',
        )}
      </p>

      <div className="filter-tabs">
        <button
          type="button"
          className={`filter-tabs__btn${tab === 'tours' ? ' filter-tabs__btn--active' : ''}`}
          onClick={() => setTab('tours')}
        >
          <AppIcon name="bus" size={15} />
          {t('Автобусы', 'Buses')}
        </button>
        <button
          type="button"
          className={`filter-tabs__btn${tab === 'agents' ? ' filter-tabs__btn--active' : ''}`}
          onClick={() => setTab('agents')}
        >
          <AppIcon name="handshake" size={15} />
          {t('Помогаторы', 'Agents')}
        </button>
      </div>

      {tab === 'tours' && (
        <div className="tour-list">
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}

      {tab === 'agents' && (
        <div className="agent-list">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}
