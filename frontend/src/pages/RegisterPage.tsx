import { Link } from "react-router-dom";

export function RegisterPage() {
  return (
    <section className="card card-narrow">
      <h1>Регистрация</h1>
      <p className="muted">Форма с выбором роли будет на этапе 10.</p>
      <Link to="/login">Уже есть аккаунт? Войти</Link>
    </section>
  );
}
