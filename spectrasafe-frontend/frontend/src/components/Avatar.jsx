/** Initials avatar. Defaults to the accent tokens; pass bg/text hex values for role-tinted variants (e.g. FSSAI's amber, shopkeeper's teal, matching the wireframe). */
export default function Avatar({ initials, size = 36, bg, text }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        background: bg || "var(--color-accent-bg)",
        color: text || "var(--color-accent-text)",
      }}
      className="rounded-full flex items-center justify-center font-medium flex-shrink-0"
    >
      {initials}
    </div>
  );
}
