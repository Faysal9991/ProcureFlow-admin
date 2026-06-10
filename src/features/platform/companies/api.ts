import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  AssignPlatformPlanRequest,
  CreatePlatformCompanyData,
  CreatePlatformCompanyRequest,
  CreatePlatformPlanRequest,
  PlatformCompany,
  PlatformCompanyAction,
  PlatformCompanyListData,
  PlatformCompanyListFilters,
  PlatformPlan,
  PlatformPlanFilters,
  PlatformSubscription,
  UpdatePlatformPlanRequest,
  UpdatePlatformCompanyRequest,
} from "./types";

export async function getPlatformCompanies(
  filters: PlatformCompanyListFilters,
) {
  const response = await apiClient.get<ApiResponse<PlatformCompanyListData>>(
    "/platform/companies",
    { params: filters },
  );

  return (
    response.data.data ?? {
      items: [],
      limit: filters.limit ?? 10,
      page: filters.page ?? 1,
      total: 0,
    }
  );
}

export async function getPlatformCompany(id: string) {
  const response = await apiClient.get<ApiResponse<PlatformCompany>>(
    `/platform/companies/${id}`,
  );

  return response.data.data;
}

export async function getPlatformCompanySubscription(id: string) {
  const response = await apiClient.get<ApiResponse<PlatformSubscription>>(
    `/platform/companies/${id}/subscription`,
  );

  return response.data.data;
}

export async function getPlatformPlans(filters?: PlatformPlanFilters) {
  const response = await apiClient.get<ApiResponse<PlatformPlan[]>>(
    "/platform/plans",
    { params: filters },
  );

  return response.data.data ?? [];
}

export async function createPlatformPlan(payload: CreatePlatformPlanRequest) {
  const response = await apiClient.post<ApiResponse<PlatformPlan>>(
    "/platform/plans",
    payload,
  );

  return response.data.data;
}

export async function updatePlatformPlan({
  id,
  payload,
}: {
  id: string;
  payload: UpdatePlatformPlanRequest;
}) {
  const response = await apiClient.patch<ApiResponse<PlatformPlan>>(
    `/platform/plans/${id}`,
    payload,
  );

  return response.data.data;
}

export async function createPlatformCompany(
  payload: CreatePlatformCompanyRequest,
) {
  const response = await apiClient.post<ApiResponse<CreatePlatformCompanyData>>(
    "/platform/companies",
    payload,
  );

  return response.data.data;
}

export async function updatePlatformCompany({
  id,
  payload,
}: {
  id: string;
  payload: UpdatePlatformCompanyRequest;
}) {
  const response = await apiClient.patch<ApiResponse<PlatformCompany>>(
    `/platform/companies/${id}`,
    payload,
  );

  return response.data.data;
}

export async function updatePlatformCompanyStatus({
  action,
  id,
}: {
  action: PlatformCompanyAction;
  id: string;
}) {
  const response = await apiClient.post<ApiResponse<PlatformCompany>>(
    `/platform/companies/${id}/${action}`,
  );

  return response.data.data;
}

export async function assignPlatformCompanyPlan({
  companyId,
  payload,
}: {
  companyId: string;
  payload: AssignPlatformPlanRequest;
}) {
  const response = await apiClient.post<ApiResponse<PlatformSubscription>>(
    `/platform/companies/${companyId}/assign-plan`,
    payload,
  );

  return response.data.data;
}
