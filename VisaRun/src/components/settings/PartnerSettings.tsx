import { useSettings } from '../../context/SettingsContext';
import { useLanguage } from '../../context/LanguageContext';
import { ToggleSwitch } from './ToggleSwitch';

const PARTNER_ROUTES = [
  'Ho Chi Minh — Moc Bai',
  'Ho Chi Minh — Cambodian border',
  'Da Nang — Lao Bao',
  'Hanoi — Mong Cai',
];

export function PartnerSettings() {
  const { partnerMode, partnerRoute, partnerTariff, setPartnerMode, setPartnerRoute, setPartnerTariff } =
    useSettings();
  const { t } = useLanguage();

  return (
    <div className="settings-panel">
      <p className="settings-panel__intro">
        {t(
          'Режим водителя или агента для маркетплейса визаран-туров.',
          'Driver or agent mode for the visa run marketplace.',
          'Chế độ tài xế hoặc đại lý cho sàn tour visa run.',
        )}
      </p>

      <ToggleSwitch
        id="partner-mode"
        checked={partnerMode}
        onChange={setPartnerMode}
        label={t('Я водитель / Я агент', 'I am a driver / agent', 'Tôi là tài xế / đại lý')}
        description={t(
          'Открывает настройки тарифов, маршрутов и расписания.',
          'Opens tariff, route and schedule settings.',
          'Mở cài đặt giá, tuyến và lịch trình.',
        )}
      />

      {partnerMode && (
        <>
          <div className="form-group">
            <label htmlFor="partner-route">
              {t('Обслуживаемый маршрут', 'Service route', 'Tuyến phục vụ')}
            </label>
            <select
              id="partner-route"
              value={partnerRoute}
              onChange={(e) => setPartnerRoute(e.target.value)}
            >
              {PARTNER_ROUTES.map((route) => (
                <option key={route} value={route}>
                  {route}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="partner-tariff">
              {t('Тариф (USD)', 'Tariff (USD)', 'Giá (USD)')}
            </label>
            <input
              id="partner-tariff"
              type="text"
              value={partnerTariff}
              onChange={(e) => setPartnerTariff(e.target.value)}
              placeholder={t('напр. $45', 'e.g. $45', 'vd. $45')}
            />
          </div>

          <div className="form-group">
            <label>{t('Фото минивэна', 'Minivan photo', 'Ảnh xe minivan')}</label>
            <div className="upload-placeholder">
              {t(
                'Загрузите фото транспорта для карточки в маркетплейсе.',
                'Upload a vehicle photo for your marketplace listing.',
                'Tải ảnh xe cho hồ sơ trên sàn.',
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="partner-schedule">
              {t('Расписание поездок', 'Trip schedule', 'Lịch chuyến')}
            </label>
            <textarea
              id="partner-schedule"
              rows={3}
              placeholder={t(
                'Пн, Ср, Пт — выезд в 6:00…',
                'Mon, Wed, Fri — departure at 6:00 AM…',
                'T2, T4, T6 — khởi hành 6:00…',
              )}
            />
          </div>
        </>
      )}
    </div>
  );
}
