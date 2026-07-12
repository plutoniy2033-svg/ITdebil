import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AppNotification, AppNotificationType } from '../types';

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (payload: {
    type: AppNotificationType;
    title: string;
    message: string;
    daysRemaining?: number;
  }) => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
}

const STORAGE_KEY = 'visarun-notifications';
const MAX_NOTIFICATIONS = 50;

const NotificationContext = createContext<NotificationContextValue | null>(null);

function loadNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AppNotification[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveNotifications(items: AppNotification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_NOTIFICATIONS)));
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(loadNotifications);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  const addNotification = useCallback(
    (payload: {
      type: AppNotificationType;
      title: string;
      message: string;
      daysRemaining?: number;
    }) => {
      setNotifications((current) => {
        const duplicate = current.some(
          (item) =>
            item.type === payload.type &&
            item.message === payload.message &&
            item.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10),
        );
        if (duplicate) return current;

        const next: AppNotification = {
          id: crypto.randomUUID(),
          type: payload.type,
          title: payload.title,
          message: payload.message,
          createdAt: new Date().toISOString(),
          read: false,
          daysRemaining: payload.daysRemaining,
        };

        return [next, ...current].slice(0, MAX_NOTIFICATIONS);
      });
    },
    [],
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllRead,
      dismiss,
      clearAll,
    }),
    [notifications, unreadCount, addNotification, markAsRead, markAllRead, dismiss, clearAll],
  );

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
