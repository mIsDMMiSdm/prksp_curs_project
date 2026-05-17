import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ApiError } from "../api/client";
import { ROLE_OPTIONS } from "../constants/roles";
import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [role, setRole] = useState<UserRole>("employee");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirm) {
      setError("Пароли не совпадают");
      return;
    }

    setSubmitting(true);
    try {
      await register({
        username: username.trim(),
        password,
        password_confirm: passwordConfirm,
        role,
        email: email.trim() || undefined,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Не удалось зарегистрироваться",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card card-narrow">
      <h1>Регистрация</h1>
      <p className="muted">Выберите роль для учебного стенда</p>

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
          <span>Email (необязательно)</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Роль</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            required
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Пароль</span>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        <label className="field">
          <span>Подтверждение пароля</span>
          <input
            type="password"
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            minLength={8}
            required
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Регистрация…" : "Зарегистрироваться"}
        </button>
      </form>

      <p className="form-footer">
        <Link to="/login">Уже есть аккаунт? Войти</Link>
      </p>
    </section>
  );
}
