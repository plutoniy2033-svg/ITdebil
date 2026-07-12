import { useEffect, useRef, useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllRead, dismiss } = useNotifications();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="notification-bell" ref={panelRef}>
      <button
        type="button"
        className="notification-bell__button"
        aria-label={t('Уведомления', 'Notifications', 'Thông báo')}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-bell__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notification-bell__panel">
          <div className="notification-bell__header">
            <h3>{t('Уведомления', 'Notifications', 'Thông báo')}</h3>
            {notifications.length > 0 && (
              <button type="button" className="btn btn--ghost btn--small" onClick={markAllRead}>
                {t('Прочитать все', 'Mark all read', 'Đọc tất cả')}
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="notification-bell__empty">
              {t('Пока нет уведомлений.', 'No notifications yet.', 'Chưa có thông báo.')}
            </p>
          ) : (
            <ul className="notification-bell__list">
              {notifications.map((item) => (
                <li
                  key={item.id}
                  className={`notification-bell__item${item.read ? '' : ' notification-bell__item--unread'}`}
                >
                  <button
                    type="button"
                    className="notification-bell__item-body"
                    onClick={() => markAsRead(item.id)}
                  >
                    <span className={`notification-bell__type notification-bell__type--${item.type}`}>
                      {item.type === 'overstay'
                        ? t('Просрочка', 'Overstay', 'Quá hạn')
                        : item.type === 'critical'
                          ? t('Критично', 'Critical', 'Khẩn')
                          : t('Дедлайн', 'Deadline', 'Hạn chót')}
                    </span>
                    <strong>{item.title}</strong>
                    <span>{item.message}</span>
                    <time>{formatTime(item.createdAt)}</time>
                  </button>
                  <button
                    type="button"
                    className="notification-bell__dismiss"
                    aria-label={t('Удалить', 'Dismiss', 'Xóa')}
                    onClick={() => dismiss(item.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
