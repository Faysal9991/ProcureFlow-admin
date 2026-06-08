import { useQuery } from "@tanstack/react-query";
import {
  getDashboardSummary,
  getDepartmentSpend,
  getOverdueInvoices,
  getRequestStatusChart,
  getSpendSummary,
  getTopVendors,
} from "./api";
import type { DashboardFilters } from "./types";

const dashboardQueryKey = (section: string, filters: DashboardFilters) => [
  "dashboard",
  section,
  filters,
];

export function useDashboardSummary(
  filters: DashboardFilters,
  enabled = true,
) {
  return useQuery({
    enabled,
    queryFn: () => getDashboardSummary(filters),
    queryKey: dashboardQueryKey("summary", filters),
  });
}

export function useRequestStatusChart(
  filters: DashboardFilters,
  enabled = true,
) {
  return useQuery({
    enabled,
    queryFn: () => getRequestStatusChart(filters),
    queryKey: dashboardQueryKey("request-status-chart", filters),
  });
}

export function useSpendSummary(
  filters: DashboardFilters,
  enabled: boolean,
) {
  return useQuery({
    enabled,
    queryFn: () => getSpendSummary(filters),
    queryKey: dashboardQueryKey("spend-summary", filters),
  });
}

export function useDepartmentSpend(
  filters: DashboardFilters,
  enabled: boolean,
) {
  return useQuery({
    enabled,
    queryFn: () => getDepartmentSpend(filters),
    queryKey: dashboardQueryKey("department-spend", filters),
  });
}

export function useTopVendors(filters: DashboardFilters, enabled: boolean) {
  return useQuery({
    enabled,
    queryFn: () => getTopVendors(filters),
    queryKey: dashboardQueryKey("top-vendors", filters),
  });
}

export function useOverdueInvoices(
  filters: DashboardFilters,
  enabled: boolean,
) {
  return useQuery({
    enabled,
    queryFn: () => getOverdueInvoices(filters),
    queryKey: dashboardQueryKey("overdue-invoices", filters),
  });
}
