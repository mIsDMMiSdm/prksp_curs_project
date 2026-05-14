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
        err instanceof ApiError ? err.message : "РќРµ СѓРґР°Р»РѕСЃСЊ РІРѕР№С‚Рё РІ СЃРёСЃС‚РµРјСѓ",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card card-narrow">
      <h1>Р’С…РѕРґ</h1>
      <p className="muted">РЎРёСЃС‚РµРјР° СѓРїСЂР°РІР»РµРЅРёСЏ СЃРєР»Р°РґРѕРј Рё Р·Р°РєР°Р·Р°РјРё</p>

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
          <span>РџР°СЂРѕР»СЊ</span>
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
          {submitting ? "Р’С…РѕРґвЂ¦" : "Р’РѕР№С‚Рё"}
        </button>
      </form>

      <p className="demo-hint muted">
        Р”РµРјРѕ: <code>warehouse1</code>, <code>logistic1</code>, <code>employee1</code>{" "}
        / РїР°СЂРѕР»СЊ <code>demo12345</code>
      </p>
      <p className="form-footer">
        <Link to="/register">РќРµС‚ Р°РєРєР°СѓРЅС‚Р°? Р РµРіРёСЃС‚СЂР°С†РёСЏ</Link>
      </p>
    </section>
  );
}

