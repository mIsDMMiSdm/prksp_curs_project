import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { ApiError } from "../api/client";
import { createOrder } from "../api/orders";
import { fetchProducts } from "../api/products";
import { PageHeader } from "../components/PageHeader";
import type { OrderCreateItem, Product } from "../types";

interface CartLine extends OrderCreateItem {
  name: string;
  sku: string;
  available: number;
}

export function OrderCreatePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await fetchProducts(true));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Ошибка загрузки товаров");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function addToCart(product: Product, qty: number) {
    if (qty < 1 || qty > product.quantity) {
      setError(`Доступно только ${product.quantity} шт.`);
      return;
    }
    setError(null);
    setCart((prev) => {
      const existing = prev.find((l) => l.product_id === product.id);
      if (existing) {
        const newQty = existing.quantity + qty;
        if (newQty > product.quantity) {
          setError(`Доступно только ${product.quantity} шт.`);
          return prev;
        }
        return prev.map((l) =>
          l.product_id === product.id ? { ...l, quantity: newQty } : l,
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          quantity: qty,
          name: product.name,
          sku: product.sku,
          available: product.quantity,
        },
      ];
    });
  }

  function removeLine(productId: number) {
    setCart((prev) => prev.filter((l) => l.product_id !== productId));
  }

  async function submitOrder() {
    if (cart.length === 0) {
      setError("Добавьте позиции в заказ");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await createOrder(
        cart.map(({ product_id, quantity }) => ({ product_id, quantity })),
      );
      navigate("/orders", { replace: true });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Не удалось создать заказ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Новый заказ"
        description="Остаток списывается при оформлении"
        actions={
          <Link to="/orders" className="btn-secondary">
            К списку
          </Link>
        }
      />

      {error && <p className="alert alert-error">{error}</p>}

      <div className="split-layout">
        <section className="panel">
          <h2 className="panel-title">Каталог (в наличии)</h2>
          {loading ? (
            <p className="muted">Загрузка…</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Товар</th>
                    <th>Остаток</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <CatalogRow key={p.id} product={p} onAdd={addToCart} />
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <p className="empty muted">Нет товаров в наличии</p>
              )}
            </div>
          )}
        </section>

        <section className="panel panel-accent">
          <h2 className="panel-title">Корзина</h2>
          {cart.length === 0 ? (
            <p className="muted">Позиции не выбраны</p>
          ) : (
            <>
              <ul className="cart-list">
                {cart.map((line) => (
                  <li key={line.product_id} className="cart-item">
                    <div>
                      <strong>{line.name}</strong>
                      <span className="muted"> · {line.quantity} шт.</span>
                    </div>
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      onClick={() => removeLine(line.product_id)}
                    >
                      Убрать
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="btn-primary btn-block"
                disabled={submitting}
                onClick={submitOrder}
              >
                {submitting ? "Оформление…" : "Оформить заказ"}
              </button>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function CatalogRow({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (p: Product, qty: number) => void;
}) {
  const [qty, setQty] = useState("1");

  return (
    <tr>
      <td>
        {product.name}
        {product.sku && (
          <span className="muted table-sub"> {product.sku}</span>
        )}
      </td>
      <td>{product.quantity}</td>
      <td className="actions-cell">
        <div className="inline-actions">
          <input
            type="number"
            className="input-sm"
            min={1}
            max={product.quantity}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => onAdd(product, Number(qty) || 1)}
          >
            В заказ
          </button>
        </div>
      </td>
    </tr>
  );
}
