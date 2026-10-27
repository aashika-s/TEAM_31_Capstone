// Shared look-up for the water module. Status is always icon + colour + text
// (never colour alone), matching the rest of the app.
import { IconCircleCheck, IconAlertTriangle, IconCircleX } from "@tabler/icons-react";

export const WATER_META = {
  unsafe: {
    label: "Unsafe",
    detail: "Contaminant likely present. Confirm with a certified lab.",
    icon: IconCircleX,
    pill: "bg-fail-bg text-fail-text",
    hex: "#C0392B",
  },
  no_contaminant_detected: {
    label: "No contaminant detected",
    detail: "Nothing flagged by this screening. This is not a drinking-water certification.",
    icon: IconCircleCheck,
    pill: "bg-pass-bg text-pass-text",
    hex: "#2E7D4F",
  },
  inconclusive: {
    label: "Inconclusive",
    detail: "The model could not decide. Re-take the photo or send for lab testing.",
    icon: IconAlertTriangle,
    pill: "bg-warn-bg text-warn-text",
    hex: "#C1701E",
  },
};

export const WATER_FILTERS = [
  { key: null, label: "All" },
  { key: "unsafe", label: "Unsafe" },
  { key: "inconclusive", label: "Inconclusive" },
  { key: "no_contaminant_detected", label: "No contaminant" },
];

export function WaterBadge({ result, className = "" }) {
  const m = WATER_META[result] || WATER_META.inconclusive;
  const Icon = m.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[11px] font-semibold ${m.pill} ${className}`}
    >
      <Icon size={13} />
      {m.label}
    </span>
  );
}
