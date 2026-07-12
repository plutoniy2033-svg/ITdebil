import { useEffect, useState, type FormEvent } from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface LocalReport {
  id: string;
  message: string;
  time: string;
}

const SUPPORT_REPORTS_KEY = 'visarun-support-reports';

export function SupportSettings() {
  const { t } = useLanguage();
  const [reportText, setReportText] = useState('');
  const [reports, setReports] = useState<LocalReport[]>(() => {
    try {
      const raw = localStorage.getItem(SUPPORT_REPORTS_KEY);
      return raw ? (JSON.parse(raw) as LocalReport[]) : [];
    } catch {
      return [];
    }
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem(SUPPORT_REPORTS_KEY, JSON.stringify(reports));
  }, [reports]);

  const handleSubmitReport = (e: FormEvent) => {
    e.preventDefault();
    const normalized = reportText.trim();
    if (normalized.length < 10) {
      setError(
        t(
          'Добавьте больше деталей (минимум 10 символов).',
          'Please add more details (minimum 10 characters).',
          'Vui lòng thêm chi tiết (tối thiểu 10 ký tự).',
        ),
      );
      return;
    }
    setError('');
    setReports((prev) => [
      {
        id: crypto.randomUUID(),
        message: normalized,
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
      href: 'https://t.me/visarun_support',
    },
    {
      label: t('Посольство РФ во Вьетнаме', 'Russian Embassy in Vietnam', 'Đại sứ quán Nga tại Việt Nam'),
      href: 'https://vietnam.mid.ru',
    },
    {
      label: t('Юристы (оверстей)', 'Immigration lawyers', 'Luật sư nhập cư'),
      href: 'https://t.me/immigration_help_asia',
    },
  ];

  const faqItems = [
    {
      q: t('Когда лучше делать визаран?', 'When should I do visa run?', 'Khi nào nên đi visa run?'),
      a: t(
        'Лучше планировать выезд за 3–7 дней до дедлайна, чтобы был запас на очереди.',
        'Plan your exit 3–7 days before the deadline to keep a safety buffer for queues.',
        'Nên lên kế hoạch xuất cảnh trước 3–7 ngày để có khoảng đệm an toàn.',
      ),
    },
    {
      q: t('Что показать на границе?', 'What to show at checkpoint?', 'Cần xuất trình gì ở cửa khẩu?'),
      a: t(
        'Паспорт, подтверждение обратного маршрута и при необходимости pre-arrival QR.',
        'Passport, proof of onward route, and pre-arrival QR if required.',
        'Hộ chiếu, bằng chứng hành trình tiếp theo và mã QR pre-arrival nếu cần.',
      ),
    },
    {
      q: t('Что делать при задержке?', 'What if I am delayed?', 'Nếu bị chậm trễ thì sao?'),
      a: t(
        'Сразу сообщите в поддержку и в чат попутчиков, чтобы быстро скорректировать маршрут.',
        'Immediately notify support and companion chat to quickly adjust your route.',
        'Hãy báo hỗ trợ và chat bạn đồng hành ngay để điều chỉnh tuyến nhanh.',
      ),
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
        {error && <p className="form-hint">{error}</p>}
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

      <div className="settings-divider" />
      <h4 className="settings-panel__subtitle">{t('FAQ', 'FAQ', 'FAQ')}</h4>
      <div className="faq-list">
        {faqItems.map((item) => (
          <details key={item.q} className="faq-item">
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
