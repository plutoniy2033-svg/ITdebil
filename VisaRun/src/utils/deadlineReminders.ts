import type { AppNotificationType, ReminderSettings } from '../types';

export const REMINDER_SENT_KEY = 'visarun-reminder-sent';

export interface ReminderTrigger {
  type: AppNotificationType;
  dedupeKey: string;
  daysRemaining?: number;
}

export interface ReminderCheckInput {
  entryDate: string;
  daysRemaining: number;
  isOverstay: boolean;
  overstayDays: number;
  reminders: ReminderSettings;
  criticalAlerts: boolean;
  notificationTime: string;
  now: Date;
  lastSentKey: string | null;
}

const THRESHOLDS = [
  { key: 'days14' as const, value: 14 },
  { key: 'days7' as const, value: 7 },
  { key: 'days3' as const, value: 3 },
  { key: 'days1' as const, value: 1 },
];

export function isNotificationTimeReached(notificationTime: string, now: Date): boolean {
  const match = /^(\d{2}):(\d{2})$/.exec(notificationTime);
  if (!match) return true;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const scheduledMinutes = hours * 60 + minutes;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return currentMinutes >= scheduledMinutes;
}

export function getDayStamp(now: Date): string {
  return now.toISOString().slice(0, 10);
}

export function evaluateDeadlineReminder(input: ReminderCheckInput): ReminderTrigger | null {
  if (!input.entryDate) return null;
  if (!isNotificationTimeReached(input.notificationTime, input.now)) return null;

  const dayStamp = getDayStamp(input.now);

  if (input.isOverstay) {
    const dedupeKey = `overstay:${dayStamp}`;
    if (input.lastSentKey === dedupeKey) return null;
    return { type: 'overstay', dedupeKey, daysRemaining: input.daysRemaining };
  }

  const activeThreshold = THRESHOLDS.find(
    (item) => item.value === input.daysRemaining && input.reminders[item.key],
  );

  if (activeThreshold) {
    const dedupeKey = `${activeThreshold.key}:${dayStamp}:${input.daysRemaining}`;
    if (input.lastSentKey !== dedupeKey) {
      return {
        type: 'deadline',
        dedupeKey,
        daysRemaining: input.daysRemaining,
      };
    }
  }

  if (
    input.criticalAlerts &&
    input.daysRemaining <= 2 &&
    input.daysRemaining >= 0
  ) {
    const dedupeKey = `critical:${dayStamp}:${input.daysRemaining}`;
    if (input.lastSentKey !== dedupeKey) {
      return {
        type: 'critical',
        dedupeKey,
        daysRemaining: input.daysRemaining,
      };
    }
  }

  return null;
}

export function buildReminderMessages(
  trigger: ReminderTrigger,
  t: (ru: string, en: string, vi: string) => string,
): { title: string; message: string } {
  const title = t('Напоминание VisaRun', 'VisaRun reminder', 'Nhắc nhở VisaRun');

  if (trigger.type === 'overstay') {
    return {
      title: t('Просрочка визы', 'Visa overstay', 'Quá hạn visa'),
      message: t(
        'Срок пребывания истёк. Срочно спланируйте выезд или продление.',
        'Your stay period has expired. Plan exit or extension urgently.',
        'Thời gian lưu trú đã hết. Hãy lên kế hoạch xuất cảnh hoặc gia hạn ngay.',
      ),
    };
  }

  const days = trigger.daysRemaining ?? 0;

  if (trigger.type === 'critical') {
    return {
      title,
      message: t(
        `До дедлайна осталось ${days} дн. Проверьте документы и маршрут.`,
        `${days} days left before the deadline. Check docs and route.`,
        `Còn ${days} ngày trước hạn. Hãy kiểm tra giấy tờ và tuyến đường.`,
      ),
    };
  }

  return {
    title,
    message: t(
      `Осталось ${days} дн. до выезда.`,
      `${days} days left before exit.`,
      `Còn ${days} ngày trước khi xuất cảnh.`,
    ),
  };
}
