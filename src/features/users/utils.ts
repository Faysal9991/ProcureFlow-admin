import type {
  CompanyRole,
  ManagedUser,
  UserRole,
  UserStatus,
} from "./types";

export const USER_PAGE_SIZE = 10;

export const tenantRoles: { label: string; value: UserRole }[] = [
  { label: "Company Admin", value: "COMPANY_ADMIN" },
  { label: "Employee", value: "EMPLOYEE" },
  { label: "Manager", value: "MANAGER" },
  { label: "Procurement", value: "PROCUREMENT" },
  { label: "Finance", value: "FINANCE" },
];

export function getUserRole(role?: string): UserRole {
  if (
    role === "COMPANY_ADMIN" ||
    role === "MANAGER" ||
    role === "PROCUREMENT" ||
    role === "FINANCE"
  ) {
    return role;
  }

  return "EMPLOYEE";
}

export function getUserRoleLabel(role?: string) {
  return tenantRoles.find((item) => item.value === role)?.label ?? "Employee";
}

export function getUserStatus(status?: string): UserStatus {
  return status === "INACTIVE" ? "INACTIVE" : "ACTIVE";
}

export function getUserStatusLabel(status?: string) {
  return getUserStatus(status) === "ACTIVE" ? "Active" : "Inactive";
}

export function formatUserDate(value?: string) {
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

export function getUserMutationError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("forbidden")) {
    return "You do not have permission to manage users.";
  }

  if (normalized.includes("plan")) {
    return "This company has reached its plan user limit.";
  }

  return message;
}

export function getDefaultCompanyRoleId(
  companyRoles: CompanyRole[],
  role: UserRole,
) {
  return (
    companyRoles.find(
      (companyRole) =>
        companyRole.isActive !== false && companyRole.templateKey === role,
    )?.id ?? ""
  );
}

export function getUserCompanyRoleId(user: ManagedUser | null) {
  return user?.companyRole?.id ?? "";
}

export function normalizeOptionalString(value?: string) {
  const trimmed = value?.trim() ?? "";

  return trimmed || undefined;
}
