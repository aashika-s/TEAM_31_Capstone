// import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
// import { IconHome, IconPackage, IconPlus, IconUser } from "@tabler/icons-react";
// import Screen from "../../components/Screen";
// import TabBar from "../../components/TabBar";
// import BrandHome from "./BrandHome";
// import BrandProducts from "./BrandProducts";
// import BrandProductDetail from "./BrandProductDetail";
// import BrandProductNew from "./BrandProductNew";
// import BrandProfile from "./BrandProfile";

// const TABS = [
//   { key: "home", label: "Home", icon: IconHome, path: "/brand" },
//   { key: "products", label: "Products", icon: IconPackage, path: "/brand/products" },
//   { key: "new", label: "Register", icon: IconPlus, path: "/brand/products/new" },
//   { key: "profile", label: "Profile", icon: IconUser, path: "/brand/profile" },
// ];

// function ComingSoon({ label }) {
//   return <div className="p-4 text-sm text-text-secondary">{label} lands in a later phase.</div>;
// }

// /**
//  * The wireframe's Brand role also has a Label Studio (AI generator +
//  * editor) and a multi-country Compliance matrix screen -- both
//  * deliberately not here. The label studio is a separate, already-in-
//  * progress piece (built elsewhere); the compliance matrix needs real
//  * per-country rule backends that don't exist yet (only a single
//  * FSSAI-style engine does). What IS here -- product registration, list,
//  * detail, batches -- is real, working, and backed by the actual registry
//  * API tested earlier.
//  */
// export default function BrandLayout() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const active =
//     TABS.find(
//       (t) =>
//         location.pathname === t.path ||
//         (t.key === "home" && location.pathname === "/brand") ||
//         (t.key === "products" && location.pathname.startsWith("/brand/products") && location.pathname !== "/brand/products/new")
//     )?.key || "home";

//   return (
//     <Screen
//       tabBar={
//         <TabBar
//           items={TABS}
//           active={active}
//           onChange={(key) => navigate(TABS.find((t) => t.key === key).path)}
//         />
//       }
//     >
//       <Routes>
//         <Route index element={<BrandHome />} />
//         <Route path="products" element={<BrandProducts />} />
//         <Route path="products/new" element={<BrandProductNew />} />
//         <Route path="products/:productId" element={<BrandProductDetail />} />
//         <Route path="profile" element={<BrandProfile />} />
//       </Routes>
//     </Screen>
//   );
// }
















// import {
//   Routes,
//   Route,
//   useNavigate,
//   useLocation,
// } from "react-router-dom";

// import {
//   IconHome,
//   IconPackage,
//   IconPlus,
//   IconUser,
//   IconFileText,
// } from "@tabler/icons-react";

// import Screen from "../../components/Screen";
// import TabBar from "../../components/TabBar";

// import BrandHome from "./BrandHome";
// import BrandProducts from "./BrandProducts";
// import BrandProductDetail from "./BrandProductDetail";
// import BrandProductNew from "./BrandProductNew";
// import BrandProfile from "./BrandProfile";

// import StoreDetailsPage from "../../components/profile/StoreDetailsPage";
// import LocationSettingsPage from "../../components/profile/LocationSettingsPage";
// import NotificationsPage from "../../components/profile/NotificationsPage";
// import DataPrivacyPage from "../../components/profile/DataPrivacyPage";

// import BrandLabels from "./BrandLabels";
// import BrandLabelEditor from "./BrandLabelEditor";

// const TABS = [
//   {
//     key: "home",
//     label: "Home",
//     icon: IconHome,
//     path: "/brand",
//   },
//   {
//     key: "products",
//     label: "Products",
//     icon: IconPackage,
//     path: "/brand/products",
//   },
//   {
//     key: "new",
//     label: "Register",
//     icon: IconPlus,
//     path: "/brand/products/new",
//   },
//   {
//     key: "profile",
//     label: "Profile",
//     icon: IconUser,
//     path: "/brand/profile",
//   },
//   {
//     key: "labels",
//     label: "Labels",
//     icon: IconFileText,
//     path: "/brand/labels",
//   },
// ];

// export default function BrandLayout() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const active =
//     TABS.find((tab) => {
//       if (tab.key === "home") {
//         return location.pathname === "/brand";
//       }

//       if (tab.key === "products") {
//         return (
//           location.pathname.startsWith("/brand/products") &&
//           location.pathname !== "/brand/products/new"
//         );
//       }

//       if (tab.key === "labels") {
//         return location.pathname.startsWith("/brand/labels");
//       }

//       return location.pathname === tab.path;
//     })?.key || "home";

//   function handleTabChange(key) {
//     const tab = TABS.find((item) => item.key === key);

//     if (tab) {
//       navigate(tab.path);
//     }
//   }

//   return (
//     <Screen
//       tabBar={
//         <TabBar
//           items={TABS}
//           active={active}
//           onChange={handleTabChange}
//         />
//       }
//     >
//       <Routes>
//         {/* HOME */}
//         <Route
//           index
//           element={<BrandHome />}
//         />

//         {/* PRODUCTS */}
//         <Route
//           path="products"
//           element={<BrandProducts />}
//         />

//         <Route
//           path="products/new"
//           element={<BrandProductNew />}
//         />

//         <Route
//           path="products/:productId"
//           element={<BrandProductDetail />}
//         />

//         {/* LABELS */}
//         <Route
//           path="labels"
//           element={<BrandLabels />}
//         />

//         <Route
//           path="labels/:labelId"
//           element={<BrandLabelEditor />}
//         />

//         {/* PROFILE */}
//         <Route
//           path="profile"
//           element={<BrandProfile />}
//         />

//         <Route
//           path="profile/store"
//           element={<StoreDetailsPage backTo="/brand/profile" />}
//         />

//         <Route
//           path="profile/location"
//           element={<LocationSettingsPage backTo="/brand/profile" />}
//         />

//         <Route
//           path="profile/notifications"
//           element={<NotificationsPage backTo="/brand/profile" />}
//         />

//         <Route
//           path="profile/privacy"
//           element={<DataPrivacyPage backTo="/brand/profile" />}
//         />
//       </Routes>
//     </Screen>
//   );
// }





import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import {
  IconHome,
  IconPackage,
  IconPlus,
  IconFileText,
  IconUser,
  IconShieldCheck,
} from "@tabler/icons-react";

import BrandHome from "./BrandHome";
import BrandProducts from "./BrandProducts";
import BrandProductDetail from "./BrandProductDetail";
import BrandProductNew from "./BrandProductNew";
import BrandLabels from "./BrandLabels";
import BrandLabelEditor from "./BrandLabelEditor";
import BrandProfile from "./BrandProfile";
import StoreDetailsPage from "../../components/profile/StoreDetailsPage";
import LocationSettingsPage from "../../components/profile/LocationSettingsPage";
import NotificationsPage from "../../components/profile/NotificationsPage";
import DataPrivacyPage from "../../components/profile/DataPrivacyPage";

import { useAuth } from "../../context/AuthContext";

/* Sidebar shell matching ShopLayout.jsx -- same tokens, same structure,
   so Shop and Brand read as one product instead of two different
   navigation patterns. */

const TABS = [
  { key: "home", label: "Dashboard", icon: IconHome, path: "/brand" },
  { key: "products", label: "Products", icon: IconPackage, path: "/brand/products" },
  { key: "new", label: "Register Product", icon: IconPlus, path: "/brand/products/new" },
  { key: "labels", label: "Labels", icon: IconFileText, path: "/brand/labels" },
  { key: "profile", label: "Profile", icon: IconUser, path: "/brand/profile" },
];

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function BrandLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const active =
    TABS.find((tab) => {
      if (tab.key === "home") return location.pathname === "/brand";
      if (tab.key === "products") {
        return (
          location.pathname.startsWith("/brand/products") &&
          location.pathname !== "/brand/products/new"
        );
      }
      if (tab.key === "labels") return location.pathname.startsWith("/brand/labels");
      return location.pathname === tab.path;
    })?.key || "home";

  return (
    <div className="min-h-screen bg-bg-tertiary text-text-primary">
      {/* DESKTOP SIDEBAR */}
      <aside className="fixed left-0 top-0 bottom-0 hidden lg:flex w-[248px] flex-col bg-bg-primary border-r border-border-tertiary z-40">
        <div className="h-[88px] px-7 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-app-md bg-accent text-white flex items-center justify-center shadow-[var(--shadow-card)]">
              <IconShieldCheck size={21} stroke={2} />
            </div>
            <div>
              <div className="text-[16px] font-semibold tracking-[-0.02em]">
                SpectraSafe
              </div>
              <div className="text-[10px] text-text-tertiary mt-0.5">
                Food Safety Intelligence
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 mb-5">
          <div className="px-3 mb-2 text-[11px] font-medium text-text-tertiary">
            Brand workspace
          </div>

          <nav className="space-y-0.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = active === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => navigate(tab.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left rounded-app-md transition-colors ${
                    isActive
                      ? "bg-accent-bg text-accent-text font-semibold"
                      : "text-text-secondary hover:bg-bg-secondary hover:text-text-primary"
                  }`}
                >
                  <Icon size={19} stroke={isActive ? 2 : 1.8} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-app-lg bg-bg-secondary border border-border-tertiary p-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-accent-bg text-accent-text flex items-center justify-center text-xs font-semibold">
                {initials(user?.name)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">
                  {user?.name || "Brand user"}
                </p>
                <p className="text-[10px] text-text-tertiary truncate mt-0.5">
                  {user?.organization || "Brand workspace"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="lg:ml-[248px] min-h-screen">
        <header className="sticky top-0 z-30 h-[72px] bg-bg-primary/90 backdrop-blur-xl border-b border-border-tertiary flex items-center justify-between px-5 sm:px-8 lg:px-10">
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-app-sm bg-accent text-white flex items-center justify-center">
              <IconShieldCheck size={17} />
            </div>
            <span className="font-semibold text-sm">SpectraSafe</span>
          </div>

          <div className="hidden lg:block">
            <p className="text-[11px] text-text-tertiary">Brand workspace</p>
            <p className="text-sm font-semibold mt-0.5">Product & Label Portal</p>
          </div>

          <button
            onClick={() => navigate("/brand/profile")}
            className="flex items-center gap-2.5 rounded-app-md px-2 py-1.5 hover:bg-bg-secondary transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-accent-bg text-accent-text flex items-center justify-center text-xs font-semibold">
              {initials(user?.name)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold">{user?.name || "Brand user"}</p>
              <p className="text-[10px] text-text-tertiary">Brand</p>
            </div>
          </button>
        </header>

        <div className="pb-24 lg:pb-10">
          <Routes>
            <Route index element={<BrandHome />} />
            <Route path="products" element={<BrandProducts />} />
            <Route path="products/new" element={<BrandProductNew />} />
            <Route path="products/:productId" element={<BrandProductDetail />} />
            <Route path="labels" element={<BrandLabels />} />
            <Route path="labels/:labelId" element={<BrandLabelEditor />} />
            <Route path="profile" element={<BrandProfile />} />
            <Route path="profile/store" element={<StoreDetailsPage backTo="/brand/profile" />} />
            <Route path="profile/location" element={<LocationSettingsPage backTo="/brand/profile" />} />
            <Route path="profile/notifications" element={<NotificationsPage backTo="/brand/profile" />} />
            <Route path="profile/privacy" element={<DataPrivacyPage backTo="/brand/profile" />} />
          </Routes>
        </div>
      </main>

      {/* MOBILE BOTTOM NAV -- still needed since the sidebar is lg:only,
          same as ShopLayout */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-bg-primary/95 backdrop-blur-xl border-t border-border-tertiary px-2 py-2">
        <div className="flex items-center justify-around">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center gap-1 min-w-[60px] py-1 ${
                  isActive ? "text-accent-text" : "text-text-tertiary"
                }`}
              >
                <Icon size={19} stroke={isActive ? 2 : 1.6} />
                <span className="text-[9px] font-medium">
                  {tab.label.replace(" Product", "")}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}