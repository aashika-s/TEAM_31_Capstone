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
















import {
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  IconHome,
  IconPackage,
  IconPlus,
  IconUser,
} from "@tabler/icons-react";

import Screen from "../../components/Screen";
import TabBar from "../../components/TabBar";

import BrandHome from "./BrandHome";
import BrandProducts from "./BrandProducts";
import BrandProductDetail from "./BrandProductDetail";
import BrandProductNew from "./BrandProductNew";
import BrandProfile from "./BrandProfile";

const TABS = [
  {
    key: "home",
    label: "Home",
    icon: IconHome,
    path: "/brand",
  },
  {
    key: "products",
    label: "Products",
    icon: IconPackage,
    path: "/brand/products",
  },
  {
    key: "new",
    label: "Register",
    icon: IconPlus,
    path: "/brand/products/new",
  },
  {
    key: "profile",
    label: "Profile",
    icon: IconUser,
    path: "/brand/profile",
  },
];

export default function BrandLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const active =
    TABS.find((tab) => {
      if (tab.key === "home") {
        return location.pathname === "/brand";
      }

      if (tab.key === "products") {
        return (
          location.pathname.startsWith("/brand/products") &&
          location.pathname !== "/brand/products/new"
        );
      }

      return location.pathname === tab.path;
    })?.key || "home";

  function handleTabChange(key) {
    const tab = TABS.find((item) => item.key === key);

    if (tab) {
      navigate(tab.path);
    }
  }

  return (
    <Screen
      tabBar={
        <TabBar
          items={TABS}
          active={active}
          onChange={handleTabChange}
        />
      }
    >
      <Routes>

        <Route
          index
          element={<BrandHome />}
        />

        <Route
          path="products"
          element={<BrandProducts />}
        />

        <Route
          path="products/new"
          element={<BrandProductNew />}
        />

        <Route
          path="products/:productId"
          element={<BrandProductDetail />}
        />

        <Route
          path="profile"
          element={<BrandProfile />}
        />

      </Routes>
    </Screen>
  );
}