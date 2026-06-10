import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignPlatformCompanyPlan,
  createPlatformPlan,
  createPlatformCompany,
  getPlatformCompanies,
  getPlatformCompany,
  getPlatformCompanySubscription,
  getPlatformPlans,
  updatePlatformPlan,
  updatePlatformCompany,
  updatePlatformCompanyStatus,
} from "./api";
import type {
  PlatformCompanyListFilters,
  PlatformPlanFilters,
} from "./types";

export const platformCompanyQueryKeys = {
  all: ["platform-companies"] as const,
  detail: (id: string) => ["platform-companies", "detail", id] as const,
  list: (filters: PlatformCompanyListFilters) =>
    ["platform-companies", "list", filters] as const,
  plans: (filters?: PlatformPlanFilters) =>
    ["platform-companies", "plans", filters] as const,
  subscription: (id: string) =>
    ["platform-companies", "subscription", id] as const,
};

function invalidateCompany(
  queryClient: ReturnType<typeof useQueryClient>,
  id?: string,
) {
  queryClient.invalidateQueries({ queryKey: platformCompanyQueryKeys.all });
  if (id) {
    queryClient.invalidateQueries({
      queryKey: platformCompanyQueryKeys.detail(id),
    });
    queryClient.invalidateQueries({
      queryKey: platformCompanyQueryKeys.subscription(id),
    });
  }
}

export function usePlatformCompanies(
  filters: PlatformCompanyListFilters,
  enabled = true,
) {
  return useQuery({
    enabled,
    queryFn: () => getPlatformCompanies(filters),
    queryKey: platformCompanyQueryKeys.list(filters),
  });
}

export function usePlatformCompany(id: string, enabled = true) {
  return useQuery({
    enabled: enabled && !!id,
    queryFn: () => getPlatformCompany(id),
    queryKey: platformCompanyQueryKeys.detail(id),
  });
}

export function usePlatformCompanySubscription(id: string, enabled = true) {
  return useQuery({
    enabled: enabled && !!id,
    queryFn: () => getPlatformCompanySubscription(id),
    queryKey: platformCompanyQueryKeys.subscription(id),
  });
}

export function usePlatformPlans(
  enabled = true,
  filters?: PlatformPlanFilters,
) {
  return useQuery({
    enabled,
    queryFn: () => getPlatformPlans(filters),
    queryKey: platformCompanyQueryKeys.plans(filters),
  });
}

export function useCreatePlatformCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlatformCompany,
    onSuccess: () => {
      invalidateCompany(queryClient);
    },
  });
}

export function useUpdatePlatformCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePlatformCompany,
    onSuccess: (company) => {
      invalidateCompany(queryClient, company.id);
      queryClient.setQueryData(platformCompanyQueryKeys.detail(company.id), company);
    },
  });
}

export function useUpdatePlatformCompanyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePlatformCompanyStatus,
    onSuccess: (company) => {
      invalidateCompany(queryClient, company.id);
      queryClient.setQueryData(platformCompanyQueryKeys.detail(company.id), company);
    },
  });
}

export function useCreatePlatformPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlatformPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformCompanyQueryKeys.all });
    },
  });
}

export function useUpdatePlatformPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePlatformPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: platformCompanyQueryKeys.all });
    },
  });
}

export function useAssignPlatformCompanyPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignPlatformCompanyPlan,
    onSuccess: (subscription) => {
      queryClient.invalidateQueries({ queryKey: platformCompanyQueryKeys.all });
      if (subscription.companyId) {
        queryClient.invalidateQueries({
          queryKey: platformCompanyQueryKeys.subscription(subscription.companyId),
        });
      }
    },
  });
}
