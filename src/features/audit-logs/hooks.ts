import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "./api";
import type { AuditLogFilters, AuditLogListMode } from "./types";

export const auditLogQueryKeys = {
  all: ["audit-logs"] as const,
  list: (filters: AuditLogFilters, mode: AuditLogListMode) =>
    ["audit-logs", mode, filters] as const,
};

export function useAuditLogs(
  filters: AuditLogFilters,
  mode: AuditLogListMode,
  enabled = true,
) {
  return useQuery({
    enabled,
    queryFn: () => getAuditLogs(filters, mode),
    queryKey: auditLogQueryKeys.list(filters, mode),
  });
}
