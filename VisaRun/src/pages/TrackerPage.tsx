import { useMemo, useState } from 'react';
import { VisaCounter } from '../components/VisaCounter';
import { useVisaTracker } from '../context/VisaTrackerContext';
import { useLanguage } from '../context/LanguageContext';

export function TrackerPage() {
  const { t } = useLanguage();
  const { entryDate, daysRemaining, dayLimit, location, visaRunHistory } = useVisaTracker();
  const [isPlanVisible, setIsPlanVisible] = useState(true);
  const currentLocation = location.trim() || 'Vietnam';

  const readinessItems = useMemo(
    () => [
      {
        id: 'entry-date',
        done: Boolean(entryDate),
        text: t('Дата прибытия', 'Arrival date', 'Ngày đến'),
      },
      {
        id: 'route',
        done: visaRunHistory.length > 0,
        text:
          visaRunHistory.length > 0
            ? t('Маршрут выбран', 'Route selected', 'Đã chọn tuyến đường')
            : t('Маршрут не выбран', 'Route is not selected', 'Chưa chọn tuyến đường'),
      },
      {
        id: 'location',
        done: true,
        text: t('Текущая локация', 'Current location', 'Vị trí hiện tại'),
      },
    ],
    [entryDate, t, visaRunHistory.length],
  );

  const readinessDone = readinessItems.filter((item) => item.done).length;

  const handleSharePlan = async () => {
    const planText = t(
      `План визарана\nЛокация: ${currentLocation}\nЛимит: ${dayLimit} дней\nОсталось: ${entryDate ? daysRemaining : 'не указано'}\nДата въезда: ${entryDate || 'не указана'}`,
      `Visa-run plan\nLocation: ${currentLocation}\nLimit: ${dayLimit} days\nRemaining: ${entryDate ? daysRemaining : 'not set'}\nEntry date: ${entryDate || 'not set'}`,
      `Kế hoạch visa run\nVị trí: ${currentLocation}\nGiới hạn: ${dayLimit} ngày\nCòn lại: ${entryDate ? daysRemaining : 'chưa đặt'}\nNgày nhập cảnh: ${entryDate || 'chưa đặt'}`,
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
        <VisaCounter />
        <section className="tracker-checklist card">
          <button
            type="button"
            className="tracker-checklist__toggle"
            onClick={() => setIsPlanVisible((prev) => !prev)}
            aria-label={
              isPlanVisible
                ? t('Свернуть план визарана', 'Collapse visa-run plan', 'Thu gọn kế hoạch visa run')
                : t('Развернуть план визарана', 'Expand visa-run plan', 'Mở rộng kế hoạch visa run')
            }
          >
            {isPlanVisible ? '▲' : '▼'}
          </button>
          <div className="tracker-checklist__header">
            <h3>{t('План визарана', 'Visa-run plan', 'Kế hoạch visa run')}</h3>
            <span className="tag">
              {readinessDone}/{readinessItems.length}
            </span>
          </div>
          {isPlanVisible && (
            <>
              <ul className="tracker-checklist__list">
                {readinessItems.map((item) => (
                  <li key={item.id} className="tracker-checklist__item">
                    <span className={`badge ${item.done ? 'badge--success' : 'badge--warning'}`}>
                      {item.done ? t('Готово', 'Done', 'Xong') : t('Нужно', 'Needed', 'Cần làm')}
                    </span>
                    <span>
                      {item.id === 'location' ? `${item.text}: ${currentLocation}` : item.text}
                    </span>
                  </li>
                ))}
              </ul>
              <button type="button" className="btn btn--secondary" onClick={handleSharePlan}>
                {t('Поделиться планом', 'Share plan', 'Chia sẻ kế hoạch')}
              </button>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
