// const ICON_BG = {
//   purple: "bg-accent-bg text-accent",
//   green: "bg-pass-bg text-pass-text",
//   red: "bg-fail-bg text-fail-text",
//   amber: "bg-warn-bg text-warn-text",
//   blue: "bg-info-bg text-info-text",
//   teal: "bg-teal-bg text-teal-text",
// };

// export default function ListItem({ icon, iconColor = "purple", title, sub, right, onClick }) {
//   const clickable = typeof onClick === "function";
//   return (
//     <div
//       onClick={onClick}
//       className={`flex items-center justify-between py-2.5 border-b border-border-tertiary last:border-b-0 text-[13px] text-text-primary ${
//         clickable ? "cursor-pointer" : ""
//       }`}
//     >
//       <div className="flex items-center gap-2.5 min-w-0">
//         {icon && (
//           <div className={`w-8 h-8 rounded-app-md flex items-center justify-center flex-shrink-0 ${ICON_BG[iconColor]}`}>
//             {icon}
//           </div>
//         )}
//         <div className="min-w-0">
//           <div className="text-[13px] font-medium text-text-primary truncate">{title}</div>
//           {sub && <div className="text-xs text-text-secondary truncate">{sub}</div>}
//         </div>
//       </div>
//       {right}
//     </div>
//   );
// }







const ICON_BG = {
  purple: "bg-accent-bg text-accent",
  green: "bg-pass-bg text-pass-text",
  red: "bg-fail-bg text-fail-text",
  amber: "bg-warn-bg text-warn-text",
  blue: "bg-info-bg text-info-text",
  teal: "bg-teal-bg text-teal-text",
};

export default function ListItem({ icon, iconColor = "purple", title, sub, right, onClick, className = "" }) {
  const clickable = typeof onClick === "function";
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between py-2.5 px-1 border-b border-border-tertiary last:border-b-0 text-[13px] text-text-primary ${
        clickable ? "cursor-pointer" : ""
      } ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && (
          <div className={`w-8 h-8 rounded-app-md flex items-center justify-center flex-shrink-0 ${ICON_BG[iconColor]}`}>
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-[13px] font-medium text-text-primary truncate">{title}</div>
          {sub && <div className="text-xs text-text-secondary truncate">{sub}</div>}
        </div>
      </div>
      {right}
    </div>
  );
}