/** Small formatting helpers shared across screens -- no library needed
 * for something this simple. */

export function timeAgo(isoString) {
  const then = new Date(isoString).getTime();
  const diffSec = Math.round((Date.now() - then) / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

export function isToday(isoString) {
  const d = new Date(isoString);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

const STATUS_LABEL = {
  COMPLIANT: "Compliant",
  NEEDS_REVIEW: "Needs review",
  NON_COMPLIANT: "Non-compliant",
  SUSPICIOUS: "Suspicious",
};

export function statusLabel(status) {
  return STATUS_LABEL[status] || status;
}