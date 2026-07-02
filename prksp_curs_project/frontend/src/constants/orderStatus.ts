import type { OrderStatus } from "../types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Новый",
  in_progress: "В обработке",
  shipped: "Отгружен",
  cancelled: "Отменён",
};

export const LOGISTIC_STATUS_OPTIONS: OrderStatus[] = [
  "new",
  "in_progress",
  "shipped",
  "cancelled",
];
