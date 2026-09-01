export default function Card({ children, onClick, className = "" }) {
  const clickable = typeof onClick === "function";
  return (
    <div
      onClick={onClick}
      className={`bg-bg-primary border border-border-tertiary rounded-app-lg p-3.5 mb-2.5 ${
        clickable ? "cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <div className={`text-[13px] font-medium text-text-primary mb-1 ${className}`}>
      {children}
    </div>
  );
}

export function CardSub({ children, className = "" }) {
  return (
    <div className={`text-xs text-text-secondary ${className}`}>{children}</div>
  );
}
