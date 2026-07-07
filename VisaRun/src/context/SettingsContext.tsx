import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { AppSettings, ReminderSettings } from '../types';

interface SettingsContextValue extends AppSettings {
  setReminders: (reminders: Partial<ReminderSettings>) => void;
  setNotificationTime: (time: string) => void;
  setCriticalAlerts: (enabled: boolean) => void;
  setCurrency: (currency: AppSettings['currency']) => void;
  setOfflineCache: (enabled: boolean) => void;
  setBiometricsEnabled: (enabled: boolean) => void;
  setPinEnabled: (enabled: boolean) => void;
  setPinCode: (pin: string) => void;
  setPartnerMode: (enabled: boolean) => void;
  setPartnerRoute: (route: string) => void;
  setPartnerTariff: (tariff: string) => void;
  clearDocumentCache: () => void;
}

const STORAGE_KEY = 'visarun-settings';

const defaultSettings: AppSettings = {
  reminders: { days14: true, days7: true, days3: true, days1: true },
  notificationTime: '10:00',
  criticalAlerts: false,
  currency: 'USD',
  offlineCache: false,
  biometricsEnabled: false,
  pinEnabled: false,
  pinCode: '',
  partnerMode: false,
  partnerRoute: 'Ho Chi Minh — Moc Bai',
  partnerTariff: '',
  documentCacheSize: 0,
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    /* ignore corrupt data */
  }
  return defaultSettings;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const value: SettingsContextValue = {
    ...settings,
    setReminders: (patch) =>
      setSettings((s) => ({ ...s, reminders: { ...s.reminders, ...patch } })),
    setNotificationTime: (notificationTime) =>
      setSettings((s) => ({ ...s, notificationTime })),
    setCriticalAlerts: (criticalAlerts) =>
      setSettings((s) => ({ ...s, criticalAlerts })),
    setCurrency: (currency) => setSettings((s) => ({ ...s, currency })),
    setOfflineCache: (offlineCache) =>
      setSettings((s) => ({
        ...s,
        offlineCache,
        documentCacheSize: offlineCache ? 12 : 0,
      })),
    setBiometricsEnabled: (biometricsEnabled) =>
      setSettings((s) => ({ ...s, biometricsEnabled })),
    setPinEnabled: (pinEnabled) =>
      setSettings((s) => ({ ...s, pinEnabled, pinCode: pinEnabled ? s.pinCode : '' })),
    setPinCode: (pinCode) => setSettings((s) => ({ ...s, pinCode })),
    setPartnerMode: (partnerMode) => setSettings((s) => ({ ...s, partnerMode })),
    setPartnerRoute: (partnerRoute) => setSettings((s) => ({ ...s, partnerRoute })),
    setPartnerTariff: (partnerTariff) => setSettings((s) => ({ ...s, partnerTariff })),
    clearDocumentCache: () => {
      localStorage.removeItem('visarun-document-cache');
      setSettings((s) => ({ ...s, documentCacheSize: 0 }));
    },
  };

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
