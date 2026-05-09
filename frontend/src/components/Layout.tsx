import { Link, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="logo">
          Склад и заказы
        </Link>
        {user && (
          <div className="header-meta">
            <span>
              {user.username} · {user.role_display}
            </span>
            <button type="button" className="btn-secondary" onClick={logout}>
              Выйти
            </button>
          </div>
        )}
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
