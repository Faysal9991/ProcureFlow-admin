import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignUserRole,
  createCompanyRole,
  getAssignableUsers,
  getCompanyRole,
  getCompanyRoles,
  getPermissions,
  replaceRolePermissions,
  updateCompanyRole,
} from "./api";
import type { AssignableUserFilters } from "./types";

export const rolePermissionQueryKeys = {
  all: ["roles-permissions"] as const,
  assignableUsers: (filters: AssignableUserFilters) =>
    ["roles-permissions", "assignable-users", filters] as const,
  detail: (id: string) => ["roles-permissions", "detail", id] as const,
  permissions: () => ["roles-permissions", "permissions"] as const,
  roles: () => ["roles-permissions", "roles"] as const,
};

function invalidateRoles(
  queryClient: ReturnType<typeof useQueryClient>,
  roleId?: string,
) {
  queryClient.invalidateQueries({ queryKey: rolePermissionQueryKeys.all });
  queryClient.invalidateQueries({ queryKey: ["users"] });

  if (roleId) {
    queryClient.invalidateQueries({
      queryKey: rolePermissionQueryKeys.detail(roleId),
    });
  }
}

export function usePermissions(enabled = true) {
  return useQuery({
    enabled,
    queryFn: getPermissions,
    queryKey: rolePermissionQueryKeys.permissions(),
  });
}

export function useCompanyRoles(enabled = true) {
  return useQuery({
    enabled,
    queryFn: getCompanyRoles,
    queryKey: rolePermissionQueryKeys.roles(),
  });
}

export function useCompanyRole(id: string, enabled = true) {
  return useQuery({
    enabled: enabled && !!id,
    queryFn: () => getCompanyRole(id),
    queryKey: rolePermissionQueryKeys.detail(id),
  });
}

export function useAssignableUsers(
  filters: AssignableUserFilters,
  enabled = true,
) {
  return useQuery({
    enabled,
    queryFn: () => getAssignableUsers(filters),
    queryKey: rolePermissionQueryKeys.assignableUsers(filters),
  });
}

export function useCreateCompanyRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCompanyRole,
    onSuccess: (role) => {
      invalidateRoles(queryClient, role.id);
    },
  });
}

export function useUpdateCompanyRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCompanyRole,
    onSuccess: (role) => {
      invalidateRoles(queryClient, role.id);
      queryClient.setQueryData(rolePermissionQueryKeys.detail(role.id), role);
    },
  });
}

export function useReplaceRolePermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: replaceRolePermissions,
    onSuccess: (role) => {
      invalidateRoles(queryClient, role.id);
      queryClient.setQueryData(rolePermissionQueryKeys.detail(role.id), role);
    },
  });
}

export function useAssignUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: rolePermissionQueryKeys.all,
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
