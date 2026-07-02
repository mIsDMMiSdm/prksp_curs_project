import type { Product } from "../types";
import { api } from "./client";

export function fetchProducts(inStockOnly = false): Promise<Product[]> {
  const path = inStockOnly ? "/api/products/?in_stock=1" : "/api/products/";
  return api.get<Product[]>(path);
}

export function createProduct(data: Partial<Product>): Promise<Product> {
  return api.post<Product>("/api/products/", data);
}

export function updateProduct(
  id: number,
  data: Partial<Product>,
): Promise<Product> {
  return api.patch<Product>(`/api/products/${id}/`, data);
}

export function deleteProduct(id: number): Promise<void> {
  return api.delete(`/api/products/${id}/`);
}

export function adjustStock(id: number, delta: number): Promise<Product> {
  return api.post<Product>(`/api/products/${id}/adjust-stock/`, { delta });
}

export function setProductQuantity(
  id: number,
  quantity: number,
): Promise<Product> {
  return api.post<Product>(`/api/products/${id}/set-quantity/`, { quantity });
}
