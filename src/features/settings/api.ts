import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { CompanySettings, UpdateCompanySettingsRequest } from "./types";

export async function getCompanySettings() {
  const response = await apiClient.get<ApiResponse<CompanySettings>>(
    "/company/settings",
  );

  return response.data.data;
}

export async function updateCompanySettings(
  payload: UpdateCompanySettingsRequest,
) {
  const response = await apiClient.patch<ApiResponse<CompanySettings>>(
    "/company/settings",
    payload,
  );

  return response.data.data;
}
