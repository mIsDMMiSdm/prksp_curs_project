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
      setError("РџР°СЂРѕР»Рё РЅРµ СЃРѕРІРїР°РґР°СЋС‚");
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
          : "РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°С‚СЊСЃСЏ",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card card-narrow">
      <h1>Р РµРіРёСЃС‚СЂР°С†РёСЏ</h1>
      <p className="muted">Р’С‹Р±РµСЂРёС‚Рµ СЂРѕР»СЊ РґР»СЏ СѓС‡РµР±РЅРѕРіРѕ СЃС‚РµРЅРґР°</p>

      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Р›РѕРіРёРЅ</span>
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Email (РЅРµРѕР±СЏР·Р°С‚РµР»СЊРЅРѕ)</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Р РѕР»СЊ</span>
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
          <span>РџР°СЂРѕР»СЊ</span>
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
          <span>РџРѕРґС‚РІРµСЂР¶РґРµРЅРёРµ РїР°СЂРѕР»СЏ</span>
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
          {submitting ? "Р РµРіРёСЃС‚СЂР°С†РёСЏвЂ¦" : "Р—Р°СЂРµРіРёСЃС‚СЂРёСЂРѕРІР°С‚СЊСЃСЏ"}
        </button>
      </form>

      <p className="form-footer">
        <Link to="/login">РЈР¶Рµ РµСЃС‚СЊ Р°РєРєР°СѓРЅС‚? Р’РѕР№С‚Рё</Link>
      </p>
    </section>
  );
}

