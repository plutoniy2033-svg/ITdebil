import { useState } from 'react';
import { useVisaTracker } from '../context/VisaTrackerContext';
import { useLanguage } from '../context/LanguageContext';
import { EntryDateField } from './EntryDateField';

interface EntryDateModalProps {
  onClose: () => void;
}

/** Modal for setting entry date from the main tracker screen */
export function EntryDateModal({ onClose }: EntryDateModalProps) {
  const { entryDate, setEntryDate } = useVisaTracker();
  const { t } = useLanguage();
  const [draftDate, setDraftDate] = useState(entryDate);

  const handleSave = () => {
    setEntryDate(draftDate);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{t('Дата въезда', 'Entry date', 'Ngày nhập cảnh')}</h3>
        <p className="text-muted">
          {t(
            'Укажите дату штампа в паспорте. Данные сохранятся и появятся в настройках.',
            'Enter your passport stamp date. Data is saved and synced to Settings.',
            'Nhập ngày tem hộ chiếu. Dữ liệu được lưu và đồng bộ với Cài đặt.',
          )}
        </p>

        <EntryDateField
          id="tracker-entry-date"
          value={draftDate}
          onChange={setDraftDate}
        />

        <div className="modal__actions">
          <button type="button" className="btn btn--secondary" onClick={onClose}>
            {t('Отмена', 'Cancel', 'Hủy')}
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleSave}
            disabled={!draftDate}
          >
            {t('Сохранить', 'Save', 'Lưu')}
          </button>
        </div>
      </div>
    </div>
  );
}
