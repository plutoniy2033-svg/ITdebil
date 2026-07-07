import { EVisaWizard } from '../components/EVisaWizard';
import { useLanguage } from '../context/LanguageContext';

export function EVisaPage() {
  const { t } = useLanguage();

  return (
    <div className="page evisa-page">
      <h2 className="page__title">{t('Помощник E-Visa', 'E-Visa assistant')}</h2>
      <p className="page__subtitle">
        {t(
          'Пошаговый мастер заполнения анкеты и деклараций',
          'Step-by-step wizard for application and declarations',
        )}
      </p>
      <EVisaWizard />
    </div>
  );
}
