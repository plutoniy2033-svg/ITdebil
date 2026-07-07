import { useState } from 'react';
import type { BorderReport } from '../types';
import { checkpoints } from '../data/checkpoints';
import { useLanguage } from '../context/LanguageContext';

interface BorderFeedProps {
  reports: BorderReport[];
  initialCheckpointId?: string;
}

export function BorderFeed({ reports, initialCheckpointId }: BorderFeedProps) {
  const { t } = useLanguage();
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(
    initialCheckpointId ?? 'moc-bai',
  );
  const [message, setMessage] = useState('');
  const [localReports, setLocalReports] = useState(reports);

  const filtered = localReports.filter((r) => r.checkpointId === selectedCheckpoint);
  const checkpoint = checkpoints.find((c) => c.id === selectedCheckpoint);

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newReport: BorderReport = {
      id: `br-${Date.now()}`,
      checkpointId: selectedCheckpoint,
      author: t('Вы', 'You'),
      time: t('только что', 'just now'),
      message: message.trim(),
    };
    setLocalReports([newReport, ...localReports]);
    setMessage('');
  };

  return (
    <div className="border-feed">
      <div className="form-group">
        <label>{t('КПП', 'Checkpoint')}</label>
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
        {t('Прямо сейчас на границе', 'Live at the border')}: {checkpoint?.name}
      </h3>

      <form className="border-feed__compose card" onSubmit={handlePost}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t(
            'В Мокбае сегодня очереди на 3 часа...',
            'At Moc Bai queues are 3 hours today...',
          )}
          rows={2}
        />
        <button type="submit" className="btn btn--primary btn--sm">
          {t('Отправить', 'Send')}
        </button>
      </form>

      <div className="border-feed__list">
        {filtered.length === 0 ? (
          <p className="text-muted">{t('Пока нет сообщений', 'No messages yet')}</p>
        ) : (
          filtered.map((report) => (
            <div key={report.id} className="border-report card">
              <div className="border-report__header">
                <strong>{report.author}</strong>
                <span className="text-muted">{report.time}</span>
              </div>
              <p>{report.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
