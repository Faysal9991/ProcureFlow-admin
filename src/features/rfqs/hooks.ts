import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addRFQVendors,
  cancelRFQ,
  createQuotation,
  createRFQ,
  getRFQ,
  getRFQComparison,
  getRFQs,
  openRFQ,
  selectQuotation,
} from "./api";
import type { RFQListFilters } from "./types";

export const rfqQueryKeys = {
  all: ["rfqs"] as const,
  comparison: (id: string) => ["rfqs", "comparison", id] as const,
  detail: (id: string) => ["rfqs", "detail", id] as const,
  list: (filters: RFQListFilters) => ["rfqs", "list", filters] as const,
};

function invalidateRFQQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: rfqQueryKeys.all });
}

export function useRFQs(filters: RFQListFilters, enabled = true) {
  return useQuery({
    enabled,
    queryFn: () => getRFQs(filters),
    queryKey: rfqQueryKeys.list(filters),
  });
}

export function useRFQ(id: string, enabled = true) {
  return useQuery({
    enabled: enabled && !!id,
    queryFn: () => getRFQ(id),
    queryKey: rfqQueryKeys.detail(id),
  });
}

export function useRFQComparison(id: string, enabled = true) {
  return useQuery({
    enabled: enabled && !!id,
    queryFn: () => getRFQComparison(id),
    queryKey: rfqQueryKeys.comparison(id),
  });
}

export function useCreateRFQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRFQ,
    onSuccess: (rfq) => {
      invalidateRFQQueries(queryClient);
      queryClient.setQueryData(rfqQueryKeys.detail(rfq.id), rfq);
    },
  });
}

export function useAddRFQVendors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addRFQVendors,
    onSuccess: (rfq) => {
      invalidateRFQQueries(queryClient);
      queryClient.setQueryData(rfqQueryKeys.detail(rfq.id), rfq);
    },
  });
}

export function useOpenRFQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: openRFQ,
    onSuccess: (rfq) => {
      invalidateRFQQueries(queryClient);
      queryClient.setQueryData(rfqQueryKeys.detail(rfq.id), rfq);
    },
  });
}

export function useCancelRFQ() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelRFQ,
    onSuccess: (rfq) => {
      invalidateRFQQueries(queryClient);
      queryClient.setQueryData(rfqQueryKeys.detail(rfq.id), rfq);
    },
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuotation,
    onSuccess: (_quotation, variables) => {
      invalidateRFQQueries(queryClient);
      queryClient.invalidateQueries({
        queryKey: rfqQueryKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: rfqQueryKeys.comparison(variables.id),
      });
    },
  });
}

export function useSelectQuotation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: selectQuotation,
    onSuccess: (rfq) => {
      invalidateRFQQueries(queryClient);
      queryClient.setQueryData(rfqQueryKeys.detail(rfq.id), rfq);
      queryClient.invalidateQueries({
        queryKey: rfqQueryKeys.comparison(rfq.id),
      });
    },
  });
}
