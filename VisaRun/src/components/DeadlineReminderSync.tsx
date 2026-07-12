import { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useVisaTracker } from '../context/VisaTrackerContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationContext';
import {
  REMINDER_SENT_KEY,
  buildReminderMessages,
  evaluateDeadlineReminder,
} from '../utils/deadlineReminders';

export function DeadlineReminderSync() {
  const { reminders, criticalAlerts, notificationTime } = useSettings();
  const { entryDate, daysRemaining, isOverstay, overstayDays } = useVisaTracker();
  const { t } = useLanguage();
  const { addNotification } = useNotifications();

  useEffect(() => {
    const checkReminders = () => {
      const trigger = evaluateDeadlineReminder({
        entryDate,
        daysRemaining,
        isOverstay,
        overstayDays,
        reminders,
        criticalAlerts,
        notificationTime,
        now: new Date(),
        lastSentKey: localStorage.getItem(REMINDER_SENT_KEY),
      });

      if (!trigger) return;

      const { title, message } = buildReminderMessages(trigger, t);
      addNotification({
        type: trigger.type,
        title,
        message,
        daysRemaining: trigger.daysRemaining,
      });
      localStorage.setItem(REMINDER_SENT_KEY, trigger.dedupeKey);
    };

    checkReminders();
    const intervalId = window.setInterval(checkReminders, 60_000);
    return () => window.clearInterval(intervalId);
  }, [
    addNotification,
    criticalAlerts,
    daysRemaining,
    entryDate,
    isOverstay,
    notificationTime,
    overstayDays,
    reminders,
    t,
  ]);

  return null;
}
