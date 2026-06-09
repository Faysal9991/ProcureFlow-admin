import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelPurchaseRequest,
  createPurchaseRequest,
  getPurchaseRequest,
  getPurchaseRequests,
  submitPurchaseRequest,
  updatePurchaseRequest,
} from "./api";
import type {
  PurchaseRequestListFilters,
  PurchaseRequestListScope,
} from "./types";

export const purchaseRequestQueryKeys = {
  all: ["purchase-requests"] as const,
  detail: (id: string) => ["purchase-requests", "detail", id] as const,
  list: (
    scope: PurchaseRequestListScope,
    filters: PurchaseRequestListFilters,
  ) => ["purchase-requests", "list", scope, filters] as const,
};

export function usePurchaseRequests(
  filters: PurchaseRequestListFilters,
  scope: PurchaseRequestListScope,
  enabled = true,
) {
  return useQuery({
    enabled,
    queryFn: () => getPurchaseRequests(filters, scope),
    queryKey: purchaseRequestQueryKeys.list(scope, filters),
  });
}

export function usePurchaseRequest(id: string, enabled = true) {
  return useQuery({
    enabled: enabled && !!id,
    queryFn: () => getPurchaseRequest(id),
    queryKey: purchaseRequestQueryKeys.detail(id),
  });
}

export function useCreatePurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPurchaseRequest,
    onSuccess: (request) => {
      queryClient.invalidateQueries({ queryKey: purchaseRequestQueryKeys.all });
      queryClient.setQueryData(
        purchaseRequestQueryKeys.detail(request.id),
        request,
      );
    },
  });
}

export function useUpdatePurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePurchaseRequest,
    onSuccess: (request) => {
      queryClient.invalidateQueries({ queryKey: purchaseRequestQueryKeys.all });
      queryClient.setQueryData(
        purchaseRequestQueryKeys.detail(request.id),
        request,
      );
    },
  });
}

export function useSubmitPurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitPurchaseRequest,
    onSuccess: (request) => {
      queryClient.invalidateQueries({ queryKey: purchaseRequestQueryKeys.all });
      queryClient.setQueryData(
        purchaseRequestQueryKeys.detail(request.id),
        request,
      );
    },
  });
}

export function useCancelPurchaseRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelPurchaseRequest,
    onSuccess: (request) => {
      queryClient.invalidateQueries({ queryKey: purchaseRequestQueryKeys.all });
      queryClient.setQueryData(
        purchaseRequestQueryKeys.detail(request.id),
        request,
      );
    },
  });
}
