import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  AdjustBudgetRequest,
  Budget,
  BudgetAction,
  BudgetAvailability,
  BudgetAvailabilityFilters,
  BudgetListData,
  BudgetListFilters,
  BudgetTransactionListData,
  CreateBudgetRequest,
  UpdateBudgetRequest,
} from "./types";
import { BUDGET_PAGE_SIZE } from "./utils";

const emptyBudgetList: BudgetListData = {
  items: [],
  limit: BUDGET_PAGE_SIZE,
  page: 1,
  total: 0,
};

function compactParams<T extends Record<string, unknown>>(filters: T) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value != null),
  );
}

function normalizeBudgetList(data?: BudgetListData): BudgetListData {
  return {
    items: data?.items ?? [],
    limit: data?.limit ?? emptyBudgetList.limit,
    page: data?.page ?? emptyBudgetList.page,
    total: data?.total ?? 0,
  };
}

export async function getBudgets(filters: BudgetListFilters) {
  const response = await apiClient.get<ApiResponse<BudgetListData>>("/budgets", {
    params: compactParams(filters),
  });

  return normalizeBudgetList(response.data.data);
}

export async function getBudget(id: string) {
  const response = await apiClient.get<ApiResponse<Budget>>(`/budgets/${id}`);

  return response.data.data;
}

export async function createBudget(payload: CreateBudgetRequest) {
  const response = await apiClient.post<ApiResponse<Budget>>(
    "/budgets",
    payload,
  );

  return response.data.data;
}

export async function updateBudget({
  id,
  payload,
}: {
  id: string;
  payload: UpdateBudgetRequest;
}) {
  const response = await apiClient.patch<ApiResponse<Budget>>(
    `/budgets/${id}`,
    payload,
  );

  return response.data.data;
}

export async function runBudgetAction({
  action,
  id,
}: {
  action: BudgetAction;
  id: string;
}) {
  const response = await apiClient.post<ApiResponse<Budget>>(
    `/budgets/${id}/${action}`,
  );

  return response.data.data;
}

export async function adjustBudget({
  id,
  payload,
}: {
  id: string;
  payload: AdjustBudgetRequest;
}) {
  const response = await apiClient.post<ApiResponse<Budget>>(
    `/budgets/${id}/adjustments`,
    payload,
  );

  return response.data.data;
}

export async function getBudgetTransactions(id: string) {
  const response = await apiClient.get<ApiResponse<BudgetTransactionListData>>(
    `/budgets/${id}/transactions`,
  );

  return response.data.data?.items ?? [];
}

export async function getBudgetAvailability(
  filters: BudgetAvailabilityFilters,
) {
  const response = await apiClient.get<ApiResponse<BudgetAvailability>>(
    "/budgets/availability",
    {
      params: compactParams(filters),
    },
  );

  return response.data.data;
}
