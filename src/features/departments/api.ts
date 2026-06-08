import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  CreateDepartmentRequest,
  Department,
  DepartmentListResponseData,
  UpdateDepartmentRequest,
} from "./types";

function normalizeDepartmentList(data?: DepartmentListResponseData) {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.items ?? [];
}

export async function getDepartments() {
  const response = await apiClient.get<ApiResponse<DepartmentListResponseData>>(
    "/departments",
  );

  return normalizeDepartmentList(response.data.data);
}

export async function getDepartment(id: string) {
  const response = await apiClient.get<ApiResponse<Department>>(
    `/departments/${id}`,
  );

  return response.data.data;
}

export async function createDepartment(payload: CreateDepartmentRequest) {
  const response = await apiClient.post<ApiResponse<Department>>(
    "/departments",
    payload,
  );

  return response.data.data;
}

export async function updateDepartment({
  id,
  payload,
}: {
  id: string;
  payload: UpdateDepartmentRequest;
}) {
  const response = await apiClient.patch<ApiResponse<Department>>(
    `/departments/${id}`,
    payload,
  );

  return response.data.data;
}

export async function deleteDepartment(id: string) {
  await apiClient.delete<ApiResponse<null>>(`/departments/${id}`);
}
