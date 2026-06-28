import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Не удалось войти в систему",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card card-narrow">
      <h1>Вход</h1>
      <p className="muted">Система управления складом и заказами</p>

      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Логин</span>
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Пароль</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Вход…" : "Войти"}
        </button>
      </form>

      <p className="demo-hint muted">
        Демо: <code>warehouse1</code>, <code>logistic1</code>, <code>employee1</code>{" "}
        / пароль <code>demo12345</code>
      </p>
      <p className="form-footer">
        <Link to="/register">Нет аккаунта? Регистрация</Link>
      </p>
    </section>
  );
}
