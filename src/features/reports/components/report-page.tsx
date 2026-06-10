"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button, getButtonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";
import type {
  ReportFilterKey,
  ReportFilters as ReportFilterValues,
  ReportType,
} from "../types";
import {
  REPORT_PAGE_SIZE,
  canExportReport,
  canViewReport,
  getReportConfig,
  normalizeReportFilters,
} from "../utils";
import { useReportRows } from "../hooks";
import { ExportButton } from "./export-button";
import { PermissionState } from "./permission-state";
import { ReportFiltersPanel } from "./report-filters";
import { ReportTable } from "./report-table";

type ReportPageProps = {
  reportType: ReportType;
};

export function ReportPage({ reportType }: ReportPageProps) {
  const config = getReportConfig(reportType);
  const permissions = useAuthStore((state) => state.permissions);
  const user = useAuthStore((state) => state.user);
  const canView = canViewReport(config, permissions, user?.role);
  const canExport = canExportReport(config, permissions, user?.role);
  const [filters, setFilters] = useState<ReportFilterValues>({
    limit: REPORT_PAGE_SIZE,
    page: 1,
  });
  const queryFilters = useMemo(
    () =>
      normalizeReportFilters(
        { ...filters, limit: REPORT_PAGE_SIZE },
        config,
        user?.role,
      ),
    [config, filters, user?.role],
  );
  const reportQuery = useReportRows(reportType, queryFilters, canView);
  const reportList = reportQuery.data ?? {
    items: [],
    limit: REPORT_PAGE_SIZE,
    page: filters.page ?? 1,
    total: 0,
  };
  const totalPages = Math.max(1, Math.ceil(reportList.total / reportList.limit));
  const currentPage = reportList.page || filters.page || 1;

  function handleFilterChange(key: ReportFilterKey, value: string) {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: 1,
    }));
  }

  function handleReset() {
    setFilters({
      limit: REPORT_PAGE_SIZE,
      page: 1,
    });
  }

  if (!canView) {
    return (
      <PermissionState
        description={`You need ${config.viewPermission} to view this report.`}
        title={`${config.title} report unavailable`}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              className={getButtonClassName({ variant: "outline" })}
              href={ROUTES.reports}
            >
              <ArrowLeft className="size-4" />
              Reports
            </Link>
            {canExport ? (
              <ExportButton config={config} filters={queryFilters} />
            ) : null}
          </div>
        }
        eyebrow="Report"
        title={config.title}
      >
        {config.description}
      </PageHeader>

      {!canExport ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Export is hidden because your role does not include report.export
            for this company.
          </CardContent>
        </Card>
      ) : null}

      <ReportFiltersPanel
        config={config}
        filters={queryFilters}
        isDisabled={reportQuery.isLoading}
        resultCount={reportList.items.length}
        totalCount={reportList.total}
        userRole={user?.role}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />

      <ReportTable
        config={config}
        error={reportQuery.error}
        isError={reportQuery.isError}
        isLoading={reportQuery.isLoading}
        rows={reportList.items}
      />

      {!reportQuery.isLoading &&
      !reportQuery.isError &&
      reportList.total > 0 ? (
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
    </div>
  );
}
