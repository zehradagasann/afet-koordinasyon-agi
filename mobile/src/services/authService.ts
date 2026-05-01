import * as SecureStore from "expo-secure-store";
import { api, TOKEN_KEY } from "./api";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/src/types";

const AUTH_PATHS = {
  login: "/auth/login",
  register: "/auth/register",
  me: "/auth/me",
} as const;

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(AUTH_PATHS.login, data);
    const payload = response.data;
    await SecureStore.setItemAsync(TOKEN_KEY, payload.access_token);
    return payload;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(AUTH_PATHS.register, data);
    const payload = response.data;
    await SecureStore.setItemAsync(TOKEN_KEY, payload.access_token);
    return payload;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>(AUTH_PATHS.me);
    return response.data;
  },

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  async getStoredToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
};
