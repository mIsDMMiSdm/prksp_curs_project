export type UserRole = "warehouse_manager" | "logistic" | "employee";

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  role_display: string;
  first_name: string;
  last_name: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  password_confirm: string;
  role: UserRole;
  email?: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  price: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: string | null;
}

export type OrderStatus = "new" | "in_progress" | "shipped" | "cancelled";

export interface Order {
  id: number;
  user: number;
  username: string;
  status: OrderStatus;
  status_display: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderCreateItem {
  product_id: number;
  quantity: number;
}
