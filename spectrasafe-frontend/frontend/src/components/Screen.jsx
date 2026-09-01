/**
 * App shell for one screen: mobile-first, capped to a phone-ish width even
 * on desktop so the app keeps its identity everywhere (this replaces the
 * wireframe's fake phone-bezel demo trick with a real responsive layout —
 * no decorative frame, just a constrained real viewport).
 */

/* THIS IS FOR PHONE SCREEN 
export default function Screen({ children, tabBar }) {
  return (
    <div className="min-h-screen bg-bg-tertiary flex justify-center">
      <div className="w-full max-w-[420px] bg-bg-primary min-h-screen flex flex-col shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
        <div className="flex-1 overflow-y-auto">{children}</div>
        {tabBar}
      </div>
    </div>
  );
}

export function ScreenContent({ children, className = "" }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

*/







/**
 * App shell: left sidebar (rendered via the `tabBar` prop, now a real
 * sidebar nav) + a full-width scrollable content area, capped at a
 * readable max-width and centered so it reads as a dashboard, not a
 * stretched phone screen.
 */
export default function Screen({ children, tabBar }) {
  return (
    <div className="min-h-screen bg-bg-tertiary flex">
      {tabBar}
      <div className="flex-1 min-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </div>
    </div>
  );
}

export function ScreenContent({ children, className = "" }) {
  return <div className={`p-6 md:p-8 ${className}`}>{children}</div>;
}