import { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useVisaTracker } from '../context/VisaTrackerContext';
import { useLanguage } from '../context/LanguageContext';

const SENT_KEY = 'visarun-reminder-sent';

export function DeadlineReminderSync() {
  const { reminders, criticalAlerts } = useSettings();
  const { entryDate, daysRemaining, isOverstay } = useVisaTracker();
  const { t } = useLanguage();

  useEffect(() => {
    if (!entryDate || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      void Notification.requestPermission();
    }
  }, [entryDate]);

  useEffect(() => {
    if (!entryDate || !('Notification' in window) || Notification.permission !== 'granted') return;
    if (isOverstay) return;

    const thresholdMap = [
      { key: 'days14', value: 14, enabled: reminders.days14 },
      { key: 'days7', value: 7, enabled: reminders.days7 },
      { key: 'days3', value: 3, enabled: reminders.days3 },
      { key: 'days1', value: 1, enabled: reminders.days1 },
    ] as const;

    const active = thresholdMap.find((item) => item.value === daysRemaining && item.enabled);
    if (!active && !(criticalAlerts && daysRemaining <= 2 && daysRemaining >= 0)) return;

    const dayStamp = new Date().toISOString().slice(0, 10);
    const reminderKey = active ? active.key : 'critical';
    const dedupeKey = `${reminderKey}:${dayStamp}:${daysRemaining}`;
    const sent = localStorage.getItem(SENT_KEY);
    if (sent === dedupeKey) return;

    // Реальное локальное уведомление: показываем только нужный порог и не дублируем чаще 1 раза в день.
    const title = t('Напоминание VisaRun', 'VisaRun reminder', 'Nhắc nhở VisaRun');
    const body = criticalAlerts && daysRemaining <= 2
      ? t(
          `До дедлайна осталось ${daysRemaining} дн. Проверьте документы и маршрут.`,
          `${daysRemaining} days left before the deadline. Check docs and route.`,
          `Còn ${daysRemaining} ngày trước hạn. Hãy kiểm tra giấy tờ và tuyến đường.`,
        )
      : t(
          `Осталось ${daysRemaining} дн. до выезда.`,
          `${daysRemaining} days left before exit.`,
          `Còn ${daysRemaining} ngày trước khi xuất cảnh.`,
        );
    new Notification(title, { body });
    localStorage.setItem(SENT_KEY, dedupeKey);
  }, [criticalAlerts, daysRemaining, entryDate, isOverstay, reminders, t]);

  return null;
}
