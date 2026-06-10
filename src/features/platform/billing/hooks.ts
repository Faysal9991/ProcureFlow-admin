import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelPlatformBillingInvoice,
  createPlatformBillingInvoice,
  getCompanyPlatformBillingInvoices,
  getPlatformBillingInvoice,
  getPlatformBillingInvoices,
  recordPlatformBillingPayment,
} from "./api";
import type { PlatformBillingFilters } from "./types";

export const platformBillingQueryKeys = {
  all: ["platform-billing"] as const,
  companyHistory: (companyId: string) =>
    ["platform-billing", "company", companyId] as const,
  detail: (id: string) => ["platform-billing", "detail", id] as const,
  list: (filters: PlatformBillingFilters) =>
    ["platform-billing", "list", filters] as const,
};

function invalidateBilling(
  queryClient: ReturnType<typeof useQueryClient>,
  invoiceId?: string,
  companyId?: string,
) {
  queryClient.invalidateQueries({ queryKey: platformBillingQueryKeys.all });
  if (invoiceId) {
    queryClient.invalidateQueries({
      queryKey: platformBillingQueryKeys.detail(invoiceId),
    });
  }
  if (companyId) {
    queryClient.invalidateQueries({
      queryKey: platformBillingQueryKeys.companyHistory(companyId),
    });
  }
}

export function usePlatformBillingInvoices(
  filters: PlatformBillingFilters,
  enabled = true,
) {
  return useQuery({
    enabled,
    queryFn: () => getPlatformBillingInvoices(filters),
    queryKey: platformBillingQueryKeys.list(filters),
  });
}

export function usePlatformBillingInvoice(id: string, enabled = true) {
  return useQuery({
    enabled: enabled && !!id,
    queryFn: () => getPlatformBillingInvoice(id),
    queryKey: platformBillingQueryKeys.detail(id),
  });
}

export function useCompanyPlatformBillingInvoices(
  companyId: string,
  enabled = true,
) {
  return useQuery({
    enabled: enabled && !!companyId,
    queryFn: () => getCompanyPlatformBillingInvoices({ companyId }),
    queryKey: platformBillingQueryKeys.companyHistory(companyId),
  });
}

export function useCreatePlatformBillingInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlatformBillingInvoice,
    onSuccess: (invoice) => {
      invalidateBilling(queryClient, invoice.id, invoice.company.id);
    },
  });
}

export function useRecordPlatformBillingPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordPlatformBillingPayment,
    onSuccess: (invoice) => {
      invalidateBilling(queryClient, invoice.id, invoice.company.id);
    },
  });
}

export function useCancelPlatformBillingInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelPlatformBillingInvoice,
    onSuccess: (invoice) => {
      invalidateBilling(queryClient, invoice.id, invoice.company.id);
    },
  });
}
