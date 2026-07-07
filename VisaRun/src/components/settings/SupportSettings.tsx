import { useState, type FormEvent } from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface LocalReport {
  id: string;
  message: string;
  time: string;
}

export function SupportSettings() {
  const { t } = useLanguage();
  const [reportText, setReportText] = useState('');
  const [reports, setReports] = useState<LocalReport[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitReport = (e: FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;
    setReports((prev) => [
      {
        id: crypto.randomUUID(),
        message: reportText.trim(),
        time: new Date().toLocaleString(),
      },
      ...prev,
    ]);
    setReportText('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const sosLinks = [
    {
      label: t('Чат поддержки VisaRun', 'VisaRun support chat', 'Chat hỗ trợ VisaRun'),
      href: '#',
    },
    {
      label: t('Посольство РФ во Вьетнаме', 'Russian Embassy in Vietnam', 'Đại sứ quán Nga tại Việt Nam'),
      href: 'https://vietnam.mid.ru',
    },
    {
      label: t('Юристы (оверстей)', 'Immigration lawyers', 'Luật sư nhập cư'),
      href: '#',
    },
  ];

  return (
    <div className="settings-panel">
      <p className="settings-panel__intro">
        {t(
          'Сообщайте об изменениях на границе и держите SOS-контакты под рукой.',
          'Report border changes and keep SOS contacts handy.',
          'Báo cáo thay đổi tại biên giới và giữ liên hệ khẩn cấp.',
        )}
      </p>

      <h4 className="settings-panel__subtitle">
        {t('Сообщить об изменении на границе', 'Report a border change', 'Báo cáo thay đổi biên giới')}
      </h4>
      <form onSubmit={handleSubmitReport}>
        <div className="form-group">
          <textarea
            rows={4}
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder={t(
              'Напр.: «На КПП Лаобао подняли пошлину за штамп»',
              'E.g. "Lao Bao checkpoint raised stamp fee"',
              'VD: "Cửa khẩu Lào Bảo tăng phí tem"',
            )}
          />
        </div>
        <button type="submit" className="btn btn--primary">
          {t('Отправить', 'Submit', 'Gửi')}
        </button>
        {submitted && (
          <p className="form-hint form-hint--success">
            {t('Спасибо! Отчёт сохранён.', 'Thanks! Report saved.', 'Cảm ơn! Đã lưu báo cáo.')}
          </p>
        )}
      </form>

      {reports.length > 0 && (
        <ul className="history-list history-list--compact">
          {reports.map((r) => (
            <li key={r.id} className="history-list__item">
              <div>
                <span className="history-list__time">{r.time}</span>
                <p>{r.message}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="settings-divider" />

      <h4 className="settings-panel__subtitle">
        {t('Контакты SOS', 'SOS contacts', 'Liên hệ SOS')}
      </h4>
      <p className="settings-panel__hint">
        {t(
          'На случай экстренного оверстея или депортации.',
          'For emergency overstay or deportation situations.',
          'Cho trường hợp quá hạn hoặc trục xuất khẩn cấp.',
        )}
      </p>
      <div className="sos-links">
        {sosLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="sos-links__item"
            target={link.href.startsWith('http') ? '_blank' : undefined}
            rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
          >
            {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}
