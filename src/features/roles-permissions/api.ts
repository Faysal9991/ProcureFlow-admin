import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  AssignableUserFilters,
  AssignableUserListData,
  AssignUserRoleRequest,
  CompanyRole,
  CompanyRoleListData,
  CreateCompanyRoleInput,
  CreateCompanyRoleRequest,
  ReplaceRolePermissionsRequest,
  UpdateCompanyRoleRequest,
  UserRoleAssignment,
  Permission,
} from "./types";

const emptyUserList: AssignableUserListData = {
  items: [],
  limit: 100,
  page: 1,
  total: 0,
};

function compactParams<T extends Record<string, unknown>>(filters: T) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value != null),
  );
}

function normalizeCompanyRoles(data?: CompanyRoleListData | CompanyRole[]) {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.items ?? [];
}

function normalizeUserList(data?: AssignableUserListData): AssignableUserListData {
  return {
    items: data?.items ?? [],
    limit: data?.limit ?? emptyUserList.limit,
    page: data?.page ?? emptyUserList.page,
    total: data?.total ?? 0,
  };
}

export async function getPermissions() {
  const response = await apiClient.get<ApiResponse<Permission[]>>("/permissions");

  return response.data.data ?? [];
}

export async function getCompanyRoles() {
  const response =
    await apiClient.get<ApiResponse<CompanyRoleListData | CompanyRole[]>>(
      "/company-roles",
    );

  return normalizeCompanyRoles(response.data.data);
}

export async function getCompanyRole(id: string) {
  const roles = await getCompanyRoles();
  const role = roles.find((item) => item.id === id);

  if (!role) {
    throw new Error("Company role not found");
  }

  return role;
}

export async function createCompanyRole(payload: CreateCompanyRoleInput) {
  const { isActive, ...createPayload } = payload;
  const response = await apiClient.post<ApiResponse<CompanyRole>>(
    "/company-roles",
    createPayload satisfies CreateCompanyRoleRequest,
  );
  const createdRole = response.data.data;

  if (typeof isActive === "boolean" && createdRole.isActive !== isActive) {
    return updateCompanyRole({
      id: createdRole.id,
      payload: { isActive },
    });
  }

  return createdRole;
}

export async function updateCompanyRole({
  id,
  payload,
}: {
  id: string;
  payload: UpdateCompanyRoleRequest;
}) {
  const response = await apiClient.patch<ApiResponse<CompanyRole>>(
    `/company-roles/${id}`,
    payload,
  );

  return response.data.data;
}

export async function replaceRolePermissions({
  id,
  payload,
}: {
  id: string;
  payload: ReplaceRolePermissionsRequest;
}) {
  const response = await apiClient.post<ApiResponse<CompanyRole>>(
    `/company-roles/${id}/permissions`,
    payload,
  );

  return response.data.data;
}

export async function getAssignableUsers(filters: AssignableUserFilters) {
  const response = await apiClient.get<ApiResponse<AssignableUserListData>>(
    "/users",
    { params: compactParams(filters) },
  );

  return normalizeUserList(response.data.data);
}

export async function assignUserRole({
  roleId,
  userId,
}: AssignUserRoleRequest & { userId: string }) {
  const response = await apiClient.post<ApiResponse<UserRoleAssignment>>(
    `/users/${userId}/roles`,
    { roleId } satisfies AssignUserRoleRequest,
  );

  return response.data.data;
}
