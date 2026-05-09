const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data: unknown = null) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (typeof obj.detail === "string") return obj.detail;
    const firstKey = Object.keys(obj)[0];
    const val = obj[firstKey];
    if (Array.isArray(val) && val.length) return String(val[0]);
    if (typeof val === "string") return val;
  }
  return fallback;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await parseBody(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      errorMessage(data, response.statusText),
      data,
    );
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, auth = true) =>
    apiRequest<T>(path, { method: "GET" }, auth),
  post: <T>(path: string, body?: unknown, auth = true) =>
    apiRequest<T>(
      path,
      { method: "POST", body: body ? JSON.stringify(body) : undefined },
      auth,
    ),
  patch: <T>(path: string, body: unknown, auth = true) =>
    apiRequest<T>(
      path,
      { method: "PATCH", body: JSON.stringify(body) },
      auth,
    ),
  delete: <T>(path: string, auth = true) =>
    apiRequest<T>(path, { method: "DELETE" }, auth),
};

export { API_URL };
