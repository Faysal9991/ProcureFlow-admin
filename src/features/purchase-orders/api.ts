import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  CreatePurchaseOrderRequest,
  PurchaseOrder,
  PurchaseOrderAction,
  PurchaseOrderListData,
  PurchaseOrderListFilters,
  RFQ,
  RFQListData,
  RFQListFilters,
  UpdatePurchaseOrderRequest,
} from "./types";

const emptyPurchaseOrderList: PurchaseOrderListData = {
  items: [],
  limit: 10,
  page: 1,
  total: 0,
};

const emptyRFQList: RFQListData = {
  items: [],
  limit: 10,
  page: 1,
  total: 0,
};

function compactParams<T extends Record<string, unknown>>(filters: T) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value != null),
  );
}

function normalizePurchaseOrderList(
  data?: PurchaseOrderListData,
): PurchaseOrderListData {
  return {
    items: data?.items ?? [],
    limit: data?.limit ?? emptyPurchaseOrderList.limit,
    page: data?.page ?? emptyPurchaseOrderList.page,
    total: data?.total ?? 0,
  };
}

function normalizeRFQList(data?: RFQListData): RFQListData {
  return {
    items: data?.items ?? [],
    limit: data?.limit ?? emptyRFQList.limit,
    page: data?.page ?? emptyRFQList.page,
    total: data?.total ?? 0,
  };
}

export async function getPurchaseOrders(filters: PurchaseOrderListFilters) {
  const response = await apiClient.get<ApiResponse<PurchaseOrderListData>>(
    "/purchase-orders",
    {
      params: compactParams(filters),
    },
  );

  return normalizePurchaseOrderList(response.data.data);
}

export async function getPurchaseOrder(id: string) {
  const response = await apiClient.get<ApiResponse<PurchaseOrder>>(
    `/purchase-orders/${id}`,
  );

  return response.data.data;
}

export async function createPurchaseOrder(payload: CreatePurchaseOrderRequest) {
  const response = await apiClient.post<ApiResponse<PurchaseOrder>>(
    "/purchase-orders",
    payload,
  );

  return response.data.data;
}

export async function updatePurchaseOrder({
  id,
  payload,
}: {
  id: string;
  payload: UpdatePurchaseOrderRequest;
}) {
  const response = await apiClient.patch<ApiResponse<PurchaseOrder>>(
    `/purchase-orders/${id}`,
    payload,
  );

  return response.data.data;
}

export async function transitionPurchaseOrder({
  action,
  id,
}: {
  action: PurchaseOrderAction;
  id: string;
}) {
  const response = await apiClient.post<ApiResponse<PurchaseOrder>>(
    `/purchase-orders/${id}/${action}`,
  );

  return response.data.data;
}

export async function getRFQs(filters: RFQListFilters) {
  const response = await apiClient.get<ApiResponse<RFQListData>>("/rfqs", {
    params: compactParams(filters),
  });

  return normalizeRFQList(response.data.data);
}

export async function getRFQ(id: string) {
  const response = await apiClient.get<ApiResponse<RFQ>>(`/rfqs/${id}`);

  return response.data.data;
}
