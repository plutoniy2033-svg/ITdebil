import type { ToolMode } from '../types';

interface ToolbarProps {
  tool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
  onOpenFile: () => void;
  onSave: () => void;
  onSecurity: () => void;
  hasDocument: boolean;
  isLoading: boolean;
  scale: number;
  onScaleChange: (scale: number) => void;
  currentPage: number;
  numPages: number;
  onPageChange: (page: number) => void;
}

const TOOLS: { id: ToolMode; label: string; icon: string; title: string }[] = [
  { id: 'select', label: 'Выбор', icon: '↖', title: 'Выделение и перемещение объектов' },
  { id: 'text', label: 'Текст', icon: 'T', title: 'Добавить текст' },
  { id: 'edit-text', label: 'Правка', icon: '✎', title: 'Редактировать текст прямо в документе' },
  { id: 'note', label: 'Заметка', icon: '📝', title: 'Добавить заметку' },
  { id: 'signature', label: 'Подпись', icon: '✍', title: 'Добавить подпись' },
  { id: 'image', label: 'Изображение', icon: '🖼', title: 'Добавить изображение' },
  { id: 'redact', label: 'Замазка', icon: '█', title: 'Скрыть конфиденциальную информацию' },
];

export function Toolbar({
  tool,
  onToolChange,
  onOpenFile,
  onSave,
  onSecurity,
  hasDocument,
  isLoading,
  scale,
  onScaleChange,
  currentPage,
  numPages,
  onPageChange,
}: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="toolbar-brand">
        <span className="brand-icon">📄</span>
        <span className="brand-name">SASpdf</span>
      </div>

      <div className="toolbar-group">
        <button className="btn btn-primary" onClick={onOpenFile} disabled={isLoading}>
          Открыть
        </button>
        <button className="btn" onClick={onSave} disabled={!hasDocument || isLoading}>
          Сохранить
        </button>
        <button className="btn" onClick={onSecurity} disabled={!hasDocument || isLoading}>
          🔒 Защита
        </button>
      </div>

      {hasDocument && (
        <>
          <div className="toolbar-divider" />

          <div className="toolbar-tools">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                className={`tool-btn ${tool === t.id ? 'active' : ''}`}
                onClick={() => onToolChange(t.id)}
                title={t.title}
              >
                <span className="tool-icon">{t.icon}</span>
                <span className="tool-label">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="toolbar-divider" />

          <div className="toolbar-nav">
            <button
              className="btn btn-sm"
              disabled={currentPage <= 0}
              onClick={() => onPageChange(currentPage - 1)}
            >
              ←
            </button>
            <span className="page-info">
              {currentPage + 1} / {numPages}
            </span>
            <button
              className="btn btn-sm"
              disabled={currentPage >= numPages - 1}
              onClick={() => onPageChange(currentPage + 1)}
            >
              →
            </button>
            <button className="btn btn-sm" onClick={() => onScaleChange(Math.max(0.5, scale - 0.2))}>
              −
            </button>
            <span className="page-info">{Math.round(scale * 100)}%</span>
            <button className="btn btn-sm" onClick={() => onScaleChange(Math.min(3, scale + 0.2))}>
              +
            </button>
          </div>
        </>
      )}
    </header>
  );
}
