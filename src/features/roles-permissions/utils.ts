import type { CompanyRole, Permission } from "./types";

export const ASSIGNABLE_USER_LIMIT = 100;

const keyPrefixGroupLabels: Record<string, string> = {
  attachment: "Attachments",
  audit: "Audit",
  budget: "Budget",
  invoice: "Invoices",
  payment: "Payments",
  platform: "Platform",
  purchase_order: "Purchase Orders",
  report: "Reports",
  rfq: "RFQ",
  vendor: "Vendors",
};

const categoryLabels: Record<string, string> = {
  budgets: "Budget",
  rfqs: "RFQ",
};

export function canManageRoles(role?: string) {
  return role === "COMPANY_ADMIN";
}

export function isCompanyAdminTemplate(role?: Pick<CompanyRole, "templateKey">) {
  return role?.templateKey === "COMPANY_ADMIN";
}

export function normalizeOptionalString(value?: string) {
  const trimmed = value?.trim() ?? "";

  return trimmed || undefined;
}

export function getRoleStatusLabel(role: CompanyRole) {
  return role.isActive ? "Active" : "Inactive";
}

export function getRoleTypeLabel(role: CompanyRole) {
  return role.isSystemTemplate ? "System template" : "Custom role";
}

export function getRoleMutationError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("forbidden")) {
    return "Only company admins can manage roles and permissions.";
  }

  if (normalized.includes("already exists")) {
    return "A company role with this name already exists.";
  }

  if (normalized.includes("company admin role")) {
    return "The Company Admin role must remain active and keep all permissions.";
  }

  if (normalized.includes("permission not found")) {
    return "One or more selected permissions are no longer available.";
  }

  return message;
}

export function getPermissionGroup(permission: Permission) {
  const category = permission.category?.trim();

  if (category) {
    return categoryLabels[category.toLowerCase()] ?? category;
  }

  const prefix = permission.key.split(".")[0] ?? "other";

  return keyPrefixGroupLabels[prefix] ?? toTitleCase(prefix.replaceAll("_", " "));
}

export function groupPermissions(permissions: Permission[]) {
  const groups = new Map<string, Permission[]>();

  permissions.forEach((permission) => {
    const group = getPermissionGroup(permission);
    groups.set(group, [...(groups.get(group) ?? []), permission]);
  });

  return Array.from(groups.entries())
    .map(([group, items]) => ({
      group,
      permissions: [...items].sort((a, b) => a.key.localeCompare(b.key)),
    }))
    .sort((a, b) => groupSortScore(a.group) - groupSortScore(b.group));
}

export function rolePermissionIds(role: CompanyRole | null | undefined) {
  return role?.permissions.map((permission) => permission.id) ?? [];
}

export function formatPermissionAction(permission: Permission) {
  const action = permission.key.split(".").at(-1) ?? permission.key;

  return toTitleCase(action.replaceAll("_", " "));
}

function toTitleCase(value: string) {
  return value.replace(/\w\S*/g, (word) =>
    `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`,
  );
}

function groupSortScore(group: string) {
  const order = [
    "Reports",
    "Budget",
    "Attachments",
    "Purchase Orders",
    "Invoices",
    "Payments",
    "RFQ",
    "Vendors",
    "Audit",
    "Platform",
  ];
  const index = order.indexOf(group);

  return index === -1 ? order.length : index;
}
