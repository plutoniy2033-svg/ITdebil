import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { AppSettings, ReminderSettings } from '../types';
import { fetchSettings, saveSettings } from '../api/userData';
import {
  isSettingsImported,
  loadLegacySettings,
  markSettingsImported,
  mergeLocalSecurity,
  saveLocalPin,
  saveLocalSettings,
  toServerSettings,
} from '../utils/localDataMigration';

interface SettingsContextValue extends AppSettings {
  loading: boolean;
  isLocalMode: boolean;
  error: string | null;
  reload: () => Promise<void>;
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

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hydratedRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);
  const localModeRef = useRef(false);

  const persistSettings = useCallback(async (nextSettings: AppSettings) => {
    if (localModeRef.current) {
      saveLocalSettings(nextSettings);
      setError(null);
      return;
    }

    try {
      const result = await saveSettings(toServerSettings(nextSettings));
      setSettings(mergeLocalSecurity(result.settings));
      setError(null);
    } catch {
      localModeRef.current = true;
      setIsLocalMode(true);
      saveLocalSettings(nextSettings);
      setError(null);
    }
  }, []);

  const scheduleSave = useCallback(
    (nextSettings: AppSettings) => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
      saveTimerRef.current = window.setTimeout(() => {
        void persistSettings(nextSettings);
      }, 400);
    },
    [persistSettings],
  );

  const loadFromServer = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let serverSettings = (await fetchSettings()).settings;
      localModeRef.current = false;
      setIsLocalMode(false);

      if (!isSettingsImported()) {
        const legacy = loadLegacySettings();
        const hasLegacyData =
          JSON.stringify(toServerSettings(legacy)) !== JSON.stringify(toServerSettings(defaultSettings));

        if (hasLegacyData) {
          serverSettings = (await saveSettings(toServerSettings(legacy))).settings;
        }
        markSettingsImported();
      }

      setSettings(mergeLocalSecurity(serverSettings));
      hydratedRef.current = true;
    } catch {
      localModeRef.current = true;
      setIsLocalMode(true);
      setSettings(loadLegacySettings());
      hydratedRef.current = true;
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFromServer();
    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [loadFromServer]);

  const updateSettings = useCallback(
    (updater: (current: AppSettings) => AppSettings, syncToServer = true) => {
      setSettings((current) => {
        const next = updater(current);
        if (hydratedRef.current && syncToServer) {
          scheduleSave(next);
        }
        return next;
      });
    },
    [scheduleSave],
  );

  const value: SettingsContextValue = {
    ...settings,
    loading,
    isLocalMode,
    error,
    reload: loadFromServer,
    setReminders: (patch) =>
      updateSettings((s) => ({ ...s, reminders: { ...s.reminders, ...patch } })),
    setNotificationTime: (notificationTime) =>
      updateSettings((s) => ({ ...s, notificationTime })),
    setCriticalAlerts: (criticalAlerts) =>
      updateSettings((s) => ({ ...s, criticalAlerts })),
    setCurrency: (currency) => updateSettings((s) => ({ ...s, currency })),
    setOfflineCache: (offlineCache) =>
      updateSettings((s) => ({
        ...s,
        offlineCache,
        documentCacheSize: offlineCache ? 12 : 0,
      })),
    setBiometricsEnabled: (biometricsEnabled) =>
      updateSettings((s) => ({ ...s, biometricsEnabled })),
    setPinEnabled: (pinEnabled) =>
      updateSettings((s) => {
        const pinCode = pinEnabled ? s.pinCode : '';
        saveLocalPin(pinCode);
        return { ...s, pinEnabled, pinCode };
      }, false),
    setPinCode: (pinCode) =>
      updateSettings((s) => {
        saveLocalPin(pinCode);
        return { ...s, pinCode, pinEnabled: pinCode.length >= 4 };
      }, false),
    setPartnerMode: (partnerMode) => updateSettings((s) => ({ ...s, partnerMode })),
    setPartnerRoute: (partnerRoute) => updateSettings((s) => ({ ...s, partnerRoute })),
    setPartnerTariff: (partnerTariff) => updateSettings((s) => ({ ...s, partnerTariff })),
    clearDocumentCache: () => {
      localStorage.removeItem('visarun-document-cache');
      updateSettings((s) => ({ ...s, documentCacheSize: 0 }), false);
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
