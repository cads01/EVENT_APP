// components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles, adminOnly }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  // Support both old adminOnly prop and new roles array
  if (adminOnly && user.role !== "admin")
    return <Navigate to="/" replace />;

  if (roles && !roles.includes(user.role))
    return <Navigate to="/" replace />;

  return children;
}
