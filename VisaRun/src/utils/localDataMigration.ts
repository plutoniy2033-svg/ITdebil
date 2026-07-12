import type { AppSettings, VisaTrackerState } from '../types';
import type { ServerSettings } from '../api/userData';

const TRACKER_KEY = 'visarun-tracker';
const SETTINGS_KEY = 'visarun-settings';
const TRACKER_IMPORTED_KEY = 'visarun-tracker-imported';
const SETTINGS_IMPORTED_KEY = 'visarun-settings-imported';
const LOCAL_PIN_KEY = 'visarun-local-pin';

const defaultTracker: VisaTrackerState = {
  entryDate: '',
  exitDate: '',
  dayLimit: 45,
  location: 'Vietnam',
  citizenship: 'RU',
  entryType: 'visa-free',
  visaRunHistory: [],
};

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

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

export function saveLocalTracker(tracker: VisaTrackerState) {
  localStorage.setItem(TRACKER_KEY, JSON.stringify(tracker));
}

export function saveLocalSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(toServerSettings(settings)));
}

export function loadLegacyTracker(): VisaTrackerState {
  const parsed = readJson(TRACKER_KEY, defaultTracker);
  return {
    ...defaultTracker,
    ...parsed,
    visaRunHistory: parsed.visaRunHistory ?? [],
  };
}

export function loadLegacySettings(): AppSettings {
  const parsed = readJson(SETTINGS_KEY, defaultSettings);
  const pinCode = localStorage.getItem(LOCAL_PIN_KEY) ?? parsed.pinCode ?? '';
  return {
    ...defaultSettings,
    ...parsed,
    pinCode,
  };
}

export function isTrackerImported() {
  return localStorage.getItem(TRACKER_IMPORTED_KEY) === '1';
}

export function isSettingsImported() {
  return localStorage.getItem(SETTINGS_IMPORTED_KEY) === '1';
}

export function markTrackerImported() {
  localStorage.setItem(TRACKER_IMPORTED_KEY, '1');
  localStorage.removeItem(TRACKER_KEY);
}

export function markSettingsImported() {
  localStorage.setItem(SETTINGS_IMPORTED_KEY, '1');
  localStorage.removeItem(SETTINGS_KEY);
}

export function saveLocalPin(pinCode: string) {
  if (pinCode) {
    localStorage.setItem(LOCAL_PIN_KEY, pinCode);
  } else {
    localStorage.removeItem(LOCAL_PIN_KEY);
  }
}

export function isTrackerEmpty(tracker: VisaTrackerState) {
  return (
    !tracker.entryDate &&
    !tracker.exitDate &&
    tracker.visaRunHistory.length === 0 &&
    tracker.location === 'Vietnam' &&
    tracker.citizenship === 'RU' &&
    tracker.entryType === 'visa-free' &&
    tracker.dayLimit === 45
  );
}

export function toServerSettings(settings: AppSettings): Omit<AppSettings, 'pinEnabled' | 'pinCode'> {
  const { pinEnabled: _pinEnabled, pinCode: _pinCode, documentCacheSize, ...rest } = settings;
  return {
    ...rest,
    documentCacheSize,
  };
}

export function mergeLocalSecurity(settings: ServerSettings): AppSettings {
  const pinCode = localStorage.getItem(LOCAL_PIN_KEY) ?? '';
  return {
    ...settings,
    pinEnabled: pinCode.length >= 4,
    pinCode,
  };
}
