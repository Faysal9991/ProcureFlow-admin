"use client";

import { ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";
import { useAuditLogs } from "../hooks";
import type { AuditLog, AuditLogFilters } from "../types";
import {
  AUDIT_LOG_PAGE_SIZE,
  canViewAuditLogs,
  canViewEntityHistory,
  normalizeAuditFilters,
  shouldUseEntityHistory,
} from "../utils";
import { AuditLogDetailDrawer } from "./audit-log-detail-drawer";
import { AuditLogFiltersPanel } from "./audit-log-filters";
import { AuditLogTable } from "./audit-log-table";

type AuditFilterKey = keyof Pick<
  AuditLogFilters,
  "action" | "dateFrom" | "dateTo" | "entityId" | "entityType" | "userId"
>;

export function AuditLogsPage() {
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);
  const canView = canViewAuditLogs(permissions, user?.role);
  const hasEntityHistoryPermission = canViewEntityHistory(permissions);
  const [filters, setFilters] = useState<AuditLogFilters>({
    limit: AUDIT_LOG_PAGE_SIZE,
    page: 1,
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const queryFilters = useMemo(
    () =>
      normalizeAuditFilters({
        ...filters,
        limit: AUDIT_LOG_PAGE_SIZE,
      }),
    [filters],
  );
  const isEntityHistoryMode = shouldUseEntityHistory(
    queryFilters,
    hasEntityHistoryPermission,
  );
  const listMode = isEntityHistoryMode ? "entity" : "list";
  const logsQuery = useAuditLogs(queryFilters, listMode, canView);
  const auditList = logsQuery.data ?? {
    items: [],
    limit: AUDIT_LOG_PAGE_SIZE,
    page: filters.page ?? 1,
    total: 0,
  };
  const totalPages = Math.max(1, Math.ceil(auditList.total / auditList.limit));
  const currentPage = auditList.page || filters.page || 1;

  function handleFilterChange(key: AuditFilterKey, value: string) {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: 1,
    }));
  }

  function handleReset() {
    setFilters({
      limit: AUDIT_LOG_PAGE_SIZE,
      page: 1,
    });
  }

  if (!canView) {
    return <AuditPermissionState />;
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Management" title="Audit Logs">
        Review who changed company records, when it happened, and the captured
        old and new values.
      </PageHeader>

      {/* TODO: Show audit export when backend adds GET /audit-logs/export?format=csv|xlsx|pdf. */}
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          Audit export is hidden until the backend exposes a complete,
          server-authorized audit export endpoint.
        </CardContent>
      </Card>

      {!hasEntityHistoryPermission &&
      queryFilters.entityType &&
      queryFilters.entityId ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Entity history permission is not available for this session. The
            table is using the standard audit log list with entity filters.
          </CardContent>
        </Card>
      ) : null}

      <AuditLogFiltersPanel
        filters={queryFilters}
        isDisabled={logsQuery.isLoading}
        isEntityHistoryMode={isEntityHistoryMode}
        resultCount={auditList.items.length}
        totalCount={auditList.total}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      <AuditLogTable
        error={logsQuery.error}
        isError={logsQuery.isError}
        isLoading={logsQuery.isLoading}
        logs={auditList.items}
        onView={setSelectedLog}
      />

      {!logsQuery.isLoading && !logsQuery.isError && auditList.total > 0 ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              disabled={currentPage <= 1}
              size="sm"
              variant="outline"
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: Math.max(1, currentPage - 1),
                }))
              }
            >
              Previous
            </Button>
            <Button
              disabled={currentPage >= totalPages}
              size="sm"
              variant="outline"
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: Math.min(totalPages, currentPage + 1),
                }))
              }
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <AuditLogDetailDrawer
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}

function AuditPermissionState() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Management" title="Audit Logs">
        Audit visibility is controlled by company audit permissions.
      </PageHeader>
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                <ShieldAlert className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Audit access unavailable
              </p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                You need audit.view for this company to inspect audit logs.
                Super admins use platform audit tooling separately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
