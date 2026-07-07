import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { AppIcon } from './AppIcon';
import type { EVisaFormData } from '../types';

const STEPS = 4;

const emptyForm: EVisaFormData = {
  fullName: '',
  passportNumber: '',
  icaoLine: '',
  nationality: '',
  photoUploaded: false,
  preArrivalCompleted: false,
};

export function EVisaWizard() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<EVisaFormData>(emptyForm);

  const update = (patch: Partial<EVisaFormData>) =>
    setForm((f) => ({ ...f, ...patch }));

  const stepLabels = [
    t('Паспорт', 'Passport'),
    t('Фото', 'Photo'),
    t('Pre-arrival', 'Pre-arrival'),
    t('Проверка', 'Review'),
  ];

  return (
    <div className="evisa-wizard">
      <div className="evisa-wizard__steps">
        {stepLabels.map((label, i) => (
          <div
            key={label}
            className={`evisa-step${step === i + 1 ? ' evisa-step--active' : ''}${step > i + 1 ? ' evisa-step--done' : ''}`}
          >
            <span className="evisa-step__num">{i + 1}</span>
            <span className="evisa-step__label">{label}</span>
          </div>
        ))}
      </div>

      <div className="evisa-wizard__body">
        {step === 1 && (
          <div className="wizard-panel">
            <h2>{t('Паспортные данные', 'Passport details')}</h2>
            <div className="form-group">
              <label>{t('ФИО (как в паспорте)', 'Full name (as in passport)')}</label>
              <input
                value={form.fullName}
                onChange={(e) => update({ fullName: e.target.value })}
                placeholder="IVANOV IVAN"
              />
            </div>
            <div className="form-group">
              <label>{t('Номер паспорта', 'Passport number')}</label>
              <input
                value={form.passportNumber}
                onChange={(e) => update({ passportNumber: e.target.value })}
                placeholder="12 3456789"
              />
            </div>
            <div className="form-group">
              <label>{t('ICAO-строка (MRZ)', 'ICAO line (MRZ)')}</label>
              <input
                value={form.icaoLine}
                onChange={(e) => update({ icaoLine: e.target.value })}
                placeholder="P<RUSIVANOV<<IVAN<<<<<<<<<<<<<<<<"
              />
              <p className="form-hint">
                {t(
                  'Скопируйте две строки снизу паспорта. Буквы латиницей, «<» вместо пробелов. Без очков на фото — иначе MRZ не совпадёт.',
                  'Copy the two lines at the bottom of your passport. Latin letters, «<» instead of spaces. No glasses in photo — MRZ must match.',
                )}
              </p>
            </div>
            <div className="form-group">
              <label>{t('Гражданство', 'Nationality')}</label>
              <input
                value={form.nationality}
                onChange={(e) => update({ nationality: e.target.value })}
                placeholder="Russian Federation"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="wizard-panel">
            <h2>{t('Фото 4×6 см', 'Photo 4×6 cm')}</h2>
            <ul className="requirements-list">
              <li>{t('Белый фон, без теней', 'White background, no shadows')}</li>
              <li>{t('Без очков и головных уборов', 'No glasses or headwear')}</li>
              <li>{t('Лицо занимает 70–80% кадра', 'Face covers 70–80% of frame')}</li>
              <li>{t('Формат JPEG, до 2 МБ, мин. 400×600 px', 'JPEG format, max 2 MB, min 400×600 px')}</li>
              <li>{t('Сделано не ранее 6 месяцев назад', 'Taken within last 6 months')}</li>
            </ul>
            <div className="photo-upload">
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => update({ photoUploaded: true })}
              >
                {form.photoUploaded ? (
                  <span className="icon-label">
                    <AppIcon name="check" size={16} />
                    {t('Фото загружено', 'Photo uploaded')}
                  </span>
                ) : (
                  t('Загрузить фото', 'Upload photo')
                )}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="wizard-panel">
            <h2>{t('Pre-arrival декларация', 'Pre-arrival declaration')}</h2>
            <div className="alert alert--info">
              {t(
                'С 2024 года обязательна для въезда через крупные аэропорты (SGN, HAN, DAD). Заполните на vntravel.gov.vn за 24 часа до вылета.',
                'Mandatory since 2024 for entry via major airports (SGN, HAN, DAD). Fill at vntravel.gov.vn within 24 hours before flight.',
              )}
            </div>
            <ol className="numbered-list">
              <li>{t('Откройте vntravel.gov.vn', 'Open vntravel.gov.vn')}</li>
              <li>{t('Заполните анкету на английском', 'Fill the form in English')}</li>
              <li>{t('Получите QR-код на email', 'Receive QR code by email')}</li>
              <li>{t('Покажите QR на паспортном контроле', 'Show QR at immigration')}</li>
            </ol>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.preArrivalCompleted}
                onChange={(e) => update({ preArrivalCompleted: e.target.checked })}
              />
              {t('Я заполнил(а) pre-arrival декларацию', 'I completed the pre-arrival declaration')}
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="wizard-panel">
            <h2>{t('Проверка данных', 'Review your data')}</h2>
            <dl className="review-list">
              <dt>{t('ФИО', 'Full name')}</dt>
              <dd>{form.fullName || '—'}</dd>
              <dt>{t('Паспорт', 'Passport')}</dt>
              <dd>{form.passportNumber || '—'}</dd>
              <dt>{t('ICAO', 'ICAO')}</dt>
              <dd className="review-list__icao">{form.icaoLine || '—'}</dd>
              <dt>{t('Гражданство', 'Nationality')}</dt>
              <dd>{form.nationality || '—'}</dd>
              <dt>{t('Фото', 'Photo')}</dt>
              <dd>{form.photoUploaded ? t('Загружено', 'Uploaded') : t('Не загружено', 'Not uploaded')}</dd>
              <dt>{t('Pre-arrival', 'Pre-arrival')}</dt>
              <dd>{form.preArrivalCompleted ? t('Готово', 'Done') : t('Не готово', 'Not done')}</dd>
            </dl>
            <div className="alert alert--info">
              {t(
                'Данные не отправляются — это тренировочный мастер. Скопируйте значения на evisa.gov.vn.',
                'Data is not submitted — this is a practice wizard. Copy values to evisa.gov.vn.',
              )}
            </div>
          </div>
        )}
      </div>

      <div className="evisa-wizard__nav">
        {step > 1 && (
          <button type="button" className="btn btn--secondary" onClick={() => setStep(step - 1)}>
            {t('Назад', 'Back')}
          </button>
        )}
        {step < STEPS ? (
          <button type="button" className="btn btn--primary" onClick={() => setStep(step + 1)}>
            {t('Далее', 'Next')}
          </button>
        ) : (
          <button type="button" className="btn btn--primary" onClick={() => setStep(1)}>
            {t('Начать заново', 'Start over')}
          </button>
        )}
      </div>
    </div>
  );
}
