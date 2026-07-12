import { useSettings } from '../context/SettingsContext';
import { useVisaTracker } from '../context/VisaTrackerContext';
import { useLanguage } from '../context/LanguageContext';

export function SyncStatusBanner() {
  const tracker = useVisaTracker();
  const settings = useSettings();
  const { t } = useLanguage();

  const loading = tracker.loading || settings.loading;
  const isLocalMode = tracker.isLocalMode || settings.isLocalMode;
  const error = tracker.error || settings.error;

  if (loading) {
    return (
      <div className="sync-banner sync-banner--loading" role="status">
        {t('Загружаем ваши данные...', 'Loading your data...', 'Đang tải dữ liệu của bạn...')}
      </div>
    );
  }

  if (isLocalMode) {
    return (
      <div className="sync-banner sync-banner--local" role="status">
        {t(
          'Данные сохраняются локально на этом устройстве.',
          'Data is saved locally on this device.',
          'Dữ liệu được lưu cục bộ trên thiết bị này.',
        )}
      </div>
    );
  }

  if (!error) return null;

  return (
    <div className="sync-banner sync-banner--error" role="alert">
      <span>
        {t(
          'Не удалось синхронизировать данные с сервером.',
          'Failed to sync data with the server.',
          'Không thể đồng bộ dữ liệu với máy chủ.',
        )}{' '}
        {error}
      </span>
      <button
        type="button"
        className="btn btn--secondary btn--small"
        onClick={() => {
          void Promise.all([tracker.reload(), settings.reload()]);
        }}
      >
        {t('Повторить', 'Retry', 'Thử lại')}
      </button>
    </div>
  );
}
