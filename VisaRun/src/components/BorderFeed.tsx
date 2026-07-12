import { useEffect, useMemo, useState } from 'react';
import type { BorderReport } from '../types';
import { checkpoints } from '../data/checkpoints';
import { useLanguage } from '../context/LanguageContext';
import { createBorderReport, fetchBorderReports } from '../api/community';

interface BorderFeedProps {
  reports: BorderReport[];
  initialCheckpointId?: string;
}

const STORAGE_KEY = 'visarun-border-feed';

function loadLocalReports(fallback: BorderReport[]) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BorderReport[]) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocalReports(reports: BorderReport[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

function formatReportTime(value: string, locale: string) {
  if (!value.includes('T')) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(locale === 'vi' ? 'vi-VN' : locale === 'en' ? 'en-US' : 'ru-RU', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function BorderFeed({ reports, initialCheckpointId }: BorderFeedProps) {
  const { t, lang } = useLanguage();
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(
    initialCheckpointId ?? 'moc-bai',
  );
  const [message, setMessage] = useState('');
  const [serverReports, setServerReports] = useState<BorderReport[]>([]);
  const [localReports, setLocalReports] = useState<BorderReport[]>(() => loadLocalReports(reports));
  const [isLocalMode, setIsLocalMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchBorderReports(selectedCheckpoint);
        if (!active) return;
        setServerReports(result.reports);
        setIsLocalMode(false);
      } catch {
        if (!active) return;
        setIsLocalMode(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [selectedCheckpoint]);

  useEffect(() => {
    if (isLocalMode) {
      saveLocalReports(localReports);
    }
  }, [localReports, isLocalMode]);

  const displayedReports = useMemo(() => {
    if (isLocalMode) {
      return localReports.filter((report) => report.checkpointId === selectedCheckpoint);
    }
    return serverReports;
  }, [isLocalMode, localReports, selectedCheckpoint, serverReports]);

  const checkpoint = checkpoints.find((c) => c.id === selectedCheckpoint);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = message.trim();
    if (normalized.length < 8) {
      setError(
        t(
          'Добавьте чуть больше деталей (минимум 8 символов).',
          'Add a bit more detail (minimum 8 characters).',
          'Vui lòng thêm chi tiết (tối thiểu 8 ký tự).',
        ),
      );
      return;
    }
    setError('');

    if (isLocalMode) {
      const newReport: BorderReport = {
        id: `br-${Date.now()}`,
        checkpointId: selectedCheckpoint,
        author: t('Вы', 'You', 'Bạn'),
        time: t('только что', 'just now', 'vừa xong'),
        message: normalized,
      };
      setLocalReports([newReport, ...localReports]);
    } else {
      try {
        const result = await createBorderReport({
          checkpointId: selectedCheckpoint,
          message: normalized,
        });
        setServerReports(result.reports);
      } catch {
        setIsLocalMode(true);
        const newReport: BorderReport = {
          id: `br-${Date.now()}`,
          checkpointId: selectedCheckpoint,
          author: t('Вы', 'You', 'Bạn'),
          time: t('только что', 'just now', 'vừa xong'),
          message: normalized,
        };
        setLocalReports([newReport, ...localReports]);
      }
    }

    setMessage('');
  };

  return (
    <div className="border-feed">
      {isLocalMode && (
        <p className="community-local-hint">
          {t(
            'Отчёты сохраняются локально. На сервере они видны всем пользователям.',
            'Reports are saved locally. On the server they are visible to everyone.',
            'Báo cáo lưu cục bộ. Trên máy chủ mọi người đều thấy.',
          )}
        </p>
      )}

      <div className="form-group">
        <label>{t('КПП', 'Checkpoint', 'Cửa khẩu')}</label>
        <select
          value={selectedCheckpoint}
          onChange={(e) => setSelectedCheckpoint(e.target.value)}
        >
          {checkpoints.map((cp) => (
            <option key={cp.id} value={cp.id}>
              {cp.name} ({cp.nameLocal})
            </option>
          ))}
        </select>
      </div>

      <h3 className="border-feed__title">
        {t('Прямо сейчас на границе', 'Live at the border', 'Trực tiếp tại biên giới')}: {checkpoint?.name}
      </h3>

      <form className="border-feed__compose card" onSubmit={handlePost}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t(
            'В Мокбае сегодня очереди на 3 часа...',
            'At Moc Bai queues are 3 hours today...',
            'Ở Moc Bai hôm nay xếp hàng 3 giờ...',
          )}
          rows={2}
        />
        <button type="submit" className="btn btn--primary btn--sm" disabled={loading}>
          {t('Отправить', 'Send', 'Gửi')}
        </button>
        {error && <p className="form-hint">{error}</p>}
      </form>

      <div className="border-feed__list">
        {loading ? (
          <p className="text-muted">{t('Загрузка...', 'Loading...', 'Đang tải...')}</p>
        ) : displayedReports.length === 0 ? (
          <p className="text-muted">{t('Пока нет сообщений', 'No messages yet', 'Chưa có tin nhắn')}</p>
        ) : (
          displayedReports.map((report) => (
            <div key={report.id} className="border-report card">
              <div className="border-report__header">
                <strong>{report.author}</strong>
                <span className="text-muted">{formatReportTime(report.time, lang)}</span>
              </div>
              <p>{report.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
