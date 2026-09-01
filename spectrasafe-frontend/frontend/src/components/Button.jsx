export function ButtonPrimary({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`w-full py-3 bg-accent text-accent-bg border-none rounded-app-md text-sm font-medium cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export function ButtonOutline({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`w-full py-[11px] bg-transparent text-text-primary border border-border-secondary rounded-app-md text-sm cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}
