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











// import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
// import {
//   IconHome,
//   IconCamera,
//   IconStack,
//   IconHistory,
//   IconUser,
//   IconShieldCheck,
// } from "@tabler/icons-react";

// import ShopHome from "./ShopHome";
// import ShopScan from "./ShopScan";
// import ShopResult from "./ShopResult";
// import ShopBatch from "./ShopBatch";
// import ShopHistory from "./ShopHistory";
// import ShopLookup from "./ShopLookup";
// import ShopLookupDetail from "./ShopLookupDetail";
// import ShopProfile from "./ShopProfile";
// import StoreDetailsPage from "../../components/profile/StoreDetailsPage";
// import LocationSettingsPage from "../../components/profile/LocationSettingsPage";
// import NotificationsPage from "../../components/profile/NotificationsPage";
// import DataPrivacyPage from "../../components/profile/DataPrivacyPage";

// import { useAuth } from "../../context/AuthContext";

// const TABS = [
//   {
//     key: "home",
//     label: "Dashboard",
//     icon: IconHome,
//     path: "/shop",
//   },
//   {
//     key: "scan",
//     label: "Scan Product",
//     icon: IconCamera,
//     path: "/shop/scan",
//   },
//   {
//     key: "batch",
//     label: "Batch Scan",
//     icon: IconStack,
//     path: "/shop/batch",
//   },
//   {
//     key: "history",
//     label: "Scan History",
//     icon: IconHistory,
//     path: "/shop/history",
//   },
//   {
//     key: "profile",
//     label: "Profile",
//     icon: IconUser,
//     path: "/shop/profile",
//   },
// ];

// function initials(name) {
//   if (!name) return "?";

//   return name
//     .split(" ")
//     .map((p) => p[0])
//     .slice(0, 2)
//     .join("")
//     .toUpperCase();
// }

// export default function ShopLayout() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user } = useAuth();

//   const active =
//     TABS.find(
//       (tab) =>
//         location.pathname === tab.path ||
//         (tab.key === "home" && location.pathname === "/shop")
//     )?.key || "home";

//   return (
//     <div className="min-h-screen bg-[#f6fbf9] text-[#151b18]">

//       {/* =====================================================
//           DESKTOP SIDEBAR
//       ====================================================== */}

//       <aside
//         className="
//           fixed
//           left-0
//           top-0
//           bottom-0
//           hidden
//           lg:flex
//           w-[248px]
//           flex-col
//           bg-white
//           border-r
//           border-[#e8edeb]
//           z-40
//         "
//       >

//         {/* Logo */}

//         <div className="h-[88px] px-7 flex items-center">

//           <div className="flex items-center gap-3">

//             <div
//               className="
//                 w-10 h-10
//                 rounded-xl
//                 bg-[#38ca86]
//                 text-white
//                 flex items-center justify-center
//                 shadow-[0_6px_16px_rgba(31,109,71,0.20)]
//               "
//             >
//               <IconShieldCheck size={21} stroke={2} />
//             </div>

//             <div>

//               <div className="text-[16px] font-semibold tracking-[-0.02em]">
//                 SpectraSafe
//               </div>

//               <div className="text-[10px] text-[#a59b90] mt-0.5">
//                 Food Safety Intelligence
//               </div>

//             </div>

//           </div>

//         </div>


//         {/* Workspace */}

//         <div className="px-4 mb-5">

//           <div className="px-3 mb-2 text-[10px] uppercase tracking-[0.12em] font-semibold text-[#aaa196]">
//             Workspace
//           </div>

//           <nav className="space-y-1">

//             {TABS.map((tab) => {
//               const Icon = tab.icon;
//               const isActive = active === tab.key;

//               return (
//                 <button
//                   key={tab.key}
//                   onClick={() => navigate(tab.path)}
//                   className={`
//                     w-full
//                     flex
//                     items-center
//                     gap-3
//                     px-3
//                     py-2.5
//                     rounded-xl
//                     text-sm
//                     text-left
//                     transition-all
//                     ${
//                       isActive
//                         ? "bg-[#f2fcf7] text-[#38ca86] font-semibold"
//                         : "text-[#756c62] hover:bg-[#f7faf9] hover:text-[#202b26]"
//                     }
//                   `}
//                 >

//                   <Icon
//                     size={19}
//                     stroke={isActive ? 2 : 1.8}
//                   />

//                   <span>{tab.label}</span>

//                   {tab.key === "scan" && (
//                     <span className="ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-[#38ca86] text-white">
//                       NEW
//                     </span>
//                   )}

//                 </button>
//               );
//             })}

//           </nav>

//         </div>


//         {/* Bottom sidebar */}

//         <div className="mt-auto p-4">

//           <div
//             className="
//               rounded-2xl
//               bg-[#f7fcfa]
//               border border-[#ecf5f1]
//               p-4
//             "
//           >

//             <div className="flex items-center gap-2.5">

//               <div
//                 className="
//                   w-9 h-9
//                   rounded-full
//                   bg-[#ecfbf4]
//                   text-[#38ca86]
//                   flex items-center justify-center
//                   text-xs
//                   font-semibold
//                 "
//               >
//                 {initials(user?.name)}
//               </div>

//               <div className="min-w-0">

//                 <p className="text-xs font-semibold truncate">
//                   {user?.name || "Shopkeeper"}
//                 </p>

//                 <p className="text-[10px] text-[#9e9488] truncate mt-0.5">
//                   {user?.organization || "Retail workspace"}
//                 </p>

//               </div>

//             </div>

//           </div>

//         </div>

//       </aside>


//       {/* =====================================================
//           MAIN AREA
//       ====================================================== */}

//       <main className="lg:ml-[248px] min-h-screen">

//         {/* Header */}

//         <header
//           className="
//             sticky
//             top-0
//             z-30
//             h-[72px]
//             bg-white/90
//             backdrop-blur-xl
//             border-b
//             border-[#e8edeb]
//             flex
//             items-center
//             justify-between
//             px-5
//             sm:px-8
//             lg:px-10
//           "
//         >

//           <div className="lg:hidden flex items-center gap-2.5">

//             <div className="w-8 h-8 rounded-lg bg-[#38ca86] text-white flex items-center justify-center">
//               <IconShieldCheck size={17} />
//             </div>

//             <span className="font-semibold text-sm">
//               SpectraSafe
//             </span>

//           </div>

//           <div className="hidden lg:block">

//             <p className="text-[11px] text-[#a59b90]">
//               Retail workspace
//             </p>

//             <p className="text-sm font-semibold mt-0.5">
//               Product Safety Dashboard
//             </p>

//           </div>


//           {/* User */}

//           <button
//             onClick={() => navigate("/shop/profile")}
//             className="
//               flex
//               items-center
//               gap-2.5
//               rounded-xl
//               px-2
//               py-1.5
//               hover:bg-[#f5f8f7]
//               transition
//             "
//           >

//             <div
//               className="
//                 w-9 h-9
//                 rounded-full
//                 bg-[#f1fcf7]
//                 text-[#38ca86]
//                 flex
//                 items-center
//                 justify-center
//                 text-xs
//                 font-semibold
//               "
//             >
//               {initials(user?.name)}
//             </div>

//             <div className="hidden sm:block text-left">

//               <p className="text-xs font-semibold">
//                 {user?.name || "Shopkeeper"}
//               </p>

//               <p className="text-[10px] text-[#a59b90]">
//                 Shopkeeper
//               </p>

//             </div>

//           </button>

//         </header>


//         {/* Page */}

//         <div className="pb-24 lg:pb-10">

//           <Routes>

//             <Route index element={<ShopHome />} />

//             <Route path="scan" element={<ShopScan />} />

//             <Route
//               path="result/:scanId"
//               element={<ShopResult />}
//             />

//             <Route
//               path="batch"
//               element={<ShopBatch />}
//             />

//             <Route
//               path="history"
//               element={<ShopHistory />}
//             />

//             <Route
//               path="lookup"
//               element={<ShopLookup />}
//             />

//             <Route
//               path="lookup/:slug"
//               element={<ShopLookupDetail />}
//             />

//             <Route
//               path="profile"
//               element={<ShopProfile />}
//             />

//             <Route
//               path="profile/store"
//               element={<StoreDetailsPage backTo="/shop/profile" />}
//             />

//             <Route
//               path="profile/location"
//               element={<LocationSettingsPage backTo="/shop/profile" />}
//             />

//             <Route
//               path="profile/notifications"
//               element={<NotificationsPage backTo="/shop/profile" />}
//             />

//             <Route
//               path="profile/privacy"
//               element={<DataPrivacyPage backTo="/shop/profile" />}
//             />

//           </Routes>

//         </div>

//       </main>


//       {/* =====================================================
//           MOBILE BOTTOM NAV
//       ====================================================== */}

//       <nav
//         className="
//           fixed
//           bottom-0
//           left-0
//           right-0
//           z-50
//           lg:hidden
//           bg-white/95
//           backdrop-blur-xl
//           border-t
//           border-[#e7ecea]
//           px-2
//           py-2
//         "
//       >

//         <div className="flex items-center justify-around">

//           {TABS.map((tab) => {

//             const Icon = tab.icon;
//             const isActive = active === tab.key;

//             return (
//               <button
//                 key={tab.key}
//                 onClick={() => navigate(tab.path)}
//                 className={`
//                   flex
//                   flex-col
//                   items-center
//                   gap-1
//                   min-w-[64px]
//                   py-1
//                   rounded-xl
//                   ${
//                     isActive
//                       ? "text-[#38ca86]"
//                       : "text-[#a59b90]"
//                   }
//                 `}
//               >

//                 <Icon size={19} />

//                 <span className="text-[9px] font-medium">
//                   {tab.label.replace("Product ", "").replace(" Scan", "")}
//                 </span>

//               </button>
//             );
//           })}

//         </div>

//       </nav>

//     </div>
//   );
// }





















// import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
// import {
//   IconHome,
//   IconCamera,
//   IconStack,
//   IconHistory,
//   IconUser,
//   IconShieldCheck,
// } from "@tabler/icons-react";

// import ShopHome from "./ShopHome";
// import ShopScan from "./ShopScan";
// import ShopResult from "./ShopResult";
// import ShopBatch from "./ShopBatch";
// import ShopHistory from "./ShopHistory";
// import ShopLookup from "./ShopLookup";
// import ShopLookupDetail from "./ShopLookupDetail";
// import ShopProfile from "./ShopProfile";
// import StoreDetailsPage from "../../components/profile/StoreDetailsPage";
// import LocationSettingsPage from "../../components/profile/LocationSettingsPage";
// import NotificationsPage from "../../components/profile/NotificationsPage";
// import DataPrivacyPage from "../../components/profile/DataPrivacyPage";

// import { useAuth } from "../../context/AuthContext";

// /* Same palette as ShopScan.jsx — paper #F7F3EA, ink #211C16,
//    amber accent #C1701E, hairline rule #DED5C4. Fraunces for the
//    wordmark only, matching the headline treatment on Scan. */

// const TABS = [
//   { key: "home", label: "Dashboard", icon: IconHome, path: "/shop" },
//   { key: "scan", label: "Scan Product", icon: IconCamera, path: "/shop/scan" },
//   { key: "batch", label: "Batch Scan", icon: IconStack, path: "/shop/batch" },
//   { key: "history", label: "Scan History", icon: IconHistory, path: "/shop/history" },
//   { key: "profile", label: "Profile", icon: IconUser, path: "/shop/profile" },
// ];

// function initials(name) {
//   if (!name) return "?";
//   return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
// }

// export default function ShopLayout() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user } = useAuth();

//   const active =
//     TABS.find(
//       (tab) =>
//         location.pathname === tab.path ||
//         (tab.key === "home" && location.pathname === "/shop")
//     )?.key || "home";

//   return (
//     <div className="min-h-screen bg-[#F7F3EA] text-[#211C16]">
//       {/* =====================================================
//           DESKTOP SIDEBAR
//       ====================================================== */}
//       <aside className="fixed left-0 top-0 bottom-0 hidden lg:flex w-[248px] flex-col bg-[#FBF9F4] border-r border-[#DED5C4] z-40">
//         {/* Logo */}
//         <div className="h-[88px] px-7 flex items-center">
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 bg-[#C1701E] text-white flex items-center justify-center">
//               <IconShieldCheck size={19} stroke={2} />
//             </div>
//             <div>
//               <div
//                 className="text-[17px] text-[#211C16] leading-none"
//                 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600 }}
//               >
//                 SpectraSafe
//               </div>
//               <div className="text-[10px] text-[#8A8074] mt-1">
//                 Food Safety Intelligence
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Workspace nav */}
//         <div className="px-4 mb-5">
//           <div className="px-3 mb-2 text-[11px] font-medium text-[#8A8074]">
//             Workspace
//           </div>

//           <nav className="space-y-0.5">
//             {TABS.map((tab) => {
//               const Icon = tab.icon;
//               const isActive = active === tab.key;

//               return (
//                 <button
//                   key={tab.key}
//                   onClick={() => navigate(tab.path)}
//                   className={`w-full flex items-center gap-3 px-3 py-2.5 text-[13.5px] text-left transition-colors border-l-2 ${
//                     isActive
//                       ? "border-[#C1701E] bg-[#F3E3D0]/50 text-[#211C16] font-semibold"
//                       : "border-transparent text-[#6B6255] hover:bg-[#F3E3D0]/25 hover:text-[#211C16]"
//                   }`}
//                 >
//                   <Icon size={18} stroke={isActive ? 2 : 1.6} />
//                   <span>{tab.label}</span>

//                   {tab.key === "scan" && (
//                     <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C1701E]" />
//                   )}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>

//         {/* Bottom sidebar — plain block, no nested card */}
//         <div className="mt-auto p-4 pt-4 border-t border-[#DED5C4]">
//           <button
//             onClick={() => navigate("/shop/profile")}
//             className="w-full flex items-center gap-2.5 px-1 py-1 hover:opacity-80 transition-opacity"
//           >
//             <div className="w-8 h-8 rounded-full bg-[#F3E3D0] text-[#C1701E] flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
//               {initials(user?.name)}
//             </div>
//             <div className="min-w-0 text-left">
//               <p className="text-[12.5px] font-semibold truncate">
//                 {user?.name || "Shopkeeper"}
//               </p>
//               <p className="text-[11px] text-[#8A8074] truncate">
//                 {user?.organization || "Retail workspace"}
//               </p>
//             </div>
//           </button>
//         </div>
//       </aside>

//       {/* =====================================================
//           MAIN AREA
//       ====================================================== */}
//       <main className="lg:ml-[248px] min-h-screen">
//         {/* Header */}
//         <header className="sticky top-0 z-30 h-[72px] bg-[#F7F3EA]/90 backdrop-blur-xl border-b border-[#DED5C4] flex items-center justify-between px-5 sm:px-8 lg:px-10">
//           <div className="lg:hidden flex items-center gap-2.5">
//             <div className="w-8 h-8 bg-[#C1701E] text-white flex items-center justify-center">
//               <IconShieldCheck size={16} />
//             </div>
//             <span
//               className="text-[15px] text-[#211C16]"
//               style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600 }}
//             >
//               SpectraSafe
//             </span>
//           </div>

//           <div className="hidden lg:block">
//             <p className="text-[11px] text-[#8A8074]">Retail workspace</p>
//             <p className="text-[14px] font-semibold mt-0.5 text-[#211C16]">
//               Product Safety Dashboard
//             </p>
//           </div>

//           {/* User */}
//           <button
//             onClick={() => navigate("/shop/profile")}
//             className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-[#F3E3D0]/30 transition-colors"
//           >
//             <div className="w-8 h-8 rounded-full bg-[#F3E3D0] text-[#C1701E] flex items-center justify-center text-[11px] font-semibold">
//               {initials(user?.name)}
//             </div>
//             <div className="hidden sm:block text-left">
//               <p className="text-[12.5px] font-semibold text-[#211C16]">
//                 {user?.name || "Shopkeeper"}
//               </p>
//               <p className="text-[10.5px] text-[#8A8074]">Shopkeeper</p>
//             </div>
//           </button>
//         </header>

//         {/* Page */}
//         <div className="pb-24 lg:pb-10">
//           <Routes>
//             <Route index element={<ShopHome />} />
//             <Route path="scan" element={<ShopScan />} />
//             <Route path="result/:scanId" element={<ShopResult />} />
//             <Route path="batch" element={<ShopBatch />} />
//             <Route path="history" element={<ShopHistory />} />
//             <Route path="lookup" element={<ShopLookup />} />
//             <Route path="lookup/:slug" element={<ShopLookupDetail />} />
//             <Route path="profile" element={<ShopProfile />} />
//             <Route path="profile/store" element={<StoreDetailsPage backTo="/shop/profile" />} />
//             <Route path="profile/location" element={<LocationSettingsPage backTo="/shop/profile" />} />
//             <Route path="profile/notifications" element={<NotificationsPage backTo="/shop/profile" />} />
//             <Route path="profile/privacy" element={<DataPrivacyPage backTo="/shop/profile" />} />
//           </Routes>
//         </div>
//       </main>

//       {/* =====================================================
//           MOBILE BOTTOM NAV
//       ====================================================== */}
//       <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#FBF9F4]/95 backdrop-blur-xl border-t border-[#DED5C4] px-2 py-2">
//         <div className="flex items-center justify-around">
//           {TABS.map((tab) => {
//             const Icon = tab.icon;
//             const isActive = active === tab.key;

//             return (
//               <button
//                 key={tab.key}
//                 onClick={() => navigate(tab.path)}
//                 className={`flex flex-col items-center gap-1 min-w-[64px] py-1 ${
//                   isActive ? "text-[#C1701E]" : "text-[#8A8074]"
//                 }`}
//               >
//                 <Icon size={19} stroke={isActive ? 2 : 1.6} />
//                 <span className="text-[9px] font-medium">
//                   {tab.label.replace("Product ", "").replace(" Scan", "")}
//                 </span>
//               </button>
//             );
//           })}
//         </div>
//       </nav>
//     </div>
//   );
// }










import { useEffect } from "react";
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
import StoreDetailsPage from "../../components/profile/StoreDetailsPage";
import LocationSettingsPage from "../../components/profile/LocationSettingsPage";
import NotificationsPage from "../../components/profile/NotificationsPage";
import DataPrivacyPage from "../../components/profile/DataPrivacyPage";

import { useAuth } from "../../context/AuthContext";

/* Same palette as ShopScan.jsx — paper #F7F3EA, ink #211C16,
   amber accent #C1701E, hairline rule #DED5C4. Fraunces for the
   wordmark only, matching the headline treatment on Scan. */

const TABS = [
  { key: "home", label: "Dashboard", short: "Home", icon: IconHome, path: "/shop" },
  { key: "scan", label: "Scan Product", short: "Scan", icon: IconCamera, path: "/shop/scan" },
  { key: "batch", label: "Batch Scan", short: "Batch", icon: IconStack, path: "/shop/batch" },
  { key: "history", label: "Scan History", short: "History", icon: IconHistory, path: "/shop/history" },
  { key: "profile", label: "Profile", short: "Profile", icon: IconUser, path: "/shop/profile" },
];

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export default function ShopLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const path = location.pathname.replace(/\/$/, "");
  const active =
    path === "/shop" || path === ""
      ? "home"
      : path.startsWith("/shop/result") || path.startsWith("/shop/history")
      ? "history"
      : TABS.find((t) => t.key !== "home" && path.startsWith(t.path))?.key || "home";

  // Mobile: every route change starts at the top of the page.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F7F3EA] text-[#211C16]">
      {/* =====================================================
          DESKTOP SIDEBAR
      ====================================================== */}
      <aside className="fixed left-0 top-0 bottom-0 hidden lg:flex w-[248px] flex-col bg-[#FBF9F4] border-r border-[#DED5C4] z-40">
        {/* Logo */}
        <div className="h-[88px] px-7 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#C1701E] text-white flex items-center justify-center">
              <IconShieldCheck size={19} stroke={2} />
            </div>
            <div>
              <div
                className="text-[17px] text-[#211C16] leading-none"
                style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600 }}
              >
                SpectraSafe
              </div>
              <div className="text-[10px] text-[#8A8074] mt-1">
                Food Safety Intelligence
              </div>
            </div>
          </div>
        </div>

        {/* Workspace nav */}
        <div className="px-4 mb-5">
          <div className="px-3 mb-2 text-[11px] font-medium text-[#8A8074]">
            Workspace
          </div>

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

                  {tab.key === "scan" && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C1701E]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom sidebar — plain block, no nested card */}
        <div className="mt-auto p-4 pt-4 border-t border-[#DED5C4]">
          <button
            onClick={() => navigate("/shop/profile")}
            className="w-full flex items-center gap-2.5 px-1 py-1 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-[#F3E3D0] text-[#C1701E] flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
              {initials(user?.name)}
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[12.5px] font-semibold truncate">
                {user?.name || "Shopkeeper"}
              </p>
              <p className="text-[11px] text-[#8A8074] truncate">
                {user?.organization || "Retail workspace"}
              </p>
            </div>
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN AREA
      ====================================================== */}
      <main className="lg:ml-[248px] min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 h-14 lg:h-[72px] bg-[#F7F3EA]/90 backdrop-blur-xl border-b border-[#DED5C4] flex items-center justify-between px-5 sm:px-8 lg:px-10">
          <div className="lg:hidden flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#C1701E] text-white flex items-center justify-center">
              <IconShieldCheck size={16} />
            </div>
            <span
              className="text-[15px] text-[#211C16]"
              style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600 }}
            >
              SpectraSafe
            </span>
          </div>

          <div className="hidden lg:block">
            <p className="text-[11px] text-[#8A8074]">Retail workspace</p>
            <p className="text-[14px] font-semibold mt-0.5 text-[#211C16]">
              Product Safety Dashboard
            </p>
          </div>

          {/* User */}
          <button
            onClick={() => navigate("/shop/profile")}
            className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-[#F3E3D0]/30 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#F3E3D0] text-[#C1701E] flex items-center justify-center text-[11px] font-semibold">
              {initials(user?.name)}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[12.5px] font-semibold text-[#211C16]">
                {user?.name || "Shopkeeper"}
              </p>
              <p className="text-[10.5px] text-[#8A8074]">Shopkeeper</p>
            </div>
          </button>
        </header>

        {/* Page */}
        <div className="pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-10">
          <Routes>
            <Route index element={<ShopHome />} />
            <Route path="scan" element={<ShopScan />} />
            <Route path="result/:scanId" element={<ShopResult />} />
            <Route path="batch" element={<ShopBatch />} />
            <Route path="history" element={<ShopHistory />} />
            <Route path="lookup" element={<ShopLookup />} />
            <Route path="lookup/:slug" element={<ShopLookupDetail />} />
            <Route path="profile" element={<ShopProfile />} />
            <Route path="profile/store" element={<StoreDetailsPage backTo="/shop/profile" />} />
            <Route path="profile/location" element={<LocationSettingsPage backTo="/shop/profile" />} />
            <Route path="profile/notifications" element={<NotificationsPage backTo="/shop/profile" />} />
            <Route path="profile/privacy" element={<DataPrivacyPage backTo="/shop/profile" />} />
          </Routes>
        </div>
      </main>

      {/* =====================================================
          MOBILE BOTTOM NAV
      ====================================================== */}
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