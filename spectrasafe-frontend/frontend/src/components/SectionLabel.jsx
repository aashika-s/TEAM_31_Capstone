// export default function SectionLabel({ children }) {
//   return (
//     <div className="text-[11px] font-medium text-text-secondary uppercase tracking-wide mb-2 mt-3.5">
//       {children}
//     </div>
//   );
// }






export default function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-semibold text-text-tertiary uppercase tracking-wider mb-2.5 mt-5">
      {children}
    </div>
  );
}
