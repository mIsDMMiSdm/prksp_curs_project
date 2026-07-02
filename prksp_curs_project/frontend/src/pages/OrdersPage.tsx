import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ApiError } from "../api/client";
import { cancelOrder, fetchOrders, setOrderStatus } from "../api/orders";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import {
  LOGISTIC_STATUS_OPTIONS,
  ORDER_STATUS_LABELS,
} from "../constants/orderStatus";
import { useAuth } from "../context/AuthContext";
import type { Order, OrderStatus } from "../types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function OrdersPage() {
  const { user } = useAuth();
  const isLogistic = user?.role === "logistic";
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await fetchOrders());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatus(id: number, status: OrderStatus) {
    setMessage(null);
    setError(null);
    try {
      await setOrderStatus(id, status);
      setMessage("Статус обновлён");
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Ошибка");
    }
  }

  async function handleCancel(id: number) {
    if (!confirm("Отменить заказ? Остатки будут возвращены на склад.")) return;
    try {
      await cancelOrder(id);
      setMessage("Заказ отменён");
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Ошибка отмены");
    }
  }

  return (
    <div>
      <PageHeader
        title={isLogistic ? "Заказы" : "Мои заказы"}
        description={
          isLogistic
            ? "Все заказы предприятия"
            : "Оформленные вами заявки"
        }
        actions={
          user?.role === "employee" ? (
            <Link to="/orders/new" className="btn-primary">
              Новый заказ
            </Link>
          ) : undefined
        }
      />

      {message && <p className="alert alert-success">{message}</p>}
      {error && <p className="alert alert-error">{error}</p>}

      <section className="panel">
        {loading ? (
          <p className="muted">Загрузка…</p>
        ) : orders.length === 0 ? (
          <p className="empty muted">Заказов пока нет</p>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <article key={order.id} className="order-card">
                <header className="order-card-header">
                  <div className="order-card-title">
                    <span className="order-id">№ {order.id}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <span className="order-meta muted">
                    {order.username} · {formatDate(order.created_at)}
                  </span>
                </header>
                <table className="data-table data-table-compact">
                  <thead>
                    <tr>
                      <th>Товар</th>
                      <th>Артикул</th>
                      <th>Кол-во</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.product_name}</td>
                        <td>{item.product_sku || "—"}</td>
                        <td>{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {isLogistic && order.status !== "cancelled" && order.status !== "shipped" && (
                  <footer className="order-card-footer">
                    <label className="field field-inline">
                      <span>Статус</span>
                      <select
                        defaultValue={order.status}
                        onChange={(e) =>
                          handleStatus(order.id, e.target.value as OrderStatus)
                        }
                      >
                        {LOGISTIC_STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {ORDER_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      className="btn-danger btn-sm"
                      onClick={() => handleCancel(order.id)}
                    >
                      Отменить
                    </button>
                  </footer>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
