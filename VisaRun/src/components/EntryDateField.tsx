import { useLanguage } from '../context/LanguageContext';

interface EntryDateFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  showHint?: boolean;
}

/** Shared entry-date input used on tracker modal and profile settings */
export function EntryDateField({ id, value, onChange, showHint = true }: EntryDateFieldProps) {
  const { t } = useLanguage();

  return (
    <div className="form-group">
      <label htmlFor={id}>
        {t('Дата въезда в страну', 'Entry date', 'Ngày nhập cảnh')}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {showHint && (
        <p className="form-hint">
          {t(
            'От этой даты калькулятор начинает отсчёт дней пребывания.',
            'The calculator counts stay days from this date.',
            'Máy tính đếm ngày lưu trú từ ngày này.',
          )}
        </p>
      )}
    </div>
  );
}
