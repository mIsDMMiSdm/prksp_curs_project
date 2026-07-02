import type { Order, OrderCreateItem, OrderStatus } from "../types";
import { api } from "./client";

export function fetchOrders(): Promise<Order[]> {
  return api.get<Order[]>("/api/orders/");
}

export function fetchMyOrders(): Promise<Order[]> {
  return api.get<Order[]>("/api/orders/my/");
}

export function createOrder(items: OrderCreateItem[]): Promise<Order> {
  return api.post<Order>("/api/orders/", { items });
}

export function setOrderStatus(id: number, status: OrderStatus): Promise<Order> {
  return api.post<Order>(`/api/orders/${id}/set-status/`, { status });
}

export function cancelOrder(id: number): Promise<Order> {
  return api.post<Order>(`/api/orders/${id}/cancel/`, {});
}
