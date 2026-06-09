export type PurchaseRequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "PO_CREATED"
  | "CANCELLED";

export type ApprovalStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type PurchaseRequestPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type PurchaseRequestItem = {
  description: string;
  estimatedTotalPrice: number;
  estimatedUnitPrice: number;
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
};

export type PurchaseRequestItemInput = {
  description?: string;
  estimatedUnitPrice: number;
  itemName: string;
  quantity: number;
  unit: string;
};

export type BudgetCheck = {
  adjustedAmount: number;
  allocatedAmount: number;
  availableAmount: number;
  budgetId: string;
  consumedAmount: number;
  isSufficient: boolean;
  message: string;
  releasedAmount: number;
  requestAmount: number;
  reservedAmount: number;
  status: string;
};

export type PurchaseRequest = {
  approvalStatus: ApprovalStatus | string;
  budget?: BudgetCheck | null;
  createdAt: string;
  currentStep: number;
  departmentId: string;
  departmentName: string;
  description: string;
  estimatedTotal: number;
  id: string;
  items?: PurchaseRequestItem[];
  neededDate: string;
  priority: PurchaseRequestPriority | string;
  requestedBy: string;
  requesterName: string;
  requesterRole: string;
  status: PurchaseRequestStatus | string;
  submittedAt?: string | null;
  title: string;
  updatedAt: string;
};

export type PurchaseRequestListData = {
  items: PurchaseRequest[];
  limit: number;
  page: number;
  total: number;
};

export type PurchaseRequestListFilters = {
  dateFrom?: string;
  dateTo?: string;
  departmentId?: string;
  limit?: number;
  page?: number;
  priority?: string;
  search?: string;
  status?: string;
};

export type PurchaseRequestListScope = "company" | "my";

export type CreatePurchaseRequestRequest = {
  description?: string;
  items: PurchaseRequestItemInput[];
  neededDate?: string;
  priority: PurchaseRequestPriority;
  title: string;
};

export type UpdatePurchaseRequestRequest = Partial<CreatePurchaseRequestRequest>;
