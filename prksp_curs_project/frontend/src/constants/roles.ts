import type { UserRole } from "../types";

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "warehouse_manager", label: "Менеджер склада" },
  { value: "logistic", label: "Логист" },
  { value: "employee", label: "Сотрудник" },
];
