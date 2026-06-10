import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adjustBudget,
  createBudget,
  getBudget,
  getBudgetAvailability,
  getBudgetTransactions,
  getBudgets,
  runBudgetAction,
  updateBudget,
} from "./api";
import type { BudgetAvailabilityFilters, BudgetListFilters } from "./types";

export const budgetQueryKeys = {
  all: ["budgets"] as const,
  availability: (filters: BudgetAvailabilityFilters) =>
    ["budgets", "availability", filters] as const,
  detail: (id: string) => ["budgets", "detail", id] as const,
  list: (filters: BudgetListFilters) => ["budgets", "list", filters] as const,
  transactions: (id: string) => ["budgets", "transactions", id] as const,
};

export function useBudgets(filters: BudgetListFilters, enabled = true) {
  return useQuery({
    enabled,
    queryFn: () => getBudgets(filters),
    queryKey: budgetQueryKeys.list(filters),
  });
}

export function useBudget(id: string, enabled = true) {
  return useQuery({
    enabled: enabled && !!id,
    queryFn: () => getBudget(id),
    queryKey: budgetQueryKeys.detail(id),
  });
}

export function useBudgetTransactions(id: string, enabled = true) {
  return useQuery({
    enabled: enabled && !!id,
    queryFn: () => getBudgetTransactions(id),
    queryKey: budgetQueryKeys.transactions(id),
  });
}

export function useBudgetAvailability(
  filters: BudgetAvailabilityFilters,
  enabled = true,
) {
  return useQuery({
    enabled:
      enabled &&
      Boolean(filters.departmentId) &&
      filters.amount != null &&
      Boolean(filters.date),
    queryFn: () => getBudgetAvailability(filters),
    queryKey: budgetQueryKeys.availability(filters),
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBudget,
    onSuccess: (budget) => {
      queryClient.invalidateQueries({ queryKey: budgetQueryKeys.all });
      queryClient.setQueryData(budgetQueryKeys.detail(budget.id), budget);
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBudget,
    onSuccess: (budget) => {
      queryClient.invalidateQueries({ queryKey: budgetQueryKeys.all });
      queryClient.setQueryData(budgetQueryKeys.detail(budget.id), budget);
    },
  });
}

export function useRunBudgetAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: runBudgetAction,
    onSuccess: (budget) => {
      queryClient.invalidateQueries({ queryKey: budgetQueryKeys.all });
      queryClient.setQueryData(budgetQueryKeys.detail(budget.id), budget);
    },
  });
}

export function useAdjustBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adjustBudget,
    onSuccess: (budget) => {
      queryClient.invalidateQueries({ queryKey: budgetQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: budgetQueryKeys.transactions(budget.id),
      });
      queryClient.setQueryData(budgetQueryKeys.detail(budget.id), budget);
    },
  });
}
