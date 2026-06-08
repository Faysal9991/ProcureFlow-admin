import { apiClient } from "@/lib/api/client";
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  CurrentPermissionsResponse,
  LoginRequest,
  LoginResponse,
  LoginResponseData,
  MeResponse,
} from "./types";
import type { AuthUser } from "@/types/auth";

export async function login(payload: LoginRequest): Promise<LoginResponseData> {
  const response = await apiClient.post<LoginResponse>("/auth/login", payload);
  return response.data.data;
}

export async function getMe(): Promise<AuthUser> {
  const response = await apiClient.get<MeResponse>("/auth/me");
  return response.data.data;
}

export async function getCurrentPermissions(): Promise<string[]> {
  const response =
    await apiClient.get<CurrentPermissionsResponse>("/auth/permissions");
  return response.data.data.permissions;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

export async function changePassword(
  payload: ChangePasswordRequest,
): Promise<void> {
  await apiClient.post<ChangePasswordResponse>(
    "/auth/change-password",
    payload,
  );
}
