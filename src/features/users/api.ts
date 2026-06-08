import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  CompanyRole,
  CompanyRoleListData,
  CreateUserRequest,
  CreateUserResponseData,
  ManagedUser,
  ResetPasswordResponseData,
  UpdateUserRequest,
  UserListData,
  UserListFilters,
} from "./types";

const emptyUserList: UserListData = {
  items: [],
  limit: 10,
  page: 1,
  total: 0,
};

function compactParams(filters: UserListFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value != null),
  );
}

function normalizeUserList(data?: UserListData): UserListData {
  return {
    items: data?.items ?? [],
    limit: data?.limit ?? emptyUserList.limit,
    page: data?.page ?? emptyUserList.page,
    total: data?.total ?? 0,
  };
}

function normalizeCompanyRoles(data?: CompanyRoleListData | CompanyRole[]) {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.items ?? [];
}

export async function getUsers(filters: UserListFilters) {
  const response = await apiClient.get<ApiResponse<UserListData>>("/users", {
    params: compactParams(filters),
  });

  return normalizeUserList(response.data.data);
}

export async function getUser(id: string) {
  const response = await apiClient.get<ApiResponse<ManagedUser>>(`/users/${id}`);

  return response.data.data;
}

export async function createUser(payload: CreateUserRequest) {
  const response = await apiClient.post<ApiResponse<CreateUserResponseData>>(
    "/users",
    payload,
  );

  return response.data.data;
}

export async function updateUser({
  id,
  payload,
}: {
  id: string;
  payload: UpdateUserRequest;
}) {
  const response = await apiClient.patch<ApiResponse<ManagedUser>>(
    `/users/${id}`,
    payload,
  );

  return response.data.data;
}

export async function activateUser(id: string) {
  const response = await apiClient.post<ApiResponse<ManagedUser>>(
    `/users/${id}/activate`,
  );

  return response.data.data;
}

export async function deactivateUser(id: string) {
  const response = await apiClient.post<ApiResponse<ManagedUser>>(
    `/users/${id}/deactivate`,
  );

  return response.data.data;
}

export async function resetUserPassword(id: string) {
  const response = await apiClient.post<ApiResponse<ResetPasswordResponseData>>(
    `/users/${id}/reset-password`,
  );

  return response.data.data;
}

export async function getCompanyRoles() {
  const response =
    await apiClient.get<ApiResponse<CompanyRoleListData | CompanyRole[]>>(
      "/company-roles",
    );

  return normalizeCompanyRoles(response.data.data);
}
