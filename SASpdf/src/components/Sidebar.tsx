import type { PdfAnnotation } from '../types';

interface SidebarProps {
  annotations: PdfAnnotation[];
  currentPage: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<PdfAnnotation>) => void;
  onDelete: (id: string) => void;
}

const TYPE_LABELS: Record<PdfAnnotation['type'], string> = {
  text: 'T',
  'edit-text': '✎',
  note: '📝',
  signature: '✍',
  image: '🖼',
  redact: '█',
};

export function Sidebar({
  annotations,
  currentPage,
  selectedId,
  onSelect,
  onUpdate,
  onDelete,
}: SidebarProps) {
  const pageAnnotations = annotations.filter((a) => a.pageIndex === currentPage);
  const selected = annotations.find((a) => a.id === selectedId);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">Элементы (стр. {currentPage + 1})</div>

      {pageAnnotations.length === 0 ? (
        <div className="sidebar-empty">Нет элементов на этой странице</div>
      ) : (
        <ul className="annotation-list">
          {pageAnnotations.map((ann) => (
            <li
              key={ann.id}
              className={`annotation-item ${selectedId === ann.id ? 'selected' : ''}`}
              onClick={() => onSelect(ann.id)}
            >
              <span className="annotation-type">{TYPE_LABELS[ann.type]}</span>
              <span className="annotation-preview">
                {ann.content || ann.type}
              </span>
              <button
                className="btn-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(ann.id);
                }}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className="sidebar-props">
          <h4>Свойства</h4>
          {(selected.type === 'text' ||
            selected.type === 'edit-text' ||
            selected.type === 'note') && (
            <div className="prop-group">
              <label>Текст</label>
              <textarea
                value={selected.content ?? ''}
                onChange={(e) => onUpdate(selected.id, { content: e.target.value })}
              />
            </div>
          )}
          {(selected.type === 'text' || selected.type === 'edit-text') && (
            <>
              <div className="prop-group">
                <label>Размер шрифта</label>
                <input
                  type="number"
                  min={8}
                  max={72}
                  value={selected.fontSize ?? 14}
                  onChange={(e) =>
                    onUpdate(selected.id, { fontSize: Number(e.target.value) })
                  }
                />
              </div>
              <div className="prop-group">
                <label>Цвет</label>
                <input
                  type="color"
                  value={selected.color ?? '#000000'}
                  onChange={(e) => onUpdate(selected.id, { color: e.target.value })}
                />
              </div>
            </>
          )}
          <button
            className="btn btn-danger btn-sm"
            style={{ width: '100%', marginTop: 8 }}
            onClick={() => onDelete(selected.id)}
          >
            Удалить
          </button>
        </div>
      )}
    </aside>
  );
}
