import { useLanguage } from '../context/LanguageContext';

export function SplashScreen() {
  const { t } = useLanguage();

  return (
    <div className="splash-screen">
      <div className="splash-screen__content">
        <img src="/logo.svg" alt="VisaRun" className="splash-screen__logo" />
        <p className="splash-screen__tagline">
          {t(
            'Помощник для визарана во Вьетнаме',
            'Visa-run helper for Vietnam',
            'Trợ lý visa run tại Việt Nam',
          )}
        </p>
        <div className="splash-screen__loader" aria-hidden />
      </div>
    </div>
  );
}
