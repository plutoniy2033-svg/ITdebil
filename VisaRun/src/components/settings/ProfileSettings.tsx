import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useVisaTracker } from '../../context/VisaTrackerContext';
import { useLanguage } from '../../context/LanguageContext';
import { CITIZENSHIP_LABELS } from '../../utils/visaRules';
import { EntryDateField } from '../EntryDateField';
import { AppIcon } from '../AppIcon';
import type { Citizenship, EntryType } from '../../types';

export function ProfileSettings() {
  const { client, logout } = useAuth();
  const {
    citizenship,
    entryType,
    entryDate,
    dayLimit,
    visaRunHistory,
    setCitizenship,
    setEntryType,
    setEntryDate,
    addVisaRunRecord,
    removeVisaRunRecord,
  } = useVisaTracker();
  const { t, lang } = useLanguage();

  const [historyCheckpoint, setHistoryCheckpoint] = useState('');
  const [historyDate, setHistoryDate] = useState('');
  const [historyType, setHistoryType] = useState<EntryType>('visa-free');

  const citizenshipLabel = (code: Citizenship) => {
    const labels = CITIZENSHIP_LABELS[code];
    return lang === 'vi' ? labels.vi : lang === 'en' ? labels.en : labels.ru;
  };

  const handleAddHistory = () => {
    if (!historyDate || !historyCheckpoint) return;
    addVisaRunRecord({
      entryDate: historyDate,
      checkpoint: historyCheckpoint,
      entryType: historyType,
    });
    setHistoryCheckpoint('');
    setHistoryDate('');
  };

  return (
    <div className="settings-panel">
      <p className="settings-panel__intro">
        {t(
          'Эти данные влияют на все автоматические расчёты в приложении.',
          'This data drives all automatic calculations in the app.',
          'Dữ liệu này ảnh hưởng đến mọi tính toán tự động trong ứng dụng.',
        )}
      </p>

      {client && (
        <div className="settings-info-badge settings-info-badge--account">
          <strong>{client.fullName}</strong>
          <span>{client.email}</span>
          <button type="button" className="btn btn--secondary btn--sm" onClick={logout}>
            {t('Выйти', 'Log out', 'Đăng xuất')}
          </button>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="citizenship">
          {t('Гражданство (паспорт)', 'Citizenship (passport)', 'Quốc tịch (hộ chiếu)')}
        </label>
        <select
          id="citizenship"
          value={citizenship}
          onChange={(e) => setCitizenship(e.target.value as Citizenship)}
        >
          {(Object.keys(CITIZENSHIP_LABELS) as Citizenship[]).map((code) => (
            <option key={code} value={code}>
              {citizenshipLabel(code)}
            </option>
          ))}
        </select>
        <p className="form-hint">
          {t(
            'От страны зависят правила въезда: 45 дней безвиза или необходимость E-visa.',
            'Entry rules depend on your country: 45-day visa-free or E-visa required.',
            'Quy tắc nhập cảnh phụ thuộc quốc tịch: 45 ngày miễn visa hoặc cần E-visa.',
          )}
        </p>
      </div>

      <div className="form-group">
        <span className="form-group__legend">
          {t('Тип текущего въезда', 'Current entry type', 'Loại nhập cảnh hiện tại')}
        </span>
        <div className="segmented-control">
          <button
            type="button"
            className={`segmented-control__btn${entryType === 'visa-free' ? ' segmented-control__btn--active' : ''}`}
            onClick={() => setEntryType('visa-free')}
          >
            {t('Безвизовый штамп', 'Visa-free stamp', 'Tem miễn visa')}
          </button>
          <button
            type="button"
            className={`segmented-control__btn${entryType === 'e-visa' ? ' segmented-control__btn--active' : ''}`}
            onClick={() => setEntryType('e-visa')}
          >
            {t('E-visa', 'E-visa', 'E-visa')}
          </button>
        </div>
      </div>

      <EntryDateField
        id="profile-entry-date"
        value={entryDate}
        onChange={setEntryDate}
      />

      <div className="settings-info-badge">
        {t('Текущий лимит', 'Current limit', 'Giới hạn hiện tại')}:{' '}
        <strong>
          {dayLimit} {t('дней', 'days', 'ngày')}
        </strong>
      </div>

      <div className="settings-divider" />

      <h4 className="settings-panel__subtitle">
        {t('История визаранов', 'Visa run history', 'Lịch sử visa run')}
      </h4>
      <p className="settings-panel__hint">
        {t(
          'Архив поездок: дата, КПП и тип визы. Пограничники иногда смотрят на частые въезды.',
          'Trip archive: date, checkpoint and visa type. Border officers may notice frequent entries.',
          'Lưu trữ chuyến đi: ngày, cửa khẩu và loại visa.',
        )}
      </p>

      {visaRunHistory.length > 0 && (
        <ul className="history-list">
          {visaRunHistory.map((record) => (
            <li key={record.id} className="history-list__item">
              <div>
                <strong>{record.entryDate}</strong> — {record.checkpoint}
                <span className="history-list__tag">
                  {record.entryType === 'visa-free'
                    ? t('Безвиз', 'Visa-free', 'Miễn visa')
                    : 'E-visa'}
                </span>
              </div>
              <button
                type="button"
                className="history-list__remove"
                onClick={() => removeVisaRunRecord(record.id)}
                aria-label={t('Удалить', 'Remove', 'Xóa')}
              >
                <AppIcon name="x" size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="history-date">{t('Дата', 'Date', 'Ngày')}</label>
          <input
            id="history-date"
            type="date"
            value={historyDate}
            onChange={(e) => setHistoryDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="history-type">{t('Тип', 'Type', 'Loại')}</label>
          <select
            id="history-type"
            value={historyType}
            onChange={(e) => setHistoryType(e.target.value as EntryType)}
          >
            <option value="visa-free">{t('Безвиз', 'Visa-free', 'Miễn visa')}</option>
            <option value="e-visa">E-visa</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="history-checkpoint">
          {t('КПП (погранпункт)', 'Checkpoint', 'Cửa khẩu')}
        </label>
        <input
          id="history-checkpoint"
          type="text"
          value={historyCheckpoint}
          onChange={(e) => setHistoryCheckpoint(e.target.value)}
          placeholder={t('Мокбай, Лаобао…', 'Moc Bai, Lao Bao…', 'Mộc Bài, Lào Bảo…')}
        />
      </div>
      <button type="button" className="btn btn--secondary" onClick={handleAddHistory}>
        {t('Добавить поездку', 'Add trip', 'Thêm chuyến')}
      </button>
    </div>
  );
}
