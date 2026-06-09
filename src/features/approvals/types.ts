import type {
  PurchaseRequest,
  PurchaseRequestListData,
  PurchaseRequestListFilters,
} from "@/features/purchase-requests/types";

export type ApprovalDecisionRequest = {
  comment?: string;
};

export type ApprovalInboxFilters = Omit<
  PurchaseRequestListFilters,
  "status"
>;

export type ApprovalInboxData = PurchaseRequestListData;

export type ApprovalInboxItem = PurchaseRequest;

export type ApprovalHistoryActor = {
  id: string;
  name: string;
  role: string;
};

export type ApprovalHistoryItem = {
  action: string;
  actionBy: ApprovalHistoryActor;
  actionById: string;
  actionByName: string;
  actionByRole: string;
  approverRole?: string;
  comment: string;
  createdAt: string;
  departmentId?: string;
  stepOrder: number;
};
