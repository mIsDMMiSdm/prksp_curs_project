import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export function HomePage() {
  const { user } = useAuth();

  return (
    <section className="card">
      <h1>Добро пожаловать</h1>
      <p className="muted">
        Система управления складом и заказами. Вы вошли как{" "}
        <strong>{user?.username}</strong> ({user?.role_display}).
      </p>
      <p className="muted">
        На следующих этапах здесь появятся экраны товаров и заказов в
        зависимости от роли.
      </p>
      <nav className="inline-links">
        <Link to="/login">Вход</Link>
        <Link to="/register">Регистрация</Link>
      </nav>
    </section>
  );
}
