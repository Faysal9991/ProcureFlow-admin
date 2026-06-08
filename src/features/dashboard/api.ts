import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  DashboardFilters,
  DashboardSummary,
  DepartmentSpendItem,
  OverdueInvoicesData,
  RequestStatusChartData,
  SpendSummaryData,
  TopVendorItem,
} from "./types";

function buildParams(filters: DashboardFilters) {
  return {
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    departmentId: filters.departmentId || undefined,
    limit: filters.limit,
    page: filters.page,
  };
}

export async function getDashboardSummary(filters: DashboardFilters) {
  const response = await apiClient.get<ApiResponse<DashboardSummary>>(
    "/dashboard/summary",
    { params: buildParams(filters) },
  );

  return response.data.data;
}

export async function getRequestStatusChart(filters: DashboardFilters) {
  const response = await apiClient.get<ApiResponse<RequestStatusChartData>>(
    "/dashboard/request-status-chart",
    { params: buildParams(filters) },
  );

  return response.data.data;
}

export async function getSpendSummary(filters: DashboardFilters) {
  const response = await apiClient.get<ApiResponse<SpendSummaryData>>(
    "/dashboard/spend-summary",
    { params: buildParams(filters) },
  );

  return response.data.data;
}

export async function getDepartmentSpend(filters: DashboardFilters) {
  const response = await apiClient.get<ApiResponse<DepartmentSpendItem[]>>(
    "/dashboard/department-spend",
    { params: buildParams(filters) },
  );

  return response.data.data;
}

export async function getTopVendors(filters: DashboardFilters) {
  const response = await apiClient.get<ApiResponse<TopVendorItem[]>>(
    "/dashboard/top-vendors",
    { params: buildParams({ ...filters, limit: filters.limit ?? 5 }) },
  );

  return response.data.data;
}

export async function getOverdueInvoices(filters: DashboardFilters) {
  const response = await apiClient.get<ApiResponse<OverdueInvoicesData>>(
    "/dashboard/overdue-invoices",
    { params: buildParams({ ...filters, limit: filters.limit ?? 10 }) },
  );

  return response.data.data;
}
