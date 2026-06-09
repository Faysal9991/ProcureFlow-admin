import type { AdminRole } from "@/types/auth";
import type { RFQ, RFQStatus } from "./types";

export const RFQ_PAGE_SIZE = 10;

export const rfqStatuses: { label: string; value: RFQStatus }[] = [
  { label: "Draft", value: "DRAFT" },
  { label: "Open", value: "OPEN" },
  { label: "Quotation Received", value: "QUOTATION_RECEIVED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const readableRoles: AdminRole[] = [
  "COMPANY_ADMIN",
  "FINANCE",
  "MANAGER",
  "PROCUREMENT",
];
const manageableRoles: AdminRole[] = ["COMPANY_ADMIN", "PROCUREMENT"];

export function canReadRFQs(role?: string) {
  return readableRoles.includes(role as AdminRole);
}

export function canManageRFQs(role?: string) {
  return manageableRoles.includes(role as AdminRole);
}

export function canCompareRFQs(role?: string) {
  return canReadRFQs(role);
}

export function canAddVendors(rfq: RFQ, role?: string) {
  return canManageRFQs(role) && rfq.status === "DRAFT";
}

export function canOpenRFQ(rfq: RFQ, role?: string) {
  return canManageRFQs(role) && rfq.status === "DRAFT";
}

export function canCancelRFQ(rfq: RFQ, role?: string) {
  return (
    canManageRFQs(role) &&
    ["DRAFT", "OPEN", "QUOTATION_RECEIVED"].includes(rfq.status)
  );
}

export function canAddQuotation(rfq: RFQ, role?: string) {
  return (
    canManageRFQs(role) &&
    ["OPEN", "QUOTATION_RECEIVED"].includes(rfq.status)
  );
}

export function canSelectQuotation(rfq: RFQ, role?: string) {
  return canManageRFQs(role) && rfq.status === "QUOTATION_RECEIVED";
}

export function canCreatePOFromRFQ(rfq: RFQ, role?: string) {
  return (
    canManageRFQs(role) &&
    rfq.status === "COMPLETED" &&
    !!rfq.selectedQuotationId
  );
}

export function getRFQStatusLabel(status?: string) {
  return (
    rfqStatuses.find((item) => item.value === status)?.label ??
    status ??
    "Unknown"
  );
}

export function getRFQStatusVariant(status?: string) {
  switch (status as RFQStatus) {
    case "OPEN":
      return "info";
    case "QUOTATION_RECEIVED":
      return "warning";
    case "COMPLETED":
      return "success";
    case "CANCELLED":
      return "error";
    case "DRAFT":
    default:
      return "default";
  }
}

export function formatCurrency(value?: number) {
  return new Intl.NumberFormat("en", {
    currency: "BDT",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(Number(value ?? 0));
}

export function formatRFQDate(value?: string | null) {
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

export function calculateQuotationTotal(
  items: { quantity?: number; unitPrice?: number }[],
) {
  return items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
    0,
  );
}

export function normalizeOptionalString(value?: string) {
  const trimmed = value?.trim() ?? "";

  return trimmed || undefined;
}

export function getRFQMutationError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("forbidden")) {
    return "You do not have permission to perform this RFQ action.";
  }

  if (normalized.includes("draft")) {
    return "This action is only available while the RFQ is in draft.";
  }

  if (normalized.includes("vendor")) {
    return "The selected vendor is unavailable or already has a quotation.";
  }

  if (normalized.includes("quotation")) {
    return "Quotation data is invalid for the current RFQ state.";
  }

  if (normalized.includes("approved")) {
    return "Only approved purchase requests can be converted into RFQs.";
  }

  return message;
}
