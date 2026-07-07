import type { Agent } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { AppIcon } from './AppIcon';

interface AgentCardProps {
  agent: Agent;
}

export function AgentCard({ agent }: AgentCardProps) {
  const { t } = useLanguage();

  return (
    <div className="agent-card">
      <div className="agent-card__header">
        <h3 className="agent-card__name">{agent.name}</h3>
        <div className="agent-card__rating">
          <span className="agent-card__stars icon-label">
            <AppIcon name="star" size={14} />
            {agent.rating}
          </span>
          <span className="text-muted">({agent.reviewCount})</span>
        </div>
      </div>
      <div className="agent-card__services">
        {agent.services.map((s) => (
          <span key={s} className="tag">{s}</span>
        ))}
      </div>
      <p className="agent-card__price">
        {t('от', 'from')} ${agent.priceFrom}
      </p>
      {agent.reviews.length > 0 && (
        <div className="agent-card__reviews">
          {agent.reviews.map((r, i) => (
            <blockquote key={i} className="review">
              <p>"{r.text}"</p>
              <footer className="icon-label">
                <span>— {r.author},</span>
                <AppIcon name="star" size={12} />
                {r.rating}
              </footer>
            </blockquote>
          ))}
        </div>
      )}
    </div>
  );
}
