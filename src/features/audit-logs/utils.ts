import type { AuditJsonValue, AuditLogFilters, AuditOption } from "./types";

export const AUDIT_LOG_PAGE_SIZE = 10;

export const auditActionOptions: AuditOption[] = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "APPROVE",
  "REJECT",
  "SUBMIT",
  "ISSUE",
  "RECEIVE",
  "CLOSE",
  "CANCEL",
  "LOGIN_SUCCESS",
  "LOGIN_FAILED",
  "LOGOUT",
  "REPORT_EXPORT",
  "OPEN",
  "SELECT_QUOTATION",
  "ACTIVATE",
  "DEACTIVATE",
  "ADJUST",
  "SUSPEND",
  "RESET_PASSWORD",
  "ASSIGN_ROLE",
  "ASSIGN_PLAN",
].map((value) => ({ label: formatAuditLabel(value), value }));

export const auditEntityTypeOptions: AuditOption[] = [
  "AUTH",
  "REPORT",
  "PURCHASE_REQUEST",
  "APPROVAL",
  "VENDOR",
  "RFQ",
  "QUOTATION",
  "PURCHASE_ORDER",
  "GOODS_RECEIVE",
  "INVOICE",
  "PAYMENT",
  "BUDGET",
  "ATTACHMENT",
  "WORKFLOW",
  "ROLE",
  "USER",
  "COMPANY",
  "PLAN",
  "SUBSCRIPTION",
].map((value) => ({ label: formatAuditLabel(value), value }));

export function canViewAuditLogs(permissions: string[], role?: string) {
  return role !== "SUPER_ADMIN" && permissions.includes("audit.view");
}

export function canViewEntityHistory(permissions: string[]) {
  return permissions.includes("audit.entity_history.view");
}

export function shouldUseEntityHistory(
  filters: AuditLogFilters,
  hasEntityHistoryPermission: boolean,
) {
  return (
    hasEntityHistoryPermission &&
    Boolean(filters.entityType?.trim()) &&
    Boolean(filters.entityId?.trim())
  );
}

export function normalizeAuditFilters(filters: AuditLogFilters): AuditLogFilters {
  const normalized: AuditLogFilters = {
    limit: filters.limit ?? AUDIT_LOG_PAGE_SIZE,
    page: filters.page ?? 1,
  };

  for (const key of [
    "action",
    "dateFrom",
    "dateTo",
    "entityId",
    "entityType",
    "userId",
  ] as const) {
    const value = filters[key];

    if (typeof value === "string" && value.trim()) {
      normalized[key] = value.trim();
    }
  }

  return normalized;
}

export function compactAuditParams(filters: AuditLogFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value != null),
  );
}

export function formatAuditLabel(value?: string) {
  if (!value) {
    return "Unknown";
  }

  return value
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatAuditDate(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getAuditActionVariant(action?: string) {
  switch (action) {
    case "APPROVE":
    case "CREATE":
    case "LOGIN_SUCCESS":
    case "RECEIVE":
      return "success";
    case "ASSIGN_PLAN":
    case "ASSIGN_ROLE":
    case "ISSUE":
    case "OPEN":
    case "REPORT_EXPORT":
    case "SUBMIT":
    case "UPDATE":
      return "info";
    case "CANCEL":
    case "CLOSE":
    case "DEACTIVATE":
    case "DELETE":
    case "LOGIN_FAILED":
    case "REJECT":
    case "RESET_PASSWORD":
    case "SUSPEND":
      return "warning";
    default:
      return "default";
  }
}

export function stringifyJson(value?: AuditJsonValue) {
  if (value == null) {
    return "null";
  }

  return JSON.stringify(value, null, 2);
}

export function getChangedFieldRows(
  oldData?: AuditJsonValue,
  newData?: AuditJsonValue,
) {
  const oldRecord = toPlainRecord(oldData);
  const newRecord = toPlainRecord(newData);
  const keys = Array.from(
    new Set([...Object.keys(oldRecord), ...Object.keys(newRecord)]),
  ).sort((a, b) => a.localeCompare(b));

  if (keys.length === 0 && !isJsonEqual(oldData, newData)) {
    return [
      {
        field: "value",
        newValue: newData,
        oldValue: oldData,
      },
    ];
  }

  return keys
    .filter((key) => !isJsonEqual(oldRecord[key], newRecord[key]))
    .map((key) => ({
      field: key,
      newValue: newRecord[key],
      oldValue: oldRecord[key],
    }));
}

function toPlainRecord(value?: AuditJsonValue) {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return {} as Record<string, AuditJsonValue | undefined>;
  }

  return value as Record<string, AuditJsonValue | undefined>;
}

function isJsonEqual(left?: AuditJsonValue, right?: AuditJsonValue) {
  return JSON.stringify(left ?? null) === JSON.stringify(right ?? null);
}
