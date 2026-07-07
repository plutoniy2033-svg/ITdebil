import { useSettings } from '../../context/SettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import { ToggleSwitch } from './ToggleSwitch';

export function SecuritySettings() {
  const {
    biometricsEnabled,
    pinEnabled,
    pinCode,
    documentCacheSize,
    setBiometricsEnabled,
    setPinEnabled,
    setPinCode,
    clearDocumentCache,
  } = useSettings();
  const { t } = useLanguage();

  return (
    <div className="settings-panel">
      <p className="settings-panel__intro">
        {t(
          'Защита персональных данных и управление кэшем документов.',
          'Protect personal data and manage document cache.',
          'Bảo vệ dữ liệu cá nhân và quản lý bộ nhớ đệm tài liệu.',
        )}
      </p>

      <ToggleSwitch
        id="biometrics"
        checked={biometricsEnabled}
        onChange={setBiometricsEnabled}
        label={t('Face ID / Touch ID', 'Face ID / Touch ID', 'Face ID / Touch ID')}
        description={t(
          'Вход в приложение по биометрии.',
          'Unlock the app with biometrics.',
          'Mở khóa ứng dụng bằng sinh trắc học.',
        )}
      />

      <ToggleSwitch
        id="pin-code"
        checked={pinEnabled}
        onChange={setPinEnabled}
        label={t('PIN-код', 'PIN code', 'Mã PIN')}
        description={t(
          'Короткий PIN для входа, если биометрия недоступна.',
          'Short PIN when biometrics are unavailable.',
          'PIN ngắn khi không dùng được sinh trắc học.',
        )}
      />

      {pinEnabled && (
        <div className="form-group">
          <label htmlFor="pin-input">{t('Ваш PIN', 'Your PIN', 'PIN của bạn')}</label>
          <input
            id="pin-input"
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
            placeholder="••••"
          />
        </div>
      )}

      <div className="settings-divider" />

      <h4 className="settings-panel__subtitle">
        {t('Хранилище документов', 'Document storage', 'Lưu trữ tài liệu')}
      </h4>
      <p className="settings-panel__hint">
        {documentCacheSize > 0
          ? t(
              `В кэше ~${documentCacheSize} МБ сканов.`,
              `~${documentCacheSize} MB of scans cached.`,
              `~${documentCacheSize} MB bản quét trong bộ nhớ đệm.`,
            )
          : t('Кэш пуст.', 'Cache is empty.', 'Bộ nhớ đệm trống.')}
      </p>
      <button type="button" className="btn btn--danger" onClick={clearDocumentCache}>
        {t('Очистить кэш документов', 'Clear document cache', 'Xóa bộ nhớ đệm tài liệu')}
      </button>
    </div>
  );
}
