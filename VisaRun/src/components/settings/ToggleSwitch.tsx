interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function ToggleSwitch({
  id,
  checked,
  onChange,
  label,
  description,
}: ToggleSwitchProps) {
  return (
    <div className="toggle-row">
      <div className="toggle-row__text">
        <label htmlFor={id} className="toggle-row__label">
          {label}
        </label>
        {description && <p className="toggle-row__desc">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        className={`toggle-switch${checked ? ' toggle-switch--on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-switch__thumb" />
      </button>
    </div>
  );
}
