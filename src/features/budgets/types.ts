export type BudgetStatus = "DRAFT" | "ACTIVE" | "CLOSED";

export type BudgetPeriodType = "MONTHLY" | "QUARTERLY" | "YEARLY" | "CUSTOM";

export type BudgetTransactionType =
  | "ADJUSTED"
  | "CONSUMED"
  | "RELEASED"
  | "RESERVED";

export type BudgetDepartment = {
  id: string;
  name: string;
};

export type BudgetActor = {
  id: string;
  name: string;
  role: string;
};

export type Budget = {
  activatedAt?: string | null;
  activatedBy?: BudgetActor | null;
  adjustedAmount: number;
  allocatedAmount: number;
  availableAmount: number;
  closedAt?: string | null;
  closedBy?: BudgetActor | null;
  consumedAmount: number;
  createdAt: string;
  createdBy: BudgetActor;
  department: BudgetDepartment;
  id: string;
  name: string;
  periodEndDate: string;
  periodStartDate: string;
  periodType: BudgetPeriodType | string;
  releasedAmount: number;
  reservedAmount: number;
  status: BudgetStatus | string;
  updatedAt: string;
};

export type BudgetListData = {
  items: Budget[];
  limit: number;
  page: number;
  total: number;
};

export type BudgetListFilters = {
  dateFrom?: string;
  dateTo?: string;
  departmentId?: string;
  limit?: number;
  page?: number;
  periodType?: string;
  status?: string;
};

export type CreateBudgetRequest = {
  allocatedAmount: number;
  departmentId: string;
  name: string;
  periodEndDate: string;
  periodStartDate: string;
  periodType: BudgetPeriodType;
};

export type UpdateBudgetRequest = Partial<CreateBudgetRequest>;

export type AdjustBudgetRequest = {
  amount: number;
  note?: string;
};

export type BudgetTransaction = {
  amount: number;
  createdAt: string;
  createdBy: BudgetActor;
  id: string;
  note: string;
  purchaseRequestId?: string;
  type: BudgetTransactionType | string;
  updatedAt: string;
};

export type BudgetTransactionListData = {
  items: BudgetTransaction[];
};

export type BudgetAvailability = {
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

export type BudgetAvailabilityFilters = {
  amount?: number;
  date?: string;
  departmentId?: string;
};

export type BudgetAction = "activate" | "close";
