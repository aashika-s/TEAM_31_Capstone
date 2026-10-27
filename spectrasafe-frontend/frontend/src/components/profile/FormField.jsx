export const fieldInputClass =
  "w-full px-3.5 py-2.5 border border-border-tertiary rounded-app-md text-sm bg-bg-primary text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors disabled:opacity-60";

export default function FormField({ label, helper, optional, children }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-text-secondary">
          {label}
          {optional && <span className="font-normal text-text-tertiary"> · Optional</span>}
        </label>
        {helper && <span className="text-[11px] text-text-tertiary">{helper}</span>}
      </div>
      {children}
    </div>
  );
}

export function ToggleRow({ title, sub, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border-tertiary last:border-b-0">
      <div className="min-w-0 pr-3">
        <div className="text-[13px] font-medium text-text-primary">{title}</div>
        {sub && <div className="text-xs text-text-secondary mt-0.5">{sub}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative flex-shrink-0 w-10 h-6 rounded-full transition-colors ${
          checked ? "bg-accent" : "bg-border-secondary"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
