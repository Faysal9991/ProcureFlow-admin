import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { PurchaseRequest } from "@/features/purchase-requests/types";
import type {
  ApprovalDecisionRequest,
  ApprovalHistoryItem,
  ApprovalInboxData,
  ApprovalInboxFilters,
} from "./types";

const emptyApprovalInbox: ApprovalInboxData = {
  items: [],
  limit: 10,
  page: 1,
  total: 0,
};

function compactParams(filters: ApprovalInboxFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value != null),
  );
}

function normalizeApprovalInbox(data?: ApprovalInboxData): ApprovalInboxData {
  return {
    items: data?.items ?? [],
    limit: data?.limit ?? emptyApprovalInbox.limit,
    page: data?.page ?? emptyApprovalInbox.page,
    total: data?.total ?? 0,
  };
}

export async function getApprovalInbox(filters: ApprovalInboxFilters) {
  const response = await apiClient.get<ApiResponse<ApprovalInboxData>>(
    "/approvals/inbox",
    {
      params: compactParams(filters),
    },
  );

  return normalizeApprovalInbox(response.data.data);
}

export async function approvePurchaseRequest({
  requestId,
  payload,
}: {
  payload: ApprovalDecisionRequest;
  requestId: string;
}) {
  const response = await apiClient.post<ApiResponse<PurchaseRequest>>(
    `/approvals/${requestId}/approve`,
    payload,
  );

  return response.data.data;
}

export async function rejectPurchaseRequest({
  requestId,
  payload,
}: {
  payload: ApprovalDecisionRequest;
  requestId: string;
}) {
  const response = await apiClient.post<ApiResponse<PurchaseRequest>>(
    `/approvals/${requestId}/reject`,
    payload,
  );

  return response.data.data;
}

export async function getApprovalHistory(requestId: string) {
  const response = await apiClient.get<ApiResponse<ApprovalHistoryItem[]>>(
    `/purchase-requests/${requestId}/approval-history`,
  );

  return response.data.data ?? [];
}
