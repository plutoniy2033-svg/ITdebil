import { useSettings } from '../../context/SettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
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
  const { addNotification } = useNotifications();
  const { t, lang } = useLanguage();

  const reminderLabel = (opt: (typeof REMINDER_OPTIONS)[number]) =>
    lang === 'vi' ? opt.label.vi : lang === 'en' ? opt.label.en : opt.label.ru;

  const sendTestNotification = () => {
    addNotification({
      type: 'deadline',
      title: t('Тест VisaRun', 'VisaRun test', 'Thử VisaRun'),
      message: t(
        'Это тестовое in-app уведомление. Напоминания по дедлайну будут появляться здесь.',
        'This is a test in-app notification. Deadline reminders will appear here.',
        'Đây là thông báo thử trong ứng dụng. Nhắc hạn sẽ hiện ở đây.',
      ),
      daysRemaining: 7,
    });
  };

  return (
    <div className="settings-panel">
      <p className="settings-panel__intro">
        {t(
          'In-app напоминания о дедлайне выезда. Откройте колокольчик в шапке, чтобы посмотреть историю.',
          'In-app reminders about your exit deadline. Open the bell in the header to see history.',
          'Nhắc hạn xuất cảnh trong ứng dụng. Mở biểu tượng chuông ở đầu trang để xem lịch sử.',
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
            'Напоминание создаётся после этого времени, не чаще одного раза в день.',
            'Reminder is created after this time, at most once per day.',
            'Nhắc nhở được tạo sau thời gian này, tối đa một lần mỗi ngày.',
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
          'Дополнительное in-app уведомление за 48 часов до дедлайна.',
          'Extra in-app alert 48 hours before the deadline.',
          'Thông báo bổ sung trong app 48 giờ trước hạn.',
        )}
      />

      <div className="settings-divider" />

      <button type="button" className="btn btn--secondary" onClick={sendTestNotification}>
        {t('Отправить тестовое уведомление', 'Send test notification', 'Gửi thông báo thử')}
      </button>
    </div>
  );
}
