import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-page">
        <p className="muted">Загрузка…</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="auth-page">
      <Outlet />
    </div>
  );
}

