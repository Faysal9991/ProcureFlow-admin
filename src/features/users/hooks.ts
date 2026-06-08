import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activateUser,
  createUser,
  deactivateUser,
  getCompanyRoles,
  getUser,
  getUsers,
  resetUserPassword,
  updateUser,
} from "./api";
import type { UserListFilters } from "./types";

export const userQueryKeys = {
  all: ["users"] as const,
  companyRoles: () => ["users", "company-roles"] as const,
  detail: (id: string) => ["users", id] as const,
  list: (filters: UserListFilters) => ["users", "list", filters] as const,
};

export function useUsers(filters: UserListFilters, enabled = true) {
  return useQuery({
    enabled,
    queryFn: () => getUsers(filters),
    queryKey: userQueryKeys.list(filters),
  });
}

export function useUser(id: string, enabled: boolean) {
  return useQuery({
    enabled,
    queryFn: () => getUser(id),
    queryKey: userQueryKeys.detail(id),
  });
}

export function useCompanyRoles(enabled = true) {
  return useQuery({
    enabled,
    queryFn: getCompanyRoles,
    queryKey: userQueryKeys.companyRoles(),
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      queryClient.setQueryData(userQueryKeys.detail(user.uuid), user);
    },
  });
}

export function useActivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateUser,
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      queryClient.setQueryData(userQueryKeys.detail(user.uuid), user);
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      queryClient.setQueryData(userQueryKeys.detail(user.uuid), user);
    },
  });
}

export function useResetUserPassword() {
  return useMutation({
    mutationFn: resetUserPassword,
  });
}
