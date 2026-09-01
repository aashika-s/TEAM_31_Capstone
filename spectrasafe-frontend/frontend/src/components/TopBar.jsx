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







import { IconArrowLeft } from "@tabler/icons-react";

export default function TopBar({ title, onBack, right }) {
  return (
    <div className="px-6 md:px-8 py-5 flex items-center gap-3 border-b border-border-tertiary bg-bg-primary sticky top-0 z-10">
      {onBack && (
        <button
          onClick={onBack}
          className="bg-transparent border-none cursor-pointer text-text-secondary hover:text-text-primary p-1 flex-shrink-0"
        >
          <IconArrowLeft size={20} />
        </button>
      )}
      <div className="text-xl font-semibold text-text-primary flex-1">{title}</div>
      {right}
    </div>
  );
}