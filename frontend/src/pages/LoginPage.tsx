import { Link } from "react-router-dom";

export function LoginPage() {
  return (
    <section className="card card-narrow">
      <h1>Вход</h1>
      <p className="muted">Форма входа будет на этапе 10.</p>
      <Link to="/register">Нет аккаунта? Регистрация</Link>
    </section>
  );
}
