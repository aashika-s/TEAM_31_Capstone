// export default function MetricRow({ metrics }) {
//   // metrics: [{ value, label, color? }]
//   return (
//     <div className="grid grid-cols-2 gap-2 mb-2.5">
//       {metrics.map((m, i) => (
//         <div key={i} className="bg-bg-secondary rounded-app-md p-3 text-center">
//           <div className="text-xl font-medium text-text-primary" style={m.color ? { color: m.color } : undefined}>
//             {m.value}
//           </div>
//           <div className="text-[11px] text-text-secondary mt-0.5">{m.label}</div>
//         </div>
//       ))}
//     </div>
//   );
// }









export default function MetricRow({ metrics }) {
  // metrics: [{ value, label, color? }]
  return (
    <div className="grid grid-cols-2 gap-2.5 mb-3">
      {metrics.map((m, i) => (
        <div key={i} className="bg-bg-secondary rounded-app-md p-3.5 text-center border border-border-tertiary/60">
          <div className="text-[22px] font-bold text-text-primary leading-tight tabular-nums" style={m.color ? { color: m.color } : undefined}>
            {m.value}
          </div>
          <div className="text-[11px] text-text-secondary mt-1 font-medium">{m.label}</div>
        </div>
      ))}
    </div>
  );
}
