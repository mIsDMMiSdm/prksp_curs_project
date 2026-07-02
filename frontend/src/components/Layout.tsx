import { NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getNavItemsForRole } from "../utils/navigation";

export function Layout() {
  const { user, logout } = useAuth();
  const navItems = user ? getNavItemsForRole(user.role) : [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">WMS</span>
          <span className="brand-text">Склад и заказы</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="user-name">{user?.username}</span>
            <span className="user-role">{user?.role_display}</span>
          </div>
          <button type="button" className="btn-ghost" onClick={logout}>
            Выйти
          </button>
        </div>
      </aside>
      <div className="app-content">
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
