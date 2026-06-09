import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addInvoicePayment,
  cancelInvoice,
  createInvoice,
  getInvoice,
  getInvoices,
  getPayments,
  updateInvoice,
} from "./api";
import type { InvoiceListFilters, PaymentListFilters } from "./types";

export const invoiceQueryKeys = {
  all: ["invoices"] as const,
  detail: (id: string) => ["invoices", "detail", id] as const,
  list: (filters: InvoiceListFilters) => ["invoices", "list", filters] as const,
  payments: {
    all: ["payments"] as const,
    list: (filters: PaymentListFilters) => ["payments", "list", filters] as const,
  },
};

export function useInvoices(filters: InvoiceListFilters, enabled = true) {
  return useQuery({
    enabled,
    queryFn: () => getInvoices(filters),
    queryKey: invoiceQueryKeys.list(filters),
  });
}

export function useInvoice(id: string, enabled = true) {
  return useQuery({
    enabled: enabled && !!id,
    queryFn: () => getInvoice(id),
    queryKey: invoiceQueryKeys.detail(id),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvoice,
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.payments.all });
      queryClient.setQueryData(invoiceQueryKeys.detail(invoice.id), invoice);
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateInvoice,
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.all });
      queryClient.setQueryData(invoiceQueryKeys.detail(invoice.id), invoice);
    },
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelInvoice,
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.all });
      queryClient.setQueryData(invoiceQueryKeys.detail(invoice.id), invoice);
    },
  });
}

export function useAddInvoicePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addInvoicePayment,
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: invoiceQueryKeys.payments.all });
      queryClient.setQueryData(invoiceQueryKeys.detail(invoice.id), invoice);
    },
  });
}

export function usePayments(filters: PaymentListFilters, enabled = true) {
  return useQuery({
    enabled,
    queryFn: () => getPayments(filters),
    queryKey: invoiceQueryKeys.payments.list(filters),
  });
}
