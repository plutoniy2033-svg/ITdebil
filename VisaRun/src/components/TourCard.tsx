import { useState } from 'react';
import type { Tour } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { AppIcon } from './AppIcon';

interface TourCardProps {
  tour: Tour;
}

export function TourCard({ tour }: TourCardProps) {
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="tour-card">
        <div className="tour-card__demo-badge">
          <span className="badge badge--warning">{t('Demo', 'Demo', 'Demo')}</span>
        </div>
        <div className="tour-card__route">
          <span>{tour.from}</span>
          <AppIcon name="arrow-right" size={16} className="tour-card__arrow" />
          <span>{tour.to}</span>
        </div>
        <div className="tour-card__meta">
          <span className="icon-label">
            <AppIcon name="clock" size={15} />
            {tour.departure}
          </span>
          <span className="icon-label">
            <AppIcon name="van" size={15} />
            {tour.vehicle}
          </span>
        </div>
        <div className="tour-card__footer">
          <div>
            <span className="tour-card__price">${tour.priceUsd}</span>
            <span className="tour-card__seats">
              {t(`${tour.seatsLeft} мест`, `${tour.seatsLeft} seats`)}
            </span>
          </div>
          <button type="button" className="btn btn--primary btn--sm" onClick={() => setShowModal(true)}>
            {t('Забронировать', 'Book')}
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t('Бронирование', 'Booking')}</h3>
            <p className="icon-label">
              <span>{tour.from}</span>
              <AppIcon name="arrow-right" size={14} />
              <span>{tour.to}</span>
            </p>
            <p className="text-muted">
              {t(
                'Функция в разработке. Пока можно только посмотреть маршрут и цену.',
                'Feature in development. For now you can only view route and price.',
              )}
            </p>
            <button type="button" className="btn btn--primary" onClick={() => setShowModal(false)}>
              {t('Закрыть', 'Close')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
