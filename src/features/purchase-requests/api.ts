import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  CreatePurchaseRequestRequest,
  PurchaseRequest,
  PurchaseRequestListData,
  PurchaseRequestListFilters,
  PurchaseRequestListScope,
  UpdatePurchaseRequestRequest,
} from "./types";

const emptyPurchaseRequestList: PurchaseRequestListData = {
  items: [],
  limit: 10,
  page: 1,
  total: 0,
};

function compactParams(filters: PurchaseRequestListFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value != null),
  );
}

function normalizePurchaseRequestList(
  data?: PurchaseRequestListData,
): PurchaseRequestListData {
  return {
    items: data?.items ?? [],
    limit: data?.limit ?? emptyPurchaseRequestList.limit,
    page: data?.page ?? emptyPurchaseRequestList.page,
    total: data?.total ?? 0,
  };
}

export async function getPurchaseRequests(
  filters: PurchaseRequestListFilters,
  scope: PurchaseRequestListScope,
) {
  const path =
    scope === "my" ? "/purchase-requests/my" : "/purchase-requests";
  const response = await apiClient.get<ApiResponse<PurchaseRequestListData>>(
    path,
    {
      params: compactParams(filters),
    },
  );

  return normalizePurchaseRequestList(response.data.data);
}

export async function getPurchaseRequest(id: string) {
  const response = await apiClient.get<ApiResponse<PurchaseRequest>>(
    `/purchase-requests/${id}`,
  );

  return response.data.data;
}

export async function createPurchaseRequest(
  payload: CreatePurchaseRequestRequest,
) {
  const response = await apiClient.post<ApiResponse<PurchaseRequest>>(
    "/purchase-requests",
    payload,
  );

  return response.data.data;
}

export async function updatePurchaseRequest({
  id,
  payload,
}: {
  id: string;
  payload: UpdatePurchaseRequestRequest;
}) {
  const response = await apiClient.patch<ApiResponse<PurchaseRequest>>(
    `/purchase-requests/${id}`,
    payload,
  );

  return response.data.data;
}

export async function submitPurchaseRequest(id: string) {
  const response = await apiClient.post<ApiResponse<PurchaseRequest>>(
    `/purchase-requests/${id}/submit`,
  );

  return response.data.data;
}

export async function cancelPurchaseRequest(id: string) {
  const response = await apiClient.post<ApiResponse<PurchaseRequest>>(
    `/purchase-requests/${id}/cancel`,
  );

  return response.data.data;
}
