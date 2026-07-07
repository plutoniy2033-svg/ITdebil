import { useEffect, useState } from 'react';

interface CompletionScreenProps {
  onDownload: () => void;
  onNewDocument: () => void;
}

export function CompletionScreen({ onDownload, onNewDocument }: CompletionScreenProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1500;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedProgress(Math.round(eased * 100));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  return (
    <div className="completion-screen">
      <div className="completion-card">
        <div className="completion-icon">✓</div>
        <h2>Документ готов!</h2>
        <p className="completion-subtitle">Все изменения сохранены</p>

        <div className="progress-ring-wrap">
          <svg className="progress-ring" viewBox="0 0 120 120">
            <circle className="progress-ring-bg" cx="60" cy="60" r="52" />
            <circle
              className="progress-ring-fill"
              cx="60"
              cy="60"
              r="52"
              strokeDasharray={`${animatedProgress * 3.27} 327`}
            />
          </svg>
          <span className="progress-percent">{animatedProgress}%</span>
        </div>

        <div className="completion-actions">
          <button className="btn btn-primary btn-lg" onClick={onDownload}>
            Скачать PDF
          </button>
          <button className="btn btn-lg" onClick={onNewDocument}>
            Новый документ
          </button>
        </div>
      </div>
    </div>
  );
}
