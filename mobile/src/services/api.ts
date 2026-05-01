import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { ApiError } from "@/src/types";

/**
 * `localhost` telefonun kendisini gösterir. Geliştirme sırasında telefon →
 * dev bilgisayarına ulaşabilmesi için Expo'nun `hostUri`sinden LAN IP'sini
 * alıp `localhost`u onunla değiştiriyoruz. (Sadece native cihazlar için;
 * Web tarayıcı zaten dev bilgisayardan açıldığı için localhost çalışır.)
 */
function resolveApiUrl(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

  if (Platform.OS === "web") return raw;
  if (!/localhost|127\.0\.0\.1/.test(raw)) return raw;

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    Constants.manifest2?.extra?.expoGo?.debuggerHost ??
    "";
  const lanHost = hostUri.split(":")[0];

  if (!lanHost) return raw;

  return raw.replace(/(localhost|127\.0\.0\.1)/, lanHost);
}

export const API_URL = resolveApiUrl();
const TIMEOUT = Number(process.env.EXPO_PUBLIC_API_TIMEOUT ?? 10000);

export const TOKEN_KEY = "resq_access_token";

if (__DEV__) {
  console.log("[RESQ] API base URL:", API_URL);
}

export const api = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Normalize error responses
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const status = error.response?.status;
    const path = error.config?.url ?? "";
    const method = (error.config?.method ?? "GET").toUpperCase();

    let detail: string;
    if (status) {
      const raw = error.response?.data?.detail;
      // FastAPI string ya da array detail dondurur.
      if (Array.isArray(raw)) {
        detail = raw
          .map((d) =>
            typeof d === "object" && d && "msg" in d
              ? String((d as { msg: unknown }).msg)
              : String(d)
          )
          .join(", ");
      } else if (typeof raw === "string") {
        detail = raw;
      } else if (status === 404 && __DEV__) {
        detail = `Endpoint bulunamadı: ${method} ${API_URL}${path}`;
      } else if (status === 404) {
        detail = "İstenen kaynak bulunamadı";
      } else {
        detail = `Sunucu hatası (${status})`;
      }
    } else if (error.code === "ECONNABORTED") {
      detail = "İstek zaman aşımına uğradı. Bağlantınızı kontrol edin.";
    } else {
      detail = `Sunucuya ulaşılamıyor. (${API_URL})`;
    }

    if (status === 401) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }

    if (__DEV__ && status && status >= 400) {
      console.warn(`[API] ${method} ${path} → ${status}`, detail);
    }

    return Promise.reject(new AppError(detail, status));
  }
);

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AppError";
  }

  get isNetworkError() {
    return !this.statusCode;
  }

  get isUnauthorized() {
    return this.statusCode === 401;
  }

  get isNotFound() {
    return this.statusCode === 404;
  }

  get isRateLimited() {
    return this.statusCode === 429;
  }
}
