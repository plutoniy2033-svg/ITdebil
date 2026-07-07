import { useLanguage } from '../../context/LanguageContext';
import { useSettings } from '../../context/SettingsContext';
import type { Currency, Language } from '../../types';
import { ToggleSwitch } from './ToggleSwitch';

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
  { code: 'vi', label: 'Tiếng Việt' },
];

const CURRENCIES: { code: Currency; label: string }[] = [
  { code: 'VND', label: '₫ VND' },
  { code: 'USD', label: '$ USD' },
  { code: 'RUB', label: '₽ RUB' },
];

export function LocalizationSettings() {
  const { lang, setLang, t } = useLanguage();
  const { currency, offlineCache, setCurrency, setOfflineCache } = useSettings();

  return (
    <div className="settings-panel">
      <p className="settings-panel__intro">
        {t(
          'Язык, валюта и офлайн-режим для экспатов во Вьетнаме.',
          'Language, currency and offline mode for expats in Vietnam.',
          'Ngôn ngữ, tiền tệ và chế độ ngoại tuyến cho expat tại Việt Nam.',
        )}
      </p>

      <div className="settings-block">
        <h4 className="settings-panel__subtitle">
          {t('Язык приложения', 'App language', 'Ngôn ngữ ứng dụng')}
        </h4>
        <div className="lang-toggle lang-toggle--large">
          {LANGUAGES.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              className={`lang-toggle__btn${lang === code ? ' lang-toggle__btn--active' : ''}`}
              onClick={() => setLang(code)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="currency">
          {t('Основная валюта', 'Primary currency', 'Tiền tệ chính')}
        </label>
        <select
          id="currency"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
        >
          {CURRENCIES.map(({ code, label }) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
        <p className="form-hint">
          {t(
            'Цены в маркетплейсе туров отображаются в выбранной валюте.',
            'Tour marketplace prices are shown in the selected currency.',
            'Giá tour hiển thị theo tiền tệ đã chọn.',
          )}
        </p>
      </div>

      <ToggleSwitch
        id="offline-cache"
        checked={offlineCache}
        onChange={setOfflineCache}
        label={t(
          'Автосохранение документов',
          'Auto-save documents offline',
          'Tự lưu tài liệu ngoại tuyến',
        )}
        description={t(
          'Кэширует сканы виз, паспортов и QR-коды для границы без интернета.',
          'Caches visa scans, passports and QR codes for border use without internet.',
          'Lưu bản quét visa, hộ chiếu và mã QR để dùng tại cửa khẩu không cần mạng.',
        )}
      />
    </div>
  );
}
