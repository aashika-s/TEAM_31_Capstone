// import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
// import { IconHome, IconFlag, IconBuildingFactory2, IconUser } from "@tabler/icons-react";
// import Screen from "../../components/Screen";
// import TabBar from "../../components/TabBar";
// import FSSAIHome from "./FSSAIHome";
// import FSSAIFlagged from "./FSSAIFlagged";
// import FSSAIFlagDetail from "./FSSAIFlagDetail";

// const TABS = [
//   { key: "home", label: "Home", icon: IconHome, path: "/fssai" },
//   { key: "flagged", label: "Flagged", icon: IconFlag, path: "/fssai/flagged" },
//   { key: "manufacturers", label: "Mfrs", icon: IconBuildingFactory2, path: "/fssai/manufacturers" },
//   { key: "profile", label: "Profile", icon: IconUser, path: "/fssai/profile" },
// ];

// function ComingSoon({ label }) {
//   return <div className="p-4 text-sm text-text-secondary">{label} lands in a later phase.</div>;
// }

// /**
//  * The wireframe's FSSAI role also has a Manufacturer tracker, formal
//  * Notices (with PDF generation), and a violation Heatmap. None of those
//  * are here yet -- Manufacturers needs a backend change (product/batch
//  * endpoints are currently BRAND-only and scoped to the caller's own
//  * data; FSSAI has no read access to the registry at all yet), Notices
//  * needs a new model, and Heatmap needs geolocation data that nothing
//  * currently captures on a scan. What IS here -- Flagged products, backed
//  * by the real Flag model with FSSAI-only status updates -- is real and
//  * tested.
//  */
// export default function FSSAILayout() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const active =
//     TABS.find(
//       (t) =>
//         location.pathname === t.path ||
//         (t.key === "home" && location.pathname === "/fssai") ||
//         (t.key === "flagged" && location.pathname.startsWith("/fssai/flagged"))
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
//         <Route index element={<FSSAIHome />} />
//         <Route path="flagged" element={<FSSAIFlagged />} />
//         <Route path="flagged/:flagId" element={<FSSAIFlagDetail />} />
//         <Route path="manufacturers" element={<ComingSoon label="Manufacturer tracking" />} />
//         <Route path="profile" element={<ComingSoon label="Profile" />} />
//       </Routes>
//     </Screen>
//   );
// }















// import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
// import { IconHome, IconFlag, IconBuildingFactory2, IconUser } from "@tabler/icons-react";
// import Screen from "../../components/Screen";
// import TabBar from "../../components/TabBar";
// import FSSAIHome from "./FSSAIHome";
// import FSSAIFlagged from "./FSSAIFlagged";
// import FSSAIFlagDetail from "./FSSAIFlagDetail";
// import FSSAIManufacturers from "./FSSAIManufacturers";
// import FSSAIManufacturerProducts from "./FSSAIManufacturerProducts";
// import FSSAIProductDetail from "./FSSAIProductDetail";

// const TABS = [
//   { key: "home", label: "Home", icon: IconHome, path: "/fssai" },
//   { key: "flagged", label: "Flagged", icon: IconFlag, path: "/fssai/flagged" },
//   { key: "manufacturers", label: "Mfrs", icon: IconBuildingFactory2, path: "/fssai/manufacturers" },
//   { key: "profile", label: "Profile", icon: IconUser, path: "/fssai/profile" },
// ];

// function ComingSoon({ label }) {
//   return <div className="p-4 text-sm text-text-secondary">{label} lands in a later phase.</div>;
// }

// /**
//  * Manufacturers is now real: products.py grants FSSAI read-only access to
//  * the full product registry (previously BRAND-only, scoped to the
//  * caller's own data) -- tested for cross-brand isolation, FSSAI seeing
//  * everything, and FSSAI still being blocked from creating/modifying
//  * anything. Notices (with PDF generation) and the violation Heatmap are
//  * still not here -- Notices needs a new model, Heatmap needs geolocation
//  * data that nothing currently captures on a scan. Both are real backend
//  * gaps, not just missing screens.
//  */
// export default function FSSAILayout() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const active =
//     TABS.find(
//       (t) =>
//         location.pathname === t.path ||
//         (t.key === "home" && location.pathname === "/fssai") ||
//         (t.key === "flagged" && location.pathname.startsWith("/fssai/flagged")) ||
//         (t.key === "manufacturers" &&
//           (location.pathname.startsWith("/fssai/manufacturers") || location.pathname.startsWith("/fssai/products")))
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
//         <Route index element={<FSSAIHome />} />
//         <Route path="flagged" element={<FSSAIFlagged />} />
//         <Route path="flagged/:flagId" element={<FSSAIFlagDetail />} />
//         <Route path="manufacturers" element={<FSSAIManufacturers />} />
//         <Route path="manufacturers/:manufacturerName" element={<FSSAIManufacturerProducts />} />
//         <Route path="products/:productId" element={<FSSAIProductDetail />} />
//         <Route path="profile" element={<ComingSoon label="Profile" />} />
//       </Routes>
//     </Screen>
//   );
// }






// import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
// import { IconHome, IconFlag, IconBuildingFactory2, IconUser, IconMap } from "@tabler/icons-react";
// import Screen from "../../components/Screen";
// import TabBar from "../../components/TabBar";
// import FSSAIHome from "./FSSAIHome";
// import FSSAIFlagged from "./FSSAIFlagged";
// import FSSAIFlagDetail from "./FSSAIFlagDetail";
// import FSSAIManufacturers from "./FSSAIManufacturers";
// import FSSAIManufacturerProducts from "./FSSAIManufacturerProducts";
// import FSSAIProductDetail from "./FSSAIProductDetail";
// import FSSAIHeatmap from "./FSSAIHeatmap";
// import FSSAINoticeNew from "./FSSAINoticeNew";
// import FSSAIProfile from "./FSSAIProfile";

// const TABS = [
//   { key: "home", label: "Home", icon: IconHome, path: "/fssai" },
//   { key: "flagged", label: "Flagged", icon: IconFlag, path: "/fssai/flagged" },
//   { key: "manufacturers", label: "Mfrs", icon: IconBuildingFactory2, path: "/fssai/manufacturers" },
//   { key: "heatmap", label: "Heatmap", icon: IconMap, path: "/fssai/heatmap" },
//   { key: "profile", label: "Profile", icon: IconUser, path: "/fssai/profile" },
// ];

// function ComingSoon({ label }) {
//   return <div className="p-4 text-sm text-text-secondary">{label} lands in a later phase.</div>;
// }

// export default function FSSAILayout() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const active =
//     TABS.find(
//       (t) =>
//         location.pathname === t.path ||
//         (t.key === "home" && location.pathname === "/fssai") ||
//         (t.key === "flagged" && location.pathname.startsWith("/fssai/flagged")) ||
//         (t.key === "manufacturers" &&
//           (location.pathname.startsWith("/fssai/manufacturers") || location.pathname.startsWith("/fssai/products"))) ||
//         (t.key === "heatmap" && location.pathname.startsWith("/fssai/heatmap"))
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
//         <Route index element={<FSSAIHome />} />
//         <Route path="flagged" element={<FSSAIFlagged />} />
//         <Route path="flagged/:flagId" element={<FSSAIFlagDetail />} />
//         <Route path="manufacturers" element={<FSSAIManufacturers />} />
//         <Route path="manufacturers/:manufacturerName" element={<FSSAIManufacturerProducts />} />
//         <Route path="products/:productId" element={<FSSAIProductDetail />} />
//         <Route path="heatmap" element={<FSSAIHeatmap />} />
//         <Route path="notice/new" element={<FSSAINoticeNew />} />
//         <Route path="profile" element={<FSSAIProfile />} />
//       </Routes>
//     </Screen>
//   );
// }
















import { Routes, Route, useNavigate, useLocation } from "react-router-dom";

import {
  IconHome,
  IconFlag,
  IconBuildingFactory2,
  IconUser,
  IconMap,
} from "@tabler/icons-react";

import Screen from "../../components/Screen";
import TabBar from "../../components/TabBar";

import FSSAIHome from "./FSSAIHome";
import FSSAIFlagged from "./FSSAIFlagged";
import FSSAIFlagDetail from "./FSSAIFlagDetail";
import FSSAIManufacturers from "./FSSAIManufacturers";
import FSSAIManufacturerProducts from "./FSSAIManufacturerProducts";
import FSSAIProductDetail from "./FSSAIProductDetail";
import FSSAIHeatmap from "./FSSAIHeatmap";
import FSSAINoticeNew from "./FSSAINoticeNew";
import FSSAIProfile from "./FSSAIProfile";

const TABS = [
  {
    key: "home",
    label: "Home",
    icon: IconHome,
    path: "/fssai",
  },
  {
    key: "flagged",
    label: "Flagged",
    icon: IconFlag,
    path: "/fssai/flagged",
  },
  {
    key: "manufacturers",
    label: "Mfrs",
    icon: IconBuildingFactory2,
    path: "/fssai/manufacturers",
  },
  {
    key: "heatmap",
    label: "Heatmap",
    icon: IconMap,
    path: "/fssai/heatmap",
  },
  {
    key: "profile",
    label: "Profile",
    icon: IconUser,
    path: "/fssai/profile",
  },
];

export default function FSSAILayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const active =
    TABS.find(
      (t) =>
        location.pathname === t.path ||
        (t.key === "home" &&
          location.pathname === "/fssai") ||
        (t.key === "flagged" &&
          location.pathname.startsWith("/fssai/flagged")) ||
        (t.key === "manufacturers" &&
          (
            location.pathname.startsWith("/fssai/manufacturers") ||
            location.pathname.startsWith("/fssai/products")
          )) ||
        (t.key === "heatmap" &&
          location.pathname.startsWith("/fssai/heatmap"))
    )?.key || "home";

  return (
    <Screen
      tabBar={
        <TabBar
          items={TABS}
          active={active}
          onChange={(key) => {
            const tab = TABS.find((t) => t.key === key);

            if (tab) {
              navigate(tab.path);
            }
          }}
        />
      }
    >
      <Routes>

        <Route
          index
          element={<FSSAIHome />}
        />

        <Route
          path="flagged"
          element={<FSSAIFlagged />}
        />

        <Route
          path="flagged/:flagId"
          element={<FSSAIFlagDetail />}
        />

        <Route
          path="manufacturers"
          element={<FSSAIManufacturers />}
        />

        <Route
          path="manufacturers/:manufacturerName"
          element={<FSSAIManufacturerProducts />}
        />

        <Route
          path="products/:productId"
          element={<FSSAIProductDetail />}
        />

        <Route
          path="heatmap"
          element={<FSSAIHeatmap />}
        />

        <Route
          path="notice/new"
          element={<FSSAINoticeNew />}
        />

        <Route
          path="profile"
          element={<FSSAIProfile />}
        />

      </Routes>
    </Screen>
  );
}