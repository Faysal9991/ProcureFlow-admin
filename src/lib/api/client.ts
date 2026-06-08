import axios, { AxiosError } from "axios";
import { APP_CONFIG } from "@/lib/constants/app";
import { STORAGE_KEYS } from "@/lib/constants/storage";
import type { ApiErrorPayload } from "@/types/api";

export const apiClient = axios.create({
  baseURL: APP_CONFIG.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30_000,
});

function getPersistedAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const persistedAuth = window.localStorage.getItem(STORAGE_KEYS.auth);

  if (!persistedAuth) {
    return null;
  }

  try {
    const parsed = JSON.parse(persistedAuth) as {
      state?: { accessToken?: string | null };
    };

    return parsed.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

apiClient.interceptors.request.use((config) => {
  const token = getPersistedAccessToken();

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function setApiAuthToken(token?: string) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
}

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    if (!error.response) {
      return "Unable to reach the server. Check that the backend is running and try again.";
    }

    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Request failed"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Request failed";
}

export type ApiClientError = AxiosError<ApiErrorPayload>;
