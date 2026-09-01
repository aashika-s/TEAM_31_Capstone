/**
 * Status pill — variants match the wireframe's .pill-pass/-fail/-warn/-info/-purple
 * exactly. `status` accepts the compliance-style statuses used across the app
 * (COMPLIANT/NON_COMPLIANT/etc.) and maps them onto these five visual variants,
 * so callers can pass a real backend status string directly.
 */
const VARIANTS = {
  pass: "bg-pass-bg text-pass-text",
  fail: "bg-fail-bg text-fail-text",
  warn: "bg-warn-bg text-warn-text",
  info: "bg-info-bg text-info-text",
  purple: "bg-accent-bg text-accent-text",
};

const STATUS_TO_VARIANT = {
  COMPLIANT: "pass",
  MATCHED: "pass",
  NEEDS_REVIEW: "warn",
  MATCHED_WITH_DISCREPANCIES: "warn",
  NON_COMPLIANT: "fail",
  SUSPICIOUS: "fail",
  NOT_REGISTERED: "info",
  NO_LICENSE_EXTRACTED: "info",
};

export default function Pill({ variant, status, children }) {
  const resolved = variant || STATUS_TO_VARIANT[status] || "info";
  return (
    <span
      className={`inline-block text-[11px] px-2 py-[3px] rounded-full font-medium ${VARIANTS[resolved]}`}
    >
      {children}
    </span>
  );
}
