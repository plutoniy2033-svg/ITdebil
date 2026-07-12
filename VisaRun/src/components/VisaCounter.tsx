import { useState } from 'react';
import { useVisaTracker } from '../context/VisaTrackerContext';
import { useLanguage } from '../context/LanguageContext';
import { EntryDateModal } from './EntryDateModal';
import { buildDeadlineIcs, downloadIcsFile } from '../utils/calendarExport';

export function VisaCounter() {
  const {
    entryDate,
    dayLimit,
    daysUsed,
    daysRemaining,
    isOverstay,
    overstayDays,
    statusColor,
    location,
  } = useVisaTracker();
  const { t } = useLanguage();
  const [showEntryModal, setShowEntryModal] = useState(false);

  const progress = dayLimit > 0 ? Math.min(100, (daysUsed / dayLimit) * 100) : 0;

  const handleExportCalendar = () => {
    const ics = buildDeadlineIcs({
      entryDate,
      dayLimit,
      location: location.trim() || 'Vietnam',
      title: t('Дедлайн визы VisaRun', 'VisaRun visa deadline', 'Hạn visa VisaRun'),
      description: t(
        `Последний день пребывания в ${location || 'Vietnam'}. Запланируйте визаран заранее.`,
        `Last legal day in ${location || 'Vietnam'}. Plan your visa run in advance.`,
        `Ngày cuối hợp pháp tại ${location || 'Vietnam'}. Hãy lên kế hoạch visa run sớm.`,
      ),
    });

    if (!ics) return;
    downloadIcsFile(ics, 'visarun-deadline.ics');
  };

  return (
    <div className="visa-hero">
      <div className="visa-hero__glow visa-hero__glow--1" aria-hidden />
      <div className="visa-hero__glow visa-hero__glow--2" aria-hidden />

      <div className="visa-hero__content">
        <button
          type="button"
          className={`visa-hero__ring visa-hero__ring--${statusColor} visa-hero__ring--clickable`}
          onClick={() => setShowEntryModal(true)}
          aria-label={t(
            'Изменить дату въезда',
            'Change entry date',
            'Thay đổi ngày nhập cảnh',
          )}
        >
          <svg viewBox="0 0 200 200" className="visa-hero__svg">
            <circle cx="100" cy="100" r="88" className="visa-hero__track" />
            <circle
              cx="100"
              cy="100"
              r="88"
              className="visa-hero__progress"
              style={{
                strokeDasharray: `${2 * Math.PI * 88}`,
                strokeDashoffset: `${2 * Math.PI * 88 * (1 - progress / 100)}`,
              }}
            />
          </svg>
          <div className="visa-hero__display">
            {isOverstay ? (
              <>
                <span className="visa-hero__number visa-hero__number--danger">
                  {overstayDays}
                </span>
                <span className="visa-hero__label">
                  {t('дней оверстея', 'days overstay')}
                </span>
              </>
            ) : (
              <>
                <span className={`visa-hero__number visa-hero__number--${statusColor}`}>
                  {entryDate ? daysRemaining : '—'}
                </span>
                <span className="visa-hero__label">
                  {t('дней осталось', 'days remaining')}
                </span>
              </>
            )}
          </div>
        </button>

        <p className="visa-hero__hint">
          {!entryDate
            ? t(
                'Нажмите на круг, чтобы указать дату въезда',
                'Tap the ring to set your entry date',
                'Chạm vào vòng tròn để nhập ngày nhập cảnh',
              )
            : isOverstay
              ? t('Срочно нужен визаран', 'Visa run needed urgently')
              : t(
                  `${daysUsed} из ${dayLimit} дней использовано`,
                  `${daysUsed} of ${dayLimit} days used`,
                )}
        </p>

        {entryDate && (
          <button type="button" className="btn btn--secondary btn--small visa-hero__calendar-btn" onClick={handleExportCalendar}>
            {t('Добавить в календарь (.ics)', 'Add to calendar (.ics)', 'Thêm vào lịch (.ics)')}
          </button>
        )}
      </div>

      {showEntryModal && <EntryDateModal onClose={() => setShowEntryModal(false)} />}
    </div>
  );
}
