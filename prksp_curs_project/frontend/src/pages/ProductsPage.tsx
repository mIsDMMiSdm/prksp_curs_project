import { useCallback, useEffect, useState, type FormEvent } from "react";

import {
  adjustStock,
  createProduct,
  deleteProduct,
  fetchProducts,
} from "../api/products";
import { ApiError } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import type { Product } from "../types";

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [price, setPrice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await fetchProducts());
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await createProduct({
        name: name.trim(),
        sku: sku.trim(),
        quantity: Number(quantity) || 0,
        price: price ? price : null,
      });
      setName("");
      setSku("");
      setQuantity("0");
      setPrice("");
      setMessage("Товар добавлен");
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Ошибка создания");
    }
  }

  async function handleAdjust(id: number, delta: number) {
    setMessage(null);
    setError(null);
    try {
      await adjustStock(id, delta);
      setMessage(delta > 0 ? "Приход оформлен" : "Расход оформлен");
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Ошибка остатка");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Удалить товар?")) return;
    try {
      await deleteProduct(id);
      setMessage("Товар удалён");
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Ошибка удаления");
    }
  }

  return (
    <div>
      <PageHeader
        title="Товары"
        description="Справочник номенклатуры и остатков на складе"
      />

      {message && <p className="alert alert-success">{message}</p>}
      {error && <p className="alert alert-error">{error}</p>}

      <section className="panel">
        <h2 className="panel-title">Новый товар</h2>
        <form className="form form-grid" onSubmit={handleCreate}>
          <label className="field">
            <span>Наименование</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label className="field">
            <span>Артикул</span>
            <input value={sku} onChange={(e) => setSku(e.target.value)} />
          </label>
          <label className="field">
            <span>Остаток</span>
            <input
              type="number"
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </label>
          <label className="field">
            <span>Цена</span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Добавить
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <h2 className="panel-title">Список</h2>
        {loading ? (
          <p className="muted">Загрузка…</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Наименование</th>
                  <th>Артикул</th>
                  <th>Остаток</th>
                  <th>Цена</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <ProductRow
                    key={p.id}
                    product={p}
                    onAdjust={handleAdjust}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <p className="empty muted">Нет товаров</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function ProductRow({
  product,
  onAdjust,
  onDelete,
}: {
  product: Product;
  onAdjust: (id: number, delta: number) => void;
  onDelete: (id: number) => void;
}) {
  const [delta, setDelta] = useState("1");

  return (
    <tr>
      <td>{product.name}</td>
      <td>{product.sku || "—"}</td>
      <td>
        <strong>{product.quantity}</strong>
      </td>
      <td>{product.price ?? "—"}</td>
      <td className="actions-cell">
        <div className="inline-actions">
          <input
            type="number"
            className="input-sm"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            min={1}
          />
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => onAdjust(product.id, Number(delta) || 1)}
          >
            +
          </button>
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => onAdjust(product.id, -(Number(delta) || 1))}
          >
            −
          </button>
          <button
            type="button"
            className="btn-danger btn-sm"
            onClick={() => onDelete(product.id)}
          >
            Удал.
          </button>
        </div>
      </td>
    </tr>
  );
}
