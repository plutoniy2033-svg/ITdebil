import { useSearchParams } from 'react-router-dom';
import { companionPosts, borderReports } from '../data/community';
import { CompanionBoard } from '../components/CompanionBoard';
import { BorderFeed } from '../components/BorderFeed';
import { useLanguage } from '../context/LanguageContext';

export function CommunityPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const checkpointFromUrl = searchParams.get('checkpoint');

  return (
    <div className="page community-page">
      <h2 className="page__title">{t('Сообщество', 'Community')}</h2>
      <p className="page__subtitle">
        {t(
          'Попутчики и живая обстановка на границах',
          'Travel companions and live border updates',
        )}
      </p>

      <section className="community-section">
        <CompanionBoard initialPosts={companionPosts} />
      </section>

      <section className="community-section">
        <BorderFeed
          reports={borderReports}
          initialCheckpointId={checkpointFromUrl ?? undefined}
        />
      </section>
    </div>
  );
}
