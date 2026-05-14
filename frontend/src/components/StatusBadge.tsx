import { ORDER_STATUS_LABELS } from "../constants/orderStatus";
import type { OrderStatus } from "../types";

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`status-badge status-${status}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

