import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { NotificationSettings } from '../components/settings/NotificationSettings';
import { LocalizationSettings } from '../components/settings/LocalizationSettings';
import { SecuritySettings } from '../components/settings/SecuritySettings';
import { PartnerSettings } from '../components/settings/PartnerSettings';
import { SupportSettings } from '../components/settings/SupportSettings';

type SettingsTab =
  | 'profile'
  | 'notifications'
  | 'localization'
  | 'security'
  | 'partner'
  | 'support';

const TABS: { id: SettingsTab; labelRu: string; labelEn: string; labelVi: string }[] = [
  { id: 'profile', labelRu: 'Профиль', labelEn: 'Profile', labelVi: 'Hồ sơ' },
  { id: 'notifications', labelRu: 'Уведомления', labelEn: 'Alerts', labelVi: 'Thông báo' },
  { id: 'localization', labelRu: 'Язык', labelEn: 'Locale', labelVi: 'Ngôn ngữ' },
  { id: 'security', labelRu: 'Безопасность', labelEn: 'Security', labelVi: 'Bảo mật' },
  { id: 'partner', labelRu: 'Партнёр', labelEn: 'Partner', labelVi: 'Đối tác' },
  { id: 'support', labelRu: 'Поддержка', labelEn: 'Support', labelVi: 'Hỗ trợ' },
];

export function SettingsPage() {
  const { t, lang } = useLanguage();
  const [tab, setTab] = useState<SettingsTab>('profile');

  const tabLabel = (item: (typeof TABS)[number]) => {
    if (lang === 'vi') return item.labelVi;
    if (lang === 'en') return item.labelEn;
    return item.labelRu;
  };

  return (
    <div className="page settings-page">
      <h2 className="page__title">{t('Настройки', 'Settings', 'Cài đặt')}</h2>
      <p className="page__subtitle">
        {t(
          'Профиль, уведомления, безопасность и поддержка',
          'Profile, alerts, security and support',
          'Hồ sơ, thông báo, bảo mật và hỗ trợ',
        )}
      </p>

      <div className="settings-tabs" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`settings-tabs__btn${tab === item.id ? ' settings-tabs__btn--active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {tabLabel(item)}
          </button>
        ))}
      </div>

      <div className="settings-page__content card" role="tabpanel">
        {tab === 'profile' && <ProfileSettings />}
        {tab === 'notifications' && <NotificationSettings />}
        {tab === 'localization' && <LocalizationSettings />}
        {tab === 'security' && <SecuritySettings />}
        {tab === 'partner' && <PartnerSettings />}
        {tab === 'support' && <SupportSettings />}
      </div>
    </div>
  );
}
