import type { ApiResponse } from "@/types/api";
import type { AuthUser } from "@/types/auth";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponseData = {
  accessToken: string;
  user: AuthUser;
};

export type LoginResponse = ApiResponse<LoginResponseData>;

export type MeResponse = ApiResponse<AuthUser>;

export type CurrentPermissionsData = {
  permissions: string[];
};

export type CurrentPermissionsResponse = ApiResponse<CurrentPermissionsData>;

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type ChangePasswordResponse = ApiResponse<Record<string, never>>;
