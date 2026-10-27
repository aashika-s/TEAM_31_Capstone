/* THIS IS FOR PHONE SCREEN 

import { IconArrowLeft } from "@tabler/icons-react";

export default function TopBar({ title, onBack, right }) {
  return (
    <div className="px-4 py-2.5 flex items-center gap-2.5 border-b border-border-tertiary bg-bg-primary">
      {onBack && (
        <button onClick={onBack} className="bg-transparent border-none cursor-pointer text-text-secondary p-0">
          <IconArrowLeft size={18} />
        </button>
      )}
      <div className="text-[15px] font-medium text-text-primary flex-1">{title}</div>
      {right}
    </div>
  );
}

*/







// import { IconArrowLeft } from "@tabler/icons-react";

// export default function TopBar({ title, onBack, right }) {
//   return (
//     <div className="px-6 md:px-8 py-5 flex items-center gap-3 border-b border-border-tertiary bg-bg-primary sticky top-0 z-10">
//       {onBack && (
//         <button
//           onClick={onBack}
//           className="bg-transparent border-none cursor-pointer text-text-secondary hover:text-text-primary p-1 flex-shrink-0"
//         >
//           <IconArrowLeft size={20} />
//         </button>
//       )}
//       <div className="text-xl font-semibold text-text-primary flex-1">{title}</div>
//       {right}
//     </div>
//   );
// }








import { IconArrowLeft } from "@tabler/icons-react";

export default function TopBar({ title, onBack, right }) {
  return (
    <div
      className="
        sticky
        top-0
        z-30
        w-full
        px-5
        md:px-8
        py-3
        bg-bg-primary/95
        backdrop-blur-md
        border-b
        border-border-secondary
        shadow-[0_1px_8px_rgba(40,38,80,0.04)]
      "
    >
      <div className="min-h-[46px] flex items-center gap-3">

        {/* BACK BUTTON */}
        {onBack && (
          <>
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="
                w-9
                h-9
                flex
                items-center
                justify-center
                flex-shrink-0
                rounded-[9px]
                bg-bg-primary
                border
                border-border-secondary
                text-text-secondary
                cursor-pointer
                hover:bg-bg-secondary
                hover:border-accent
                hover:text-accent
                transition-all
                duration-150
              "
            >
              <IconArrowLeft size={17} stroke={1.8} />
            </button>

            <div className="h-6 w-px bg-border-tertiary" />
          </>
        )}

        {/* TITLE */}
        <div className="flex-1 min-w-0">
          <div
            className="
              text-[17px]
              md:text-[18px]
              font-semibold
              text-text-primary
              tracking-[-0.018em]
              leading-tight
              truncate
            "
          >
            {title}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />

            <span className="text-[9px] font-medium text-text-tertiary tracking-[0.01em]">
              SpectraSafe
            </span>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        {right && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {right}
          </div>
        )}

      </div>
    </div>
  );
}