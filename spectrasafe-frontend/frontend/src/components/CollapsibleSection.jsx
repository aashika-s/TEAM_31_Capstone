import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";

export default function CollapsibleSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border-tertiary rounded-app-lg mb-3 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-bg-secondary text-left"
      >
        <span className="text-sm font-semibold text-text-primary">{title}</span>
        <IconChevronDown size={16} className={`text-text-tertiary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}