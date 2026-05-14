import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export function HomePage() {
  const { user } = useAuth();
  if (!user) return null;

  const cards =
    user.role === "warehouse_manager"
      ? [
          {
            title: "Товары",
            text: "Учёт номенклатуры, остатков, приход и расход.",
            to: "/products",
          },
        ]
      : user.role === "logistic"
        ? [
            {
              title: "Заказы",
              text: "Все заказы предприятия, смена статусов и отмена.",
              to: "/orders",
            },
          ]
        : [
            {
              title: "Мои заказы",
              text: "Список оформленных заявок и их статусы.",
              to: "/orders",
            },
            {
              title: "Новый заказ",
              text: "Оформление заказа с несколькими позициями.",
              to: "/orders/new",
            },
          ];

  return (
    <div>
      <header className="page-header">
        <div>
          <h1>Обзор</h1>
          <p className="muted">
            {user.role_display} · {user.username}
          </p>
        </div>
      </header>
      <div className="dashboard-grid">
        {cards.map((card) => (
          <Link key={card.to} to={card.to} className="dashboard-card">
            <h2>{card.title}</h2>
            <p>{card.text}</p>
            <span className="dashboard-link">Перейти</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
