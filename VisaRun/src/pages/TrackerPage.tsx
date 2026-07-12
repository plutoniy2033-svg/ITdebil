import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { VisaCounter } from '../components/VisaCounter';
import { useVisaTracker } from '../context/VisaTrackerContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import { useChecklist } from '../context/ChecklistContext';
import { CHECKLIST_CATEGORIES, VISA_RUN_CHECKLIST } from '../data/visaRunChecklist';

export function TrackerPage() {
  const { t, lang } = useLanguage();
  const { entryDate, daysRemaining, dayLimit, location } = useVisaTracker();
  const { notifications, markAsRead } = useNotifications();
  const {
    toggleItem,
    resetChecklist,
    requiredDone,
    requiredTotal,
    progressPercent,
    isReady,
    isChecked,
  } = useChecklist();
  const [isPlanVisible, setIsPlanVisible] = useState(true);
  const currentLocation = location.trim() || 'Vietnam';

  const unreadDeadline = useMemo(
    () =>
      notifications.find(
        (item) => !item.read && (item.type === 'deadline' || item.type === 'critical'),
      ),
    [notifications],
  );

  const categoryLabel = (category: (typeof CHECKLIST_CATEGORIES)[number]) => {
    if (lang === 'vi') return category.labelVi;
    if (lang === 'en') return category.labelEn;
    return category.labelRu;
  };

  const itemLabel = (item: (typeof VISA_RUN_CHECKLIST)[number]) => {
    if (lang === 'vi') return item.labelVi;
    if (lang === 'en') return item.labelEn;
    return item.labelRu;
  };

  const handleSharePlan = async () => {
    const planText = t(
      `План визарана\nЛокация: ${currentLocation}\nЛимит: ${dayLimit} дней\nОсталось: ${entryDate ? daysRemaining : 'не указано'}\nДата въезда: ${entryDate || 'не указана'}\nГотовность чеклиста: ${progressPercent}%`,
      `Visa-run plan\nLocation: ${currentLocation}\nLimit: ${dayLimit} days\nRemaining: ${entryDate ? daysRemaining : 'not set'}\nEntry date: ${entryDate || 'not set'}\nChecklist readiness: ${progressPercent}%`,
      `Kế hoạch visa run\nVị trí: ${currentLocation}\nGiới hạn: ${dayLimit} ngày\nCòn lại: ${entryDate ? daysRemaining : 'chưa đặt'}\nNgày nhập cảnh: ${entryDate || 'chưa đặt'}\nMức sẵn sàng checklist: ${progressPercent}%`,
    );

    try {
      if (navigator.share) {
        await navigator.share({ title: 'VisaRun', text: planText });
        return;
      }
      await navigator.clipboard.writeText(planText);
      window.alert(
        t(
          'План скопирован в буфер обмена.',
          'Plan copied to clipboard.',
          'Đã sao chép kế hoạch vào bộ nhớ tạm.',
        ),
      );
    } catch {
      window.alert(
        t('Не удалось поделиться планом.', 'Could not share the plan.', 'Không thể chia sẻ kế hoạch.'),
      );
    }
  };

  return (
    <div className="tracker-page">
      <div className="tracker-page__hero">
        {unreadDeadline && (
          <div className="tracker-alert-banner" role="status">
            <div>
              <strong>{unreadDeadline.title}</strong>
              <p>{unreadDeadline.message}</p>
            </div>
            <button
              type="button"
              className="btn btn--secondary btn--small"
              onClick={() => markAsRead(unreadDeadline.id)}
            >
              {t('Понятно', 'Got it', 'Đã hiểu')}
            </button>
          </div>
        )}

        <VisaCounter />

        <section className="tracker-checklist card">
          <button
            type="button"
            className="tracker-checklist__toggle"
            onClick={() => setIsPlanVisible((prev) => !prev)}
            aria-label={
              isPlanVisible
                ? t('Свернуть чеклист', 'Collapse checklist', 'Thu gọn checklist')
                : t('Развернуть чеклист', 'Expand checklist', 'Mở rộng checklist')
            }
          >
            {isPlanVisible ? '▲' : '▼'}
          </button>

          <div className="tracker-checklist__header">
            <div>
              <h3>{t('Чеклист визарана', 'Visa-run checklist', 'Checklist visa run')}</h3>
              <p className="tracker-checklist__subtitle">
                {isReady
                  ? t('Готов к выезду', 'Ready to go', 'Sẵn sàng xuất cảnh')
                  : t('Подготовка к выезду', 'Preparing for exit', 'Chuẩn bị xuất cảnh')}
              </p>
            </div>
            <span className="tag">
              {requiredDone}/{requiredTotal}
            </span>
          </div>

          <div className="tracker-checklist__progress" aria-hidden>
            <div
              className={`tracker-checklist__progress-bar${isReady ? ' tracker-checklist__progress-bar--ready' : ''}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="tracker-checklist__progress-label">
            {t(
              `Обязательные пункты: ${progressPercent}%`,
              `Required items: ${progressPercent}%`,
              `Mục bắt buộc: ${progressPercent}%`,
            )}
          </p>

          {isPlanVisible && (
            <>
              {CHECKLIST_CATEGORIES.map((category) => {
                const items = VISA_RUN_CHECKLIST.filter((item) => item.category === category.id);
                return (
                  <div key={category.id} className="tracker-checklist__section">
                    <h4>{categoryLabel(category)}</h4>
                    <ul className="tracker-checklist__list">
                      {items.map((item) => (
                        <li key={item.id} className="tracker-checklist__item">
                          <label className="tracker-checklist__label">
                            <input
                              type="checkbox"
                              checked={isChecked(item.id)}
                              onChange={() => toggleItem(item.id)}
                            />
                            <span>{itemLabel(item)}</span>
                            {item.required && (
                              <span className="tracker-checklist__required">
                                {t('обяз.', 'req.', 'bắt buộc')}
                              </span>
                            )}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              <div className="tracker-checklist__actions">
                <button type="button" className="btn btn--secondary" onClick={handleSharePlan}>
                  {t('Поделиться планом', 'Share plan', 'Chia sẻ kế hoạch')}
                </button>
                <Link to="/checkpoints" className="btn btn--secondary">
                  {t('Выбрать КПП', 'Pick checkpoint', 'Chọn cửa khẩu')}
                </Link>
                <button type="button" className="btn btn--ghost" onClick={resetChecklist}>
                  {t('Сбросить чеклист', 'Reset checklist', 'Đặt lại checklist')}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
