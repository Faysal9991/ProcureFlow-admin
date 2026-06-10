import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  AuditLogFilters,
  AuditLogListData,
  AuditLogListMode,
} from "./types";
import {
  AUDIT_LOG_PAGE_SIZE,
  compactAuditParams,
} from "./utils";

const emptyAuditLogList: AuditLogListData = {
  items: [],
  limit: AUDIT_LOG_PAGE_SIZE,
  page: 1,
  total: 0,
};

function normalizeAuditLogList(data?: AuditLogListData): AuditLogListData {
  return {
    items: data?.items ?? [],
    limit: data?.limit ?? emptyAuditLogList.limit,
    page: data?.page ?? emptyAuditLogList.page,
    total: data?.total ?? 0,
  };
}

export async function getAuditLogs(
  filters: AuditLogFilters,
  mode: AuditLogListMode,
) {
  const endpoint = mode === "entity" ? "/audit-logs/entity" : "/audit-logs";
  const response = await apiClient.get<ApiResponse<AuditLogListData>>(endpoint, {
    params: compactAuditParams(filters),
  });

  return normalizeAuditLogList(response.data.data);
}
