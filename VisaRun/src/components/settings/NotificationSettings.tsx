import { useSettings } from '../../context/SettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import { ToggleSwitch } from './ToggleSwitch';

const REMINDER_OPTIONS = [
  { key: 'days14' as const, label: { ru: '14 дней', en: '14 days', vi: '14 ngày' } },
  { key: 'days7' as const, label: { ru: '7 дней', en: '7 days', vi: '7 ngày' } },
  { key: 'days3' as const, label: { ru: '3 дня', en: '3 days', vi: '3 ngày' } },
  { key: 'days1' as const, label: { ru: '1 день', en: '1 day', vi: '1 ngày' } },
];

export function NotificationSettings() {
  const { reminders, notificationTime, criticalAlerts, setReminders, setNotificationTime, setCriticalAlerts } =
    useSettings();
  const { t, lang } = useLanguage();

  const reminderLabel = (opt: (typeof REMINDER_OPTIONS)[number]) =>
    lang === 'vi' ? opt.label.vi : lang === 'en' ? opt.label.en : opt.label.ru;
  const notificationPermission =
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported';

  return (
    <div className="settings-panel">
      <p className="settings-panel__intro">
        {t(
          'Настройте push-напоминания, чтобы не пропустить дедлайн выезда.',
          'Configure push reminders so you never miss your exit deadline.',
          'Cấu hình thông báo đẩy để không bỏ lỡ hạn xuất cảnh.',
        )}
      </p>
      <p className="form-hint">
        {notificationPermission === 'granted'
          ? t('Локальные уведомления включены.', 'Local notifications are enabled.', 'Đã bật thông báo cục bộ.')
          : notificationPermission === 'denied'
            ? t(
                'Уведомления отключены в браузере. Разрешите их в настройках сайта.',
                'Notifications are blocked in browser. Allow them in site settings.',
                'Thông báo bị chặn trong trình duyệt. Hãy cho phép trong cài đặt trang.',
              )
            : t(
                'Разрешите уведомления в браузере для напоминаний по дедлайну.',
                'Allow browser notifications for deadline reminders.',
                'Cho phép thông báo trình duyệt để nhận nhắc hạn chót.',
              )}
      </p>

      <h4 className="settings-panel__subtitle">
        {t('Сетка напоминаний', 'Reminder schedule', 'Lịch nhắc nhở')}
      </h4>
      <div className="reminder-grid">
        {REMINDER_OPTIONS.map((opt) => (
          <label key={opt.key} className="reminder-grid__item">
            <input
              type="checkbox"
              checked={reminders[opt.key]}
              onChange={(e) => setReminders({ [opt.key]: e.target.checked })}
            />
            <span>{reminderLabel(opt)}</span>
          </label>
        ))}
      </div>

      <div className="form-group">
        <label htmlFor="notification-time">
          {t('Время уведомлений', 'Notification time', 'Giờ thông báo')}
        </label>
        <input
          id="notification-time"
          type="time"
          value={notificationTime}
          onChange={(e) => setNotificationTime(e.target.value)}
        />
        <p className="form-hint">
          {t(
            'Пуши придут только в выбранное время, например в 10:00 утра.',
            'Pushes arrive only at the chosen time, e.g. 10:00 AM.',
            'Thông báo chỉ gửi vào giờ đã chọn, ví dụ 10:00 sáng.',
          )}
        </p>
      </div>

      <ToggleSwitch
        id="critical-alerts"
        checked={criticalAlerts}
        onChange={setCriticalAlerts}
        label={t(
          'Критические алерты (48 ч)',
          'Critical alerts (48 h)',
          'Cảnh báo khẩn (48 giờ)',
        )}
        description={t(
          'Громкий сигнал за 48 часов до дедлайна, даже в режиме «Не беспокоить».',
          'Loud alert 48 hours before deadline, even in Do Not Disturb mode.',
          'Chuông to 48 giờ trước hạn, kể cả khi bật Không làm phiền.',
        )}
      />
    </div>
  );
}
