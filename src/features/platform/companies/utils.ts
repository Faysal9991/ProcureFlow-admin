import type { PlatformCompanyAction, PlatformCompanyStatus } from "./types";

export const PLATFORM_COMPANY_PAGE_SIZE = 10;

export const platformCompanyStatuses: {
  label: string;
  value: PlatformCompanyStatus;
}[] = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Suspended", value: "SUSPENDED" },
];

export function canManagePlatformCompanies(role?: string) {
  return role === "SUPER_ADMIN";
}

export function getCompanyStatus(status?: string) {
  const normalized = (status ?? "").toUpperCase();
  if (normalized === "ACTIVE" || normalized === "SUSPENDED") {
    return normalized;
  }
  return "INACTIVE";
}

export function getCompanyStatusLabel(status?: string) {
  const value = getCompanyStatus(status);
  return (
    platformCompanyStatuses.find((item) => item.value === value)?.label ??
    value
  );
}

export function getCompanyStatusVariant(status?: string) {
  switch (getCompanyStatus(status)) {
    case "ACTIVE":
      return "success";
    case "SUSPENDED":
      return "error";
    case "INACTIVE":
    default:
      return "warning";
  }
}

export function formatPlatformDate(value?: string | null) {
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

export function formatPlatformCurrency(value?: number | string | null) {
  return new Intl.NumberFormat("en", {
    currency: "BDT",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(Number(value ?? 0));
}

export function formatLimit(value?: number | null, suffix = "") {
  if (value == null) {
    return "Unlimited";
  }
  return `${value.toLocaleString()}${suffix}`;
}

export function getCompanyActionLabel(action: PlatformCompanyAction) {
  return action === "activate" ? "Activate company" : "Suspend company";
}

export function getCompanyActionDescription(
  action: PlatformCompanyAction,
  name: string,
) {
  if (action === "activate") {
    return `This will restore tenant access for ${name}.`;
  }

  return `This will suspend tenant access for ${name}. Users from this company will be blocked from tenant APIs.`;
}

export function getPlatformMutationError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("already exists")) {
    return "A platform resource already exists with those details.";
  }
  if (normalized.includes("plan is inactive")) {
    return "Choose an active plan before creating the company.";
  }
  if (normalized.includes("plan limit")) {
    return "The selected plan cannot support the initial admin user.";
  }
  if (normalized.includes("validation")) {
    return "Check the form values and try again.";
  }
  if (normalized.includes("forbidden")) {
    return "Only super admins can manage platform companies.";
  }

  return message || "Platform company operation failed.";
}
