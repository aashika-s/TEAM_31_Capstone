// const COLOR = {
//   pass: "var(--color-progress-pass)",
//   warn: "var(--color-progress-warn)",
//   fail: "var(--color-progress-fail)",
// };

// export default function ProgressBar({ value, variant = "pass", className = "" }) {
//   return (
//     <div className={`bg-bg-secondary rounded h-1.5 w-full mt-1.5 ${className}`}>
//       <div
//         className="h-1.5 rounded"
//         style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: COLOR[variant] }}
//       />
//     </div>
//   );
// }















const COLOR = {
  pass: "var(--color-progress-pass)",
  warn: "var(--color-progress-warn)",
  fail: "var(--color-progress-fail)",
};

export default function ProgressBar({ value, variant = "pass", className = "" }) {
  return (
    <div className={`bg-bg-secondary rounded-full h-2 w-full mt-1.5 overflow-hidden ${className}`}>
      <div
        className="h-2 rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: COLOR[variant] }}
      />
    </div>
  );
}
