import type { LoginResponse, RegisterPayload, User } from "../types";
import { api, clearTokens, setTokens } from "./client";

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  const tokens = await api.post<LoginResponse>(
    "/api/auth/login/",
    { username, password },
    false,
  );
  setTokens(tokens.access, tokens.refresh);
  return tokens;
}

export async function register(payload: RegisterPayload): Promise<User> {
  return api.post<User>("/api/auth/register/", payload, false);
}

export async function fetchCurrentUser(): Promise<User> {
  return api.get<User>("/api/auth/me/");
}

export function logout(): void {
  clearTokens();
}
