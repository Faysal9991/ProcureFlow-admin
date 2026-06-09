import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { purchaseRequestQueryKeys } from "@/features/purchase-requests/hooks";
import {
  approvePurchaseRequest,
  getApprovalHistory,
  getApprovalInbox,
  rejectPurchaseRequest,
} from "./api";
import type { ApprovalInboxFilters } from "./types";

export const approvalQueryKeys = {
  all: ["approvals"] as const,
  history: (requestId: string) => ["approvals", "history", requestId] as const,
  inbox: (filters: ApprovalInboxFilters) => ["approvals", "inbox", filters] as const,
};

export function useApprovalInbox(
  filters: ApprovalInboxFilters,
  enabled = true,
) {
  return useQuery({
    enabled,
    queryFn: () => getApprovalInbox(filters),
    queryKey: approvalQueryKeys.inbox(filters),
  });
}

export function useApprovalHistory(requestId: string, enabled = true) {
  return useQuery({
    enabled: enabled && !!requestId,
    queryFn: () => getApprovalHistory(requestId),
    queryKey: approvalQueryKeys.history(requestId),
  });
}

function useApprovalMutation(
  mutationFn: typeof approvePurchaseRequest | typeof rejectPurchaseRequest,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (request) => {
      queryClient.invalidateQueries({ queryKey: approvalQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: purchaseRequestQueryKeys.all });
      queryClient.setQueryData(
        purchaseRequestQueryKeys.detail(request.id),
        request,
      );
      queryClient.invalidateQueries({
        queryKey: approvalQueryKeys.history(request.id),
      });
    },
  });
}

export function useApprovePurchaseRequest() {
  return useApprovalMutation(approvePurchaseRequest);
}

export function useRejectPurchaseRequest() {
  return useApprovalMutation(rejectPurchaseRequest);
}
