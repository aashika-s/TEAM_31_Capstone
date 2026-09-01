import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_HOME = { BRAND: "/brand", SHOPKEEPER: "/shop", FSSAI: "/fssai" };

/** Wrap a route element: redirects to /login if not authenticated, or to
 * the caller's own role-home if they're logged in as the wrong role. */
export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-secondary text-sm">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={ROLE_HOME[user.role]} replace />;
  return children;
}
