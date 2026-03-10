import './Toggle.scss';

interface ToggleProps {
  isActive: boolean;
  onToggle: () => void;
  activeText: string;
  inactiveText: string;
  disabled?: boolean;
}

const Toggle = ({ 
  isActive, 
  onToggle, 
  activeText, 
  inactiveText,
  disabled = false 
}: ToggleProps) => {
  return (
    <button 
      className={`toggle inter12-600 ${isActive ? 'toggle__active' : 'toggle__inactive'}`}
      onClick={onToggle}
      disabled={disabled}
      type="button"
    >
      <span className="toggle_text">
        {isActive ? activeText : inactiveText}
      </span>
      <div className="toggle_switch">
        <div className="toggle_circle" />
      </div>
    </button>
  );
};

export default Toggle;