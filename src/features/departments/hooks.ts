import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDepartment,
  deleteDepartment,
  getDepartment,
  getDepartments,
  updateDepartment,
} from "./api";

export const departmentQueryKeys = {
  all: ["departments"] as const,
  detail: (id: string) => ["departments", id] as const,
  list: () => ["departments", "list"] as const,
};

export function useDepartments(enabled = true) {
  return useQuery({
    enabled,
    queryFn: getDepartments,
    queryKey: departmentQueryKeys.list(),
  });
}

export function useDepartment(id: string, enabled: boolean) {
  return useQuery({
    enabled,
    queryFn: () => getDepartment(id),
    queryKey: departmentQueryKeys.detail(id),
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentQueryKeys.all });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDepartment,
    onSuccess: (department) => {
      queryClient.invalidateQueries({ queryKey: departmentQueryKeys.all });
      queryClient.setQueryData(
        departmentQueryKeys.detail(department.uuid),
        department,
      );
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentQueryKeys.all });
    },
  });
}
