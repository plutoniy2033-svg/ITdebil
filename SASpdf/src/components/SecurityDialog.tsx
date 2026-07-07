import { useState } from 'react';
import type { SecuritySettings } from '../types';

interface SecurityDialogProps {
  onApply: (settings: SecuritySettings) => void;
  onClose: () => void;
}

export function SecurityDialog({ onApply, onClose }: SecurityDialogProps) {
  const [settings, setSettings] = useState<SecuritySettings>({
    userPassword: '',
    ownerPassword: '',
    allowPrinting: true,
    allowCopying: true,
    allowEditing: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApply(settings);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Защита документа</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Пароль для открытия</label>
            <input
              type="password"
              value={settings.userPassword}
              onChange={(e) => setSettings({ ...settings, userPassword: e.target.value })}
              placeholder="Оставьте пустым, если не нужен"
            />
          </div>
          <div className="form-group">
            <label>Пароль владельца</label>
            <input
              type="password"
              value={settings.ownerPassword}
              onChange={(e) => setSettings({ ...settings, ownerPassword: e.target.value })}
              placeholder="Для изменения прав доступа"
            />
          </div>
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={settings.allowPrinting}
                onChange={(e) => setSettings({ ...settings, allowPrinting: e.target.checked })}
              />
              Разрешить печать
            </label>
            <label>
              <input
                type="checkbox"
                checked={settings.allowCopying}
                onChange={(e) => setSettings({ ...settings, allowCopying: e.target.checked })}
              />
              Разрешить копирование
            </label>
            <label>
              <input
                type="checkbox"
                checked={settings.allowEditing}
                onChange={(e) => setSettings({ ...settings, allowEditing: e.target.checked })}
              />
              Разрешить редактирование
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn btn-primary">Применить</button>
          </div>
        </form>
      </div>
    </div>
  );
}