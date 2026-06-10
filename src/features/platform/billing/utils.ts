import type { PlatformBillingStatus } from "./types";

export const PLATFORM_BILLING_PAGE_SIZE = 10;

export const billingStatuses: {
  label: string;
  value: PlatformBillingStatus;
}[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Paid", value: "PAID" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function getBillingStatus(status?: string) {
  const normalized = (status ?? "").toUpperCase();
  if (
    normalized === "PENDING" ||
    normalized === "PAID" ||
    normalized === "CANCELLED"
  ) {
    return normalized;
  }
  return "PENDING";
}

export function getBillingStatusLabel(status?: string, isOverdue = false) {
  if (isOverdue) {
    return "Overdue";
  }
  return (
    billingStatuses.find((item) => item.value === getBillingStatus(status))
      ?.label ?? "Pending"
  );
}

export function getBillingStatusVariant(status?: string, isOverdue = false) {
  if (isOverdue) {
    return "error";
  }
  switch (getBillingStatus(status)) {
    case "PAID":
      return "success";
    case "CANCELLED":
      return "default";
    case "PENDING":
    default:
      return "warning";
  }
}

export function formatBillingMoney(value?: number | string | null) {
  return new Intl.NumberFormat("en", {
    currency: "BDT",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(Number(value ?? 0));
}

export function formatBillingDate(value?: string | null) {
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

export function getTodayInputDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizeOptional(value?: string) {
  const trimmed = value?.trim() ?? "";
  return trimmed || undefined;
}

export function getBillingMutationError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("payment amount exceeds")) {
    return "Payment amount cannot exceed the remaining invoice due.";
  }
  if (normalized.includes("cannot be modified")) {
    return "This invoice can no longer be modified.";
  }
  if (normalized.includes("forbidden")) {
    return "Only super admins can manage platform billing.";
  }
  if (normalized.includes("validation")) {
    return "Check the billing values and try again.";
  }

  return message || "Platform billing operation failed.";
}
