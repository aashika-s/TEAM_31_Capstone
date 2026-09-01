// import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
// import { IconHome, IconCamera, IconStack, IconHistory, IconUser } from "@tabler/icons-react";
// import Screen from "../../components/Screen";
// import TabBar from "../../components/TabBar";
// import ShopHome from "./ShopHome";
// import ShopScan from "./ShopScan";
// import ShopResult from "./ShopResult";

// const TABS = [
//   { key: "home", label: "Home", icon: IconHome, path: "/shop" },
//   { key: "scan", label: "Scan", icon: IconCamera, path: "/shop/scan" },
//   { key: "batch", label: "Batch", icon: IconStack, path: "/shop/batch" },
//   { key: "history", label: "History", icon: IconHistory, path: "/shop/history" },
//   { key: "profile", label: "Profile", icon: IconUser, path: "/shop/profile" },
// ];

// function ComingSoon({ label }) {
//   return (
//     <div className="p-4 text-sm text-text-secondary">
//       {label} lands in phase 4.
//     </div>
//   );
// }

// /** Tab bar only highlights + navigates for the tabs that have real screens
//  * today (Home, Scan) -- Batch/History/Profile are visibly disabled-looking
//  * via the ComingSoon screen rather than silently doing nothing, so it's
//  * clear they're not broken, just not built yet. */
// export default function ShopLayout() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const active =
//     TABS.find((t) => location.pathname === t.path || (t.key === "home" && location.pathname === "/shop"))
//       ?.key || "home";

//   return (
//     <Screen tabBar={<TabBar items={TABS} active={active} onChange={(key) => {
//       const tab = TABS.find((t) => t.key === key);
//       navigate(tab.path);
//     }} />}>
//       <Routes>
//         <Route index element={<ShopHome />} />
//         <Route path="scan" element={<ShopScan />} />
//         <Route path="result/:scanId" element={<ShopResult />} />
//         <Route path="batch" element={<ComingSoon label="Batch scan" />} />
//         <Route path="history" element={<ComingSoon label="Scan history" />} />
//         <Route path="profile" element={<ComingSoon label="Profile" />} />
//       </Routes>
//     </Screen>
//   );
// }




// PHASE 4
// import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
// import { IconHome, IconCamera, IconStack, IconHistory, IconUser } from "@tabler/icons-react";
// import Screen from "../../components/Screen";
// import TabBar from "../../components/TabBar";
// import ShopHome from "./ShopHome";
// import ShopScan from "./ShopScan";
// import ShopResult from "./ShopResult";
// import ShopBatch from "./ShopBatch";
// import ShopHistory from "./ShopHistory";

// const TABS = [
//   { key: "home", label: "Home", icon: IconHome, path: "/shop" },
//   { key: "scan", label: "Scan", icon: IconCamera, path: "/shop/scan" },
//   { key: "batch", label: "Batch", icon: IconStack, path: "/shop/batch" },
//   { key: "history", label: "History", icon: IconHistory, path: "/shop/history" },
//   { key: "profile", label: "Profile", icon: IconUser, path: "/shop/profile" },
// ];

// function ComingSoon({ label }) {
//   return (
//     <div className="p-4 text-sm text-text-secondary">
//       {label} lands in a later phase.
//     </div>
//   );
// }

// /** Tab bar only highlights + navigates for the tabs that have real screens
//  * today (Home, Scan, Batch, History) -- Profile is visibly disabled-looking
//  * via the ComingSoon screen rather than silently doing nothing, so it's
//  * clear it's not broken, just not built yet. */
// export default function ShopLayout() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const active =
//     TABS.find((t) => location.pathname === t.path || (t.key === "home" && location.pathname === "/shop"))
//       ?.key || "home";

//   return (
//     <Screen tabBar={<TabBar items={TABS} active={active} onChange={(key) => {
//       const tab = TABS.find((t) => t.key === key);
//       navigate(tab.path);
//     }} />}>
//       <Routes>
//         <Route index element={<ShopHome />} />
//         <Route path="scan" element={<ShopScan />} />
//         <Route path="result/:scanId" element={<ShopResult />} />
//         <Route path="batch" element={<ShopBatch />} />
//         <Route path="history" element={<ShopHistory />} />
//         <Route path="profile" element={<ComingSoon label="Profile" />} />
//       </Routes>
//     </Screen>
//   );
// }















// import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
// import { IconHome, IconCamera, IconStack, IconHistory, IconUser } from "@tabler/icons-react";
// import Screen from "../../components/Screen";
// import TabBar from "../../components/TabBar";
// import ShopHome from "./ShopHome";
// import ShopScan from "./ShopScan";
// import ShopResult from "./ShopResult";
// import ShopBatch from "./ShopBatch";
// import ShopHistory from "./ShopHistory";
// import ShopLookup from "./ShopLookup";
// import ShopLookupDetail from "./ShopLookupDetail";
// import ShopProfile from "./ShopProfile";

// const TABS = [
//   { key: "home", label: "Home", icon: IconHome, path: "/shop" },
//   { key: "scan", label: "Scan", icon: IconCamera, path: "/shop/scan" },
//   { key: "batch", label: "Batch", icon: IconStack, path: "/shop/batch" },
//   { key: "history", label: "History", icon: IconHistory, path: "/shop/history" },
//   { key: "profile", label: "Profile", icon: IconUser, path: "/shop/profile" },
// ];

// function ComingSoon({ label }) {
//   return (
//     <div className="p-4 text-sm text-text-secondary">
//       {label} lands in a later phase.
//     </div>
//   );
// }

// /** Tab bar only highlights + navigates for the tabs that have real screens
//  * today (Home, Scan, Batch, History) -- Profile is visibly disabled-looking
//  * via the ComingSoon screen rather than silently doing nothing, so it's
//  * clear it's not broken, just not built yet. */
// export default function ShopLayout() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const active =
//     TABS.find((t) => location.pathname === t.path || (t.key === "home" && location.pathname === "/shop"))
//       ?.key || "home";

//   return (
//     <Screen tabBar={<TabBar items={TABS} active={active} onChange={(key) => {
//       const tab = TABS.find((t) => t.key === key);
//       navigate(tab.path);
//     }} />}>
//       <Routes>
//         <Route index element={<ShopHome />} />
//         <Route path="scan" element={<ShopScan />} />
//         <Route path="result/:scanId" element={<ShopResult />} />
//         <Route path="batch" element={<ShopBatch />} />
//         <Route path="history" element={<ShopHistory />} />
//         <Route path="lookup" element={<ShopLookup />} />
//         <Route path="lookup/:slug" element={<ShopLookupDetail />} />
//         <Route path="profile" element={<ShopProfile />} />
//       </Routes>
//     </Screen>
//   );
// }











import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  IconHome,
  IconCamera,
  IconStack,
  IconHistory,
  IconUser,
  IconShieldCheck,
} from "@tabler/icons-react";

import ShopHome from "./ShopHome";
import ShopScan from "./ShopScan";
import ShopResult from "./ShopResult";
import ShopBatch from "./ShopBatch";
import ShopHistory from "./ShopHistory";
import ShopLookup from "./ShopLookup";
import ShopLookupDetail from "./ShopLookupDetail";
import ShopProfile from "./ShopProfile";

import { useAuth } from "../../context/AuthContext";

const TABS = [
  {
    key: "home",
    label: "Dashboard",
    icon: IconHome,
    path: "/shop",
  },
  {
    key: "scan",
    label: "Scan Product",
    icon: IconCamera,
    path: "/shop/scan",
  },
  {
    key: "batch",
    label: "Batch Scan",
    icon: IconStack,
    path: "/shop/batch",
  },
  {
    key: "history",
    label: "Scan History",
    icon: IconHistory,
    path: "/shop/history",
  },
  {
    key: "profile",
    label: "Profile",
    icon: IconUser,
    path: "/shop/profile",
  },
];

function initials(name) {
  if (!name) return "?";

  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ShopLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const active =
    TABS.find(
      (tab) =>
        location.pathname === tab.path ||
        (tab.key === "home" && location.pathname === "/shop")
    )?.key || "home";

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#15161b]">

      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}

      <aside
        className="
          fixed
          left-0
          top-0
          bottom-0
          hidden
          lg:flex
          w-[248px]
          flex-col
          bg-white
          border-r
          border-[#e8e9ed]
          z-40
        "
      >

        {/* Logo */}

        <div className="h-[88px] px-7 flex items-center">

          <div className="flex items-center gap-3">

            <div
              className="
                w-10 h-10
                rounded-xl
                bg-[#4338ca]
                text-white
                flex items-center justify-center
                shadow-[0_6px_16px_rgba(67,56,202,0.20)]
              "
            >
              <IconShieldCheck size={21} stroke={2} />
            </div>

            <div>

              <div className="text-[16px] font-semibold tracking-[-0.02em]">
                SpectraSafe
              </div>

              <div className="text-[10px] text-[#9297a3] mt-0.5">
                Food Safety Intelligence
              </div>

            </div>

          </div>

        </div>


        {/* Workspace */}

        <div className="px-4 mb-5">

          <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.12em] font-semibold text-[#9a9da6]">
            Workspace
          </div>

          <nav className="space-y-1">

            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = active === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => navigate(tab.path)}
                  className={`
                    w-full
                    flex
                    items-center
                    gap-3
                    px-3
                    py-2.5
                    rounded-xl
                    text-sm
                    text-left
                    transition-all
                    ${
                      isActive
                        ? "bg-[#efefff] text-[#4338ca] font-semibold"
                        : "text-[#626775] hover:bg-[#f7f7fa] hover:text-[#20232b]"
                    }
                  `}
                >

                  <Icon
                    size={19}
                    stroke={isActive ? 2 : 1.8}
                  />

                  <span>{tab.label}</span>

                  {tab.key === "scan" && (
                    <span className="ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-[#4338ca] text-white">
                      NEW
                    </span>
                  )}

                </button>
              );
            })}

          </nav>

        </div>


        {/* Bottom sidebar */}

        <div className="mt-auto p-4">

          <div
            className="
              rounded-2xl
              bg-[#f7f7fc]
              border border-[#ececf5]
              p-4
            "
          >

            <div className="flex items-center gap-2.5">

              <div
                className="
                  w-9 h-9
                  rounded-full
                  bg-[#e8e9ff]
                  text-[#4338ca]
                  flex items-center justify-center
                  text-xs
                  font-semibold
                "
              >
                {initials(user?.name)}
              </div>

              <div className="min-w-0">

                <p className="text-xs font-semibold truncate">
                  {user?.name || "Shopkeeper"}
                </p>

                <p className="text-[10px] text-[#8b8f9b] truncate mt-0.5">
                  {user?.organization || "Retail workspace"}
                </p>

              </div>

            </div>

          </div>

        </div>

      </aside>


      {/* =====================================================
          MAIN AREA
      ====================================================== */}

      <main className="lg:ml-[248px] min-h-screen">

        {/* Header */}

        <header
          className="
            sticky
            top-0
            z-30
            h-[72px]
            bg-white/90
            backdrop-blur-xl
            border-b
            border-[#e8e9ed]
            flex
            items-center
            justify-between
            px-5
            sm:px-8
            lg:px-10
          "
        >

          <div className="lg:hidden flex items-center gap-2.5">

            <div className="w-8 h-8 rounded-lg bg-[#4338ca] text-white flex items-center justify-center">
              <IconShieldCheck size={17} />
            </div>

            <span className="font-semibold text-sm">
              SpectraSafe
            </span>

          </div>

          <div className="hidden lg:block">

            <p className="text-[11px] text-[#9297a3]">
              Retail workspace
            </p>

            <p className="text-sm font-semibold mt-0.5">
              Product Safety Dashboard
            </p>

          </div>


          {/* User */}

          <button
            onClick={() => navigate("/shop/profile")}
            className="
              flex
              items-center
              gap-2.5
              rounded-xl
              px-2
              py-1.5
              hover:bg-[#f5f5f8]
              transition
            "
          >

            <div
              className="
                w-9 h-9
                rounded-full
                bg-[#eeefff]
                text-[#4338ca]
                flex
                items-center
                justify-center
                text-xs
                font-semibold
              "
            >
              {initials(user?.name)}
            </div>

            <div className="hidden sm:block text-left">

              <p className="text-xs font-semibold">
                {user?.name || "Shopkeeper"}
              </p>

              <p className="text-[10px] text-[#9297a3]">
                Shopkeeper
              </p>

            </div>

          </button>

        </header>


        {/* Page */}

        <div className="pb-24 lg:pb-10">

          <Routes>

            <Route index element={<ShopHome />} />

            <Route path="scan" element={<ShopScan />} />

            <Route
              path="result/:scanId"
              element={<ShopResult />}
            />

            <Route
              path="batch"
              element={<ShopBatch />}
            />

            <Route
              path="history"
              element={<ShopHistory />}
            />

            <Route
              path="lookup"
              element={<ShopLookup />}
            />

            <Route
              path="lookup/:slug"
              element={<ShopLookupDetail />}
            />

            <Route
              path="profile"
              element={<ShopProfile />}
            />

          </Routes>

        </div>

      </main>


      {/* =====================================================
          MOBILE BOTTOM NAV
      ====================================================== */}

      <nav
        className="
          fixed
          bottom-0
          left-0
          right-0
          z-50
          lg:hidden
          bg-white/95
          backdrop-blur-xl
          border-t
          border-[#e7e8ec]
          px-2
          py-2
        "
      >

        <div className="flex items-center justify-around">

          {TABS.map((tab) => {

            const Icon = tab.icon;
            const isActive = active === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => navigate(tab.path)}
                className={`
                  flex
                  flex-col
                  items-center
                  gap-1
                  min-w-[64px]
                  py-1
                  rounded-xl
                  ${
                    isActive
                      ? "text-[#4338ca]"
                      : "text-[#9297a3]"
                  }
                `}
              >

                <Icon size={19} />

                <span className="text-[9px] font-medium">
                  {tab.label.replace("Product ", "").replace(" Scan", "")}
                </span>

              </button>
            );
          })}

        </div>

      </nav>

    </div>
  );
}