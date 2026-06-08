import type { AdminRole } from "@/types/auth";
import type {
  DashboardFilterPreset,
  DashboardFilters,
  DashboardSummary,
} from "./types";

export function formatCurrency(value?: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value ?? 0);
}

export function formatNumber(value?: number) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

export function formatDateLabel(value?: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function canUseDepartmentFilter(role?: string) {
  return role === "COMPANY_ADMIN" || role === "PROCUREMENT" || role === "FINANCE";
}

export function canUseSpendSections(role?: string) {
  return !!role && role !== "EMPLOYEE" && role !== "SUPER_ADMIN";
}

export function canUseOverdueInvoices(role?: string) {
  return (
    role === "COMPANY_ADMIN" || role === "PROCUREMENT" || role === "FINANCE"
  );
}

export function getPresetDateRange(preset: DashboardFilterPreset) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (preset === "thisYear") {
    return {
      dateFrom: toDateInputValue(new Date(year, 0, 1)),
      dateTo: toDateInputValue(new Date(year, 11, 31)),
    };
  }

  if (preset === "thisQuarter") {
    const quarterStartMonth = Math.floor(month / 3) * 3;
    return {
      dateFrom: toDateInputValue(new Date(year, quarterStartMonth, 1)),
      dateTo: toDateInputValue(new Date(year, quarterStartMonth + 3, 0)),
    };
  }

  return {
    dateFrom: toDateInputValue(new Date(year, month, 1)),
    dateTo: toDateInputValue(new Date(year, month + 1, 0)),
  };
}

export function buildFilters({
  dateFrom,
  dateTo,
  departmentId,
  preset,
}: {
  dateFrom: string;
  dateTo: string;
  departmentId: string;
  preset: DashboardFilterPreset;
}): DashboardFilters {
  const range =
    preset === "custom" ? { dateFrom, dateTo } : getPresetDateRange(preset);

  return {
    dateFrom: range.dateFrom,
    dateTo: range.dateTo,
    departmentId: departmentId.trim() || undefined,
  };
}

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getSummaryRole(summary?: DashboardSummary, fallbackRole?: string) {
  return (summary?.role || fallbackRole || "") as AdminRole | string;
}
