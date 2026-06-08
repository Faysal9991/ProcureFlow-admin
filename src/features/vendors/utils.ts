import type { VendorStatus } from "./types";

export const VENDOR_PAGE_SIZE = 10;

export function getVendorStatus(status?: string): VendorStatus {
  return status === "INACTIVE" ? "INACTIVE" : "ACTIVE";
}

export function getVendorStatusLabel(status?: string) {
  return getVendorStatus(status) === "ACTIVE" ? "Active" : "Inactive";
}

export function formatVendorDate(value?: string) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getVendorMutationError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("forbidden")) {
    return "You do not have permission to manage vendors.";
  }

  if (normalized.includes("already exists")) {
    return "A vendor with this name already exists for this company.";
  }

  return message;
}

export function normalizeOptionalString(value?: string) {
  const trimmed = value?.trim() ?? "";

  return trimmed || undefined;
}
