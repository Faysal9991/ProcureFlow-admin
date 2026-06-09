import type { AdminRole, AuthUser } from "@/types/auth";
import type {
  ApprovalStatus,
  PurchaseRequest,
  PurchaseRequestPriority,
  PurchaseRequestStatus,
} from "./types";

export const PURCHASE_REQUEST_PAGE_SIZE = 10;

export const requestStatuses: {
  label: string;
  value: PurchaseRequestStatus;
}[] = [
  { label: "Draft", value: "DRAFT" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "PO Created", value: "PO_CREATED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export const requestPriorities: {
  label: string;
  value: PurchaseRequestPriority;
}[] = [
  { label: "Low", value: "LOW" },
  { label: "Normal", value: "NORMAL" },
  { label: "High", value: "HIGH" },
  { label: "Urgent", value: "URGENT" },
];

export const approvalRoles: AdminRole[] = [
  "COMPANY_ADMIN",
  "FINANCE",
  "MANAGER",
  "PROCUREMENT",
];

const tenantRoles: AdminRole[] = [
  "COMPANY_ADMIN",
  "EMPLOYEE",
  "FINANCE",
  "MANAGER",
  "PROCUREMENT",
];

export function canAccessPurchaseRequests(role?: string) {
  return tenantRoles.includes(role as AdminRole);
}

export function canCreatePurchaseRequest(role?: string) {
  return canAccessPurchaseRequests(role);
}

export function canAccessApprovalInbox(role?: string) {
  return approvalRoles.includes(role as AdminRole);
}

export function canUseCompanyRequestScope(role?: string) {
  return (
    role === "COMPANY_ADMIN" ||
    role === "FINANCE" ||
    role === "MANAGER" ||
    role === "PROCUREMENT"
  );
}

export function canUseDepartmentFilter(role?: string) {
  return role === "COMPANY_ADMIN" || role === "FINANCE" || role === "PROCUREMENT";
}

export function getRequestListScope(role?: string) {
  return canUseCompanyRequestScope(role) ? "company" : "my";
}

export function isRequestOwner(request: PurchaseRequest, user: AuthUser | null) {
  return !!user?.uuid && request.requestedBy === user.uuid;
}

export function canEditRequest(request: PurchaseRequest, user: AuthUser | null) {
  return isRequestOwner(request, user) && request.status === "DRAFT";
}

export function canSubmitRequest(
  request: PurchaseRequest,
  user: AuthUser | null,
) {
  return isRequestOwner(request, user) && request.status === "DRAFT";
}

export function canCancelRequest(
  request: PurchaseRequest,
  user: AuthUser | null,
) {
  return (
    isRequestOwner(request, user) &&
    (request.status === "DRAFT" || request.status === "SUBMITTED")
  );
}

export function canShowApprovalActions(
  request: PurchaseRequest,
  user: AuthUser | null,
) {
  return (
    request.status === "SUBMITTED" &&
    request.requestedBy !== user?.uuid &&
    canAccessApprovalInbox(user?.role)
  );
}

export function getRequestStatusLabel(status?: string) {
  return (
    requestStatuses.find((item) => item.value === status)?.label ??
    status ??
    "Unknown"
  );
}

export function getRequestStatusVariant(status?: string) {
  switch (status as PurchaseRequestStatus) {
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "error";
    case "SUBMITTED":
      return "info";
    case "PO_CREATED":
      return "primary";
    case "CANCELLED":
      return "warning";
    case "DRAFT":
    default:
      return "default";
  }
}

export function getApprovalStatusLabel(status?: string) {
  switch (status as ApprovalStatus) {
    case "NOT_STARTED":
      return "Not Started";
    case "IN_REVIEW":
      return "In Review";
    case "PENDING":
      return "Pending";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status ?? "Unknown";
  }
}

export function getPriorityLabel(priority?: string) {
  return (
    requestPriorities.find((item) => item.value === priority)?.label ??
    priority ??
    "Normal"
  );
}

export function getPriorityVariant(priority?: string) {
  switch (priority as PurchaseRequestPriority) {
    case "URGENT":
      return "error";
    case "HIGH":
      return "warning";
    case "LOW":
      return "default";
    case "NORMAL":
    default:
      return "info";
  }
}

export function calculateItemTotal(quantity?: number, unitPrice?: number) {
  return Number(quantity || 0) * Number(unitPrice || 0);
}

export function calculateRequestTotal(
  items: { estimatedUnitPrice?: number; quantity?: number }[],
) {
  return items.reduce(
    (sum, item) => sum + calculateItemTotal(item.quantity, item.estimatedUnitPrice),
    0,
  );
}

export function formatCurrency(value?: number) {
  return new Intl.NumberFormat("en", {
    currency: "BDT",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(Number(value ?? 0));
}

export function formatRequestDate(value?: string | null) {
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

export function normalizeOptionalString(value?: string) {
  const trimmed = value?.trim() ?? "";

  return trimmed || undefined;
}

export function getPurchaseRequestMutationError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("forbidden")) {
    return "You do not have permission to perform this purchase request action.";
  }

  if (normalized.includes("draft")) {
    return "Only draft requests can be edited or submitted.";
  }

  if (normalized.includes("approval")) {
    return "This request is not available for your approval step.";
  }

  return message;
}
