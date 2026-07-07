import { useVisaTracker } from '../context/VisaTrackerContext';
import { useLanguage } from '../context/LanguageContext';
import type { VisaLimit } from '../types';

interface VisaSettingsPanelProps {
  showTitle?: boolean;
}

export function VisaSettingsPanel({ showTitle = true }: VisaSettingsPanelProps) {
  const {
    entryDate,
    exitDate,
    dayLimit,
    location,
    setEntryDate,
    setExitDate,
    setDayLimit,
    setLocation,
    daysUsed,
    daysRemaining,
    isOverstay,
    overstayDays,
  } = useVisaTracker();
  const { t } = useLanguage();

  return (
    <div className="visa-settings">
      {showTitle && (
        <div className="visa-settings__header">
          <h2 className="visa-settings__title">{t('Визовые данные', 'Visa details')}</h2>
        </div>
      )}

      <form className="visa-settings__form" onSubmit={(e) => e.preventDefault()}>
        <div className="form-group">
          <label htmlFor="location">{t('Местоположение', 'Location')}</label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t('Ho Chi Minh City', 'Ho Chi Minh City')}
          />
        </div>

        <div className="form-group">
          <label htmlFor="entry-date">{t('Дата въезда', 'Entry date')}</label>
          <input
            id="entry-date"
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="exit-date">{t('Планируемый выезд', 'Planned exit')}</label>
          <input
            id="exit-date"
            type="date"
            value={exitDate}
            onChange={(e) => setExitDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="day-limit">{t('Лимит дней', 'Day limit')}</label>
          <select
            id="day-limit"
            value={dayLimit}
            onChange={(e) => setDayLimit(Number(e.target.value) as VisaLimit)}
          >
            <option value={30}>30 {t('дней', 'days')}</option>
            <option value={45}>45 {t('дней', 'days')}</option>
            <option value={90}>90 {t('дней', 'days')}</option>
          </select>
        </div>
      </form>

      <div className="visa-settings__stats">
        <div className="visa-settings__stat">
          <span className="visa-settings__stat-value">{entryDate ? daysUsed : '—'}</span>
          <span className="visa-settings__stat-label">{t('Использовано', 'Used')}</span>
        </div>
        <div className="visa-settings__stat">
          <span className="visa-settings__stat-value">{dayLimit}</span>
          <span className="visa-settings__stat-label">{t('Лимит', 'Limit')}</span>
        </div>
      </div>

      {isOverstay && (
        <div className="alert alert--danger">
          {t(
            `Оверстей ${overstayDays} дн. Штраф ~$5–15/день.`,
            `Overstay ${overstayDays} days. Fine ~$5–15/day.`,
          )}
        </div>
      )}
      {!isOverstay && daysRemaining <= 7 && daysRemaining > 0 && entryDate && (
        <div className="alert alert--warning">
          {t(
            `Осталось ${daysRemaining} дн. Планируйте визаран.`,
            `${daysRemaining} days left. Plan your visa run.`,
          )}
        </div>
      )}
    </div>
  );
}
