// import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
// import ComponentPreview from "./pages/ComponentPreview";

// /**
//  * Route skeleton for now -- only a component-library preview page exists
//  * (this phase's actual deliverable). /shop, /brand, /fssai are stubbed as
//  * placeholders and get replaced with real screens in phases 2-6; they're
//  * here so the routing structure is already in place rather than being
//  * bolted on later.
//  */
// function Placeholder({ role }) {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-bg-tertiary text-text-secondary text-sm">
//       {role} screens land in a later phase — see /preview for the component library.
//     </div>
//   );
// }

// export default function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<ComponentPreview />} />
//         <Route path="/preview" element={<ComponentPreview />} />
//         <Route path="/shop/*" element={<Placeholder role="Shopkeeper" />} />
//         <Route path="/brand/*" element={<Placeholder role="Brand" />} />
//         <Route path="/fssai/*" element={<Placeholder role="FSSAI" />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }


// import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
// import { AuthProvider, useAuth } from "./context/AuthContext";
// import ProtectedRoute from "./components/ProtectedRoute";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import ComponentPreview from "./pages/ComponentPreview";
// import Screen, { ScreenContent } from "./components/Screen";
// import TopBar from "./components/TopBar";
// import Avatar from "./components/Avatar";
// import { ButtonOutline } from "./components/Button";

// function initials(name) {
//   if (!name) return "?";
//   return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
// }

// /**
//  * Real screens for /shop, /brand, /fssai land in phases 3-6. This
//  * placeholder is deliberately NOT static -- it pulls the actual logged-in
//  * user from AuthContext and includes a working logout button, so the
//  * full login -> protected route -> logout -> redirect cycle is something
//  * you can actually click through today, not just code that looks right.
//  */
// function RolePlaceholder({ roleLabel }) {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   return (
//     <Screen>
//       <TopBar title={`${roleLabel} (placeholder)`} right={<Avatar initials={initials(user?.name)} />} />
//       <ScreenContent>
//         <p className="text-sm text-text-primary mb-1">Logged in as {user?.name}</p>
//         <p className="text-xs text-text-secondary mb-4">
//           {user?.email} · {user?.role}
//         </p>
//         <p className="text-xs text-text-secondary mb-4">
//           Real {roleLabel} screens land in a later phase — this confirms
//           auth, routing, and role-scoping are working end to end.
//         </p>
//         <ButtonOutline
//           onClick={() => {
//             logout();
//             navigate("/login");
//           }}
//         >
//           Log out
//         </ButtonOutline>
//       </ScreenContent>
//     </Screen>
//   );
// }

// function AppRoutes() {
//   return (
//     <Routes>
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       <Route path="/preview" element={<ComponentPreview />} />

//       <Route
//         path="/shop/*"
//         element={
//           <ProtectedRoute role="SHOPKEEPER">
//             <RolePlaceholder roleLabel="Shopkeeper" />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/brand/*"
//         element={
//           <ProtectedRoute role="BRAND">
//             <RolePlaceholder roleLabel="Brand" />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/fssai/*"
//         element={
//           <ProtectedRoute role="FSSAI">
//             <RolePlaceholder roleLabel="FSSAI" />
//           </ProtectedRoute>
//         }
//       />

//       <Route path="/" element={<Navigate to="/login" replace />} />
//     </Routes>
//   );
// }

// export default function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <AppRoutes />
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }







// PHASE 2
// import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
// import { AuthProvider, useAuth } from "./context/AuthContext";
// import ProtectedRoute from "./components/ProtectedRoute";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import ComponentPreview from "./pages/ComponentPreview";
// import ShopLayout from "./pages/shop/ShopLayout";
// import Screen, { ScreenContent } from "./components/Screen";
// import TopBar from "./components/TopBar";
// import Avatar from "./components/Avatar";
// import { ButtonOutline } from "./components/Button";

// function initials(name) {
//   if (!name) return "?";
//   return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
// }

// /**
//  * Real screens for /shop, /brand, /fssai land in phases 3-6. This
//  * placeholder is deliberately NOT static -- it pulls the actual logged-in
//  * user from AuthContext and includes a working logout button, so the
//  * full login -> protected route -> logout -> redirect cycle is something
//  * you can actually click through today, not just code that looks right.
//  */
// function RolePlaceholder({ roleLabel }) {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   return (
//     <Screen>
//       <TopBar title={`${roleLabel} (placeholder)`} right={<Avatar initials={initials(user?.name)} />} />
//       <ScreenContent>
//         <p className="text-sm text-text-primary mb-1">Logged in as {user?.name}</p>
//         <p className="text-xs text-text-secondary mb-4">
//           {user?.email} · {user?.role}
//         </p>
//         <p className="text-xs text-text-secondary mb-4">
//           Real {roleLabel} screens land in a later phase — this confirms
//           auth, routing, and role-scoping are working end to end.
//         </p>
//         <ButtonOutline
//           onClick={() => {
//             logout();
//             navigate("/login");
//           }}
//         >
//           Log out
//         </ButtonOutline>
//       </ScreenContent>
//     </Screen>
//   );
// }

// function AppRoutes() {
//   return (
//     <Routes>
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       <Route path="/preview" element={<ComponentPreview />} />

//       <Route
//         path="/shop/*"
//         element={
//           <ProtectedRoute role="SHOPKEEPER">
//             <ShopLayout />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/brand/*"
//         element={
//           <ProtectedRoute role="BRAND">
//             <RolePlaceholder roleLabel="Brand" />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/fssai/*"
//         element={
//           <ProtectedRoute role="FSSAI">
//             <RolePlaceholder roleLabel="FSSAI" />
//           </ProtectedRoute>
//         }
//       />

//       <Route path="/" element={<Navigate to="/login" replace />} />
//     </Routes>
//   );
// }

// export default function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <AppRoutes />
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }








// //PHASE 4
// import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
// import { AuthProvider, useAuth } from "./context/AuthContext";
// import ProtectedRoute from "./components/ProtectedRoute";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import ComponentPreview from "./pages/ComponentPreview";
// import ShopLayout from "./pages/shop/ShopLayout";
// import BrandLayout from "./pages/brand/BrandLayout";
// import Screen, { ScreenContent } from "./components/Screen";
// import TopBar from "./components/TopBar";
// import Avatar from "./components/Avatar";
// import { ButtonOutline } from "./components/Button";

// function initials(name) {
//   if (!name) return "?";
//   return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
// }

// /**
//  * Real screens for /shop, /brand, /fssai land in phases 3-6. This
//  * placeholder is deliberately NOT static -- it pulls the actual logged-in
//  * user from AuthContext and includes a working logout button, so the
//  * full login -> protected route -> logout -> redirect cycle is something
//  * you can actually click through today, not just code that looks right.
//  */
// function RolePlaceholder({ roleLabel }) {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   return (
//     <Screen>
//       <TopBar title={`${roleLabel} (placeholder)`} right={<Avatar initials={initials(user?.name)} />} />
//       <ScreenContent>
//         <p className="text-sm text-text-primary mb-1">Logged in as {user?.name}</p>
//         <p className="text-xs text-text-secondary mb-4">
//           {user?.email} · {user?.role}
//         </p>
//         <p className="text-xs text-text-secondary mb-4">
//           Real {roleLabel} screens land in a later phase — this confirms
//           auth, routing, and role-scoping are working end to end.
//         </p>
//         <ButtonOutline
//           onClick={() => {
//             logout();
//             navigate("/login");
//           }}
//         >
//           Log out
//         </ButtonOutline>
//       </ScreenContent>
//     </Screen>
//   );
// }

// function AppRoutes() {
//   return (
//     <Routes>
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       <Route path="/preview" element={<ComponentPreview />} />

//       <Route
//         path="/shop/*"
//         element={
//           <ProtectedRoute role="SHOPKEEPER">
//             <ShopLayout />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/brand/*"
//         element={
//           <ProtectedRoute role="BRAND">
//             <BrandLayout />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/fssai/*"
//         element={
//           <ProtectedRoute role="FSSAI">
//             <RolePlaceholder roleLabel="FSSAI" />
//           </ProtectedRoute>
//         }
//       />

//       <Route path="/" element={<Navigate to="/login" replace />} />
//     </Routes>
//   );
// }

// export default function App() {
//   return (
//     <BrowserRouter>
//       <AuthProvider>
//         <AppRoutes />
//       </AuthProvider>
//     </BrowserRouter>
//   );
// }






// PHASE 6
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ComponentPreview from "./pages/ComponentPreview";
import ShopLayout from "./pages/shop/ShopLayout";
import BrandLayout from "./pages/brand/BrandLayout";
import FSSAILayout from "./pages/fssai/FSSAILayout";
import Screen, { ScreenContent } from "./components/Screen";
import TopBar from "./components/TopBar";
import Avatar from "./components/Avatar";
import { ButtonOutline } from "./components/Button";


function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

/**
 * Real screens for /shop, /brand, /fssai land in phases 3-6. This
 * placeholder is deliberately NOT static -- it pulls the actual logged-in
 * user from AuthContext and includes a working logout button, so the
 * full login -> protected route -> logout -> redirect cycle is something
 * you can actually click through today, not just code that looks right.
 */
function RolePlaceholder({ roleLabel }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <Screen>
      <TopBar title={`${roleLabel} (placeholder)`} right={<Avatar initials={initials(user?.name)} />} />
      <ScreenContent>
        <p className="text-sm text-text-primary mb-1">Logged in as {user?.name}</p>
        <p className="text-xs text-text-secondary mb-4">
          {user?.email} · {user?.role}
        </p>
        <p className="text-xs text-text-secondary mb-4">
          Real {roleLabel} screens land in a later phase — this confirms
          auth, routing, and role-scoping are working end to end.
        </p>
        <ButtonOutline
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Log out
        </ButtonOutline>
      </ScreenContent>
    </Screen>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/preview" element={<ComponentPreview />} />


      <Route
        path="/shop/*"
        element={
          <ProtectedRoute role="SHOPKEEPER">
            <ShopLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/brand/*"
        element={
          <ProtectedRoute role="BRAND">
            <BrandLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fssai/*"
        element={
          <ProtectedRoute role="FSSAI">
            <FSSAILayout />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}