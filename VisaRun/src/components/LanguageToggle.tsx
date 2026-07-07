import { useLanguage } from '../context/LanguageContext';

export function LanguageToggle() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div className="settings-block">
      <h3 className="settings-block__title">{t('Язык', 'Language')}</h3>
      <p className="settings-block__desc">
        {t(
          'Выберите язык интерфейса приложения',
          'Choose the app interface language',
        )}
      </p>
      <div className="lang-toggle lang-toggle--large">
        <button
          type="button"
          className={`lang-toggle__btn${lang === 'ru' ? ' lang-toggle__btn--active' : ''}`}
          onClick={() => setLang('ru')}
        >
          Русский
        </button>
        <button
          type="button"
          className={`lang-toggle__btn${lang === 'en' ? ' lang-toggle__btn--active' : ''}`}
          onClick={() => setLang('en')}
        >
          English
        </button>
        <button
          type="button"
          className={`lang-toggle__btn${lang === 'vi' ? ' lang-toggle__btn--active' : ''}`}
          onClick={() => setLang('vi')}
        >
          Tiếng Việt
        </button>
      </div>
    </div>
  );
}
