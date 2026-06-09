import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPurchaseOrder,
  getPurchaseOrder,
  getPurchaseOrders,
  getRFQ,
  getRFQs,
  transitionPurchaseOrder,
  updatePurchaseOrder,
} from "./api";
import type { PurchaseOrderListFilters, RFQListFilters } from "./types";

export const purchaseOrderQueryKeys = {
  all: ["purchase-orders"] as const,
  detail: (id: string) => ["purchase-orders", "detail", id] as const,
  list: (filters: PurchaseOrderListFilters) =>
    ["purchase-orders", "list", filters] as const,
  rfqDetail: (id: string) => ["purchase-orders", "rfq", id] as const,
  rfqList: (filters: RFQListFilters) =>
    ["purchase-orders", "rfqs", filters] as const,
};

export function usePurchaseOrders(
  filters: PurchaseOrderListFilters,
  enabled = true,
) {
  return useQuery({
    enabled,
    queryFn: () => getPurchaseOrders(filters),
    queryKey: purchaseOrderQueryKeys.list(filters),
  });
}

export function usePurchaseOrder(id: string, enabled = true) {
  return useQuery({
    enabled: enabled && !!id,
    queryFn: () => getPurchaseOrder(id),
    queryKey: purchaseOrderQueryKeys.detail(id),
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKeys.all });
      queryClient.setQueryData(purchaseOrderQueryKeys.detail(order.id), order);
    },
  });
}

export function useUpdatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePurchaseOrder,
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKeys.all });
      queryClient.setQueryData(purchaseOrderQueryKeys.detail(order.id), order);
    },
  });
}

export function useTransitionPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transitionPurchaseOrder,
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: purchaseOrderQueryKeys.all });
      queryClient.setQueryData(purchaseOrderQueryKeys.detail(order.id), order);
    },
  });
}

export function useRFQs(filters: RFQListFilters, enabled = true) {
  return useQuery({
    enabled,
    queryFn: () => getRFQs(filters),
    queryKey: purchaseOrderQueryKeys.rfqList(filters),
  });
}

export function useRFQ(id: string, enabled = true) {
  return useQuery({
    enabled: enabled && !!id,
    queryFn: () => getRFQ(id),
    queryKey: purchaseOrderQueryKeys.rfqDetail(id),
  });
}
