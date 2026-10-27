import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { IconLayoutDashboard, IconDroplet, IconLogout, IconShieldCheck } from "@tabler/icons-react";

import WaterDashboard from "./WaterDashboard";
import WaterSubmit from "./WaterSubmit";
import { useAuth } from "../../context/AuthContext";

/* Shared shell for the two water officials. Mounted at /spcb/* and /cpcb/*.
   Same palette/structure as ShopLayout: desktop sidebar + mobile bottom nav. */

const ROLE_INFO = {
  SPCB: { base: "/spcb", title: "State Pollution Control Board", scope: (u) => u?.state || "State" },
  CPCB: { base: "/cpcb", title: "Central Pollution Control Board", scope: () => "National" },
};

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function WaterLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const info = ROLE_INFO[user?.role] || ROLE_INFO.SPCB;

  const TABS = [
    { key: "dash", label: "Water quality", short: "Dashboard", icon: IconLayoutDashboard, path: info.base },
    { key: "new", label: "New sample", short: "New sample", icon: IconDroplet, path: `${info.base}/new` },
  ];
  const path = location.pathname.replace(/\/$/, "");
  const active = path.startsWith(`${info.base}/new`) ? "new" : "dash";

  function signOut() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#211C16]">
      {/* DESKTOP SIDEBAR */}
      <aside className="fixed left-0 top-0 bottom-0 hidden lg:flex w-[248px] flex-col bg-[#FBF9F4] border-r border-[#DED5C4] z-40">
        <div className="h-[88px] px-7 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#C1701E] text-white flex items-center justify-center">
              <IconShieldCheck size={19} stroke={2} />
            </div>
            <div>
              <div className="text-[17px] leading-none" style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600 }}>
                SpectraSafe
              </div>
              <div className="text-[10px] text-[#8A8074] mt-1">Water Quality Screening</div>
            </div>
          </div>
        </div>

        <div className="px-4 mb-5">
          <div className="px-3 mb-2 text-[11px] font-medium text-[#8A8074]">Workspace</div>
          <nav className="space-y-0.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = active === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => navigate(tab.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-[13.5px] text-left transition-colors border-l-2 ${
                    isActive
                      ? "border-[#C1701E] bg-[#F3E3D0]/50 text-[#211C16] font-semibold"
                      : "border-transparent text-[#6B6255] hover:bg-[#F3E3D0]/25 hover:text-[#211C16]"
                  }`}
                >
                  <Icon size={18} stroke={isActive ? 2 : 1.6} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-[#DED5C4]">
          <div className="flex items-center gap-2.5 px-1 py-1">
            <div className="w-8 h-8 rounded-full bg-[#F3E3D0] text-[#C1701E] flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
              {initials(user?.name)}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[12.5px] font-semibold truncate">{user?.name}</p>
              <p className="text-[11px] text-[#8A8074] truncate">{user?.role} · {info.scope(user)}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="mt-2 w-full inline-flex items-center gap-2 px-2 py-2 text-[12.5px] text-[#6B6255] hover:text-[#211C16] transition-colors"
          >
            <IconLogout size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="lg:ml-[248px] min-h-screen">
        <header className="sticky top-0 z-30 h-14 lg:h-[72px] bg-[#F7F3EA]/90 backdrop-blur-xl border-b border-[#DED5C4] flex items-center justify-between px-5 sm:px-8 lg:px-10">
          <div>
            <p className="text-[11px] text-[#8A8074] hidden lg:block">{info.title}</p>
            <p className="text-[14px] font-semibold text-[#211C16]">
              {user?.role === "CPCB" ? "National water screening" : `Water screening · ${info.scope(user)}`}
            </p>
          </div>
          <button
            onClick={signOut}
            className="lg:hidden inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-[#6B6255] border border-[#DED5C4]"
          >
            <IconLogout size={14} /> Sign out
          </button>
        </header>

        <div className="pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-10">
          <Routes>
            <Route index element={<WaterDashboard />} />
            <Route path="new" element={<WaterSubmit />} />
          </Routes>
        </div>
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#FBF9F4]/95 backdrop-blur-xl border-t border-[#DED5C4] px-1 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-around">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[48px] py-1 ${
                  isActive ? "text-[#C1701E]" : "text-[#8A8074]"
                }`}
              >
                <Icon size={19} stroke={isActive ? 2 : 1.6} />
                <span className="text-[10px] font-medium">{tab.short}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
