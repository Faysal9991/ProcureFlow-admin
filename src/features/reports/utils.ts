import type { AdminRole } from "@/types/auth";
import { reportConfigByType, reportConfigs } from "./config";
import type {
  ReportConfig,
  ReportExportFormat,
  ReportFilterKey,
  ReportFilters,
  ReportListData,
  ReportRow,
  ReportType,
} from "./types";

export const REPORT_PAGE_SIZE = 10;
export const REPORT_EXPORT_PERMISSION = "report.export";

export function getReportConfig(reportType: ReportType) {
  return reportConfigByType[reportType];
}

export function getAccessibleReportConfigs(
  permissions: string[],
  role?: string,
) {
  if (role === "SUPER_ADMIN") {
    return [];
  }

  return reportConfigs.filter((config) =>
    permissions.includes(config.viewPermission),
  );
}

export function canViewReport(
  config: ReportConfig,
  permissions: string[],
  role?: string,
) {
  return role !== "SUPER_ADMIN" && permissions.includes(config.viewPermission);
}

export function canExportReport(
  config: ReportConfig,
  permissions: string[],
  role?: string,
) {
  return (
    canViewReport(config, permissions, role) &&
    permissions.includes(REPORT_EXPORT_PERMISSION)
  );
}

export function getVisibleReportFilters(config: ReportConfig, role?: string) {
  return config.filters.filter((filterKey) =>
    canUseReportFilter(filterKey, role),
  );
}

export function canUseReportFilter(filterKey: ReportFilterKey, role?: string) {
  const adminScopedRoles: AdminRole[] = [
    "COMPANY_ADMIN",
    "FINANCE",
    "PROCUREMENT",
  ];

  if (filterKey === "departmentId") {
    return adminScopedRoles.includes(role as AdminRole);
  }

  if (filterKey === "requestedBy" || filterKey === "approverId") {
    return role !== "EMPLOYEE";
  }

  return true;
}

export function normalizeReportFilters(
  filters: ReportFilters,
  config: ReportConfig,
  role?: string,
): ReportFilters {
  const visibleFilters = new Set(getVisibleReportFilters(config, role));
  const normalized: ReportFilters = {
    limit: filters.limit ?? REPORT_PAGE_SIZE,
    page: filters.page ?? 1,
  };

  for (const key of config.filters) {
    if (!visibleFilters.has(key)) {
      continue;
    }

    const value = filters[key];

    if (typeof value === "string" && value.trim()) {
      normalized[key] = value.trim();
    }
  }

  return normalized;
}

export function compactReportParams(filters: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value != null),
  );
}

export function normalizeReportList<TItem extends ReportRow>(
  data: ReportListData<TItem> | undefined,
  fallbackFilters: ReportFilters,
): ReportListData<TItem> {
  return {
    items: data?.items ?? [],
    limit: data?.limit ?? fallbackFilters.limit ?? REPORT_PAGE_SIZE,
    page: data?.page ?? fallbackFilters.page ?? 1,
    total: data?.total ?? 0,
  };
}

export function formatReportCurrency(value?: number | string | null) {
  return new Intl.NumberFormat("en", {
    currency: "BDT",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(Number(value ?? 0));
}

export function formatReportDate(value?: number | string | null) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getReportStatusVariant(status?: string) {
  switch (status) {
    case "APPROVED":
    case "CLOSED":
    case "COMPLETED":
    case "PAID":
    case "RECEIVED":
      return "success";
    case "ISSUED":
    case "OPEN":
    case "PARTIALLY_PAID":
    case "SUBMITTED":
      return "info";
    case "CANCELLED":
    case "REJECTED":
      return "warning";
    case "PENDING":
    case "DRAFT":
    default:
      return "default";
  }
}

export function parseContentDispositionFilename(header?: string) {
  if (!header) {
    return undefined;
  }

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i);

  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1].replace(/"/g, ""));
  }

  const fallbackMatch = header.match(/filename="?([^";]+)"?/i);

  return fallbackMatch?.[1];
}

export function getFallbackExportFilename(
  reportType: ReportType,
  format: ReportExportFormat,
) {
  return `${reportType}-report.${format}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}
