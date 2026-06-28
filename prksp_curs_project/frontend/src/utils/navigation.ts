import type { UserRole } from "../types";

export interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

export function getNavItemsForRole(role: UserRole): NavItem[] {
  const overview: NavItem = { to: "/", label: "Обзор", end: true };

  switch (role) {
    case "warehouse_manager":
      return [overview, { to: "/products", label: "Товары" }];
    case "logistic":
      return [overview, { to: "/orders", label: "Заказы" }];
    case "employee":
      return [
        overview,
        { to: "/orders", label: "Мои заказы" },
        { to: "/orders/new", label: "Новый заказ" },
      ];
    default:
      return [overview];
  }
}
