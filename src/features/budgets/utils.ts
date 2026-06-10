import type { AdminRole } from "@/types/auth";
import type {
  Budget,
  BudgetAction,
  BudgetPeriodType,
  BudgetStatus,
  BudgetTransactionType,
} from "./types";

export const BUDGET_PAGE_SIZE = 10;

export const budgetStatuses: { label: string; value: BudgetStatus }[] = [
  { label: "Draft", value: "DRAFT" },
  { label: "Active", value: "ACTIVE" },
  { label: "Closed", value: "CLOSED" },
];

export const budgetPeriodTypes: {
  label: string;
  value: BudgetPeriodType;
}[] = [
  { label: "Monthly", value: "MONTHLY" },
  { label: "Quarterly", value: "QUARTERLY" },
  { label: "Yearly", value: "YEARLY" },
  { label: "Custom", value: "CUSTOM" },
];

export const budgetTransactionTypes: {
  label: string;
  value: BudgetTransactionType;
}[] = [
  { label: "Reserved", value: "RESERVED" },
  { label: "Released", value: "RELEASED" },
  { label: "Consumed", value: "CONSUMED" },
  { label: "Adjusted", value: "ADJUSTED" },
];

export function canViewBudgets(permissions: string[], role?: string) {
  return role !== "SUPER_ADMIN" && permissions.includes("budget.view");
}

export function canManageBudgets(permissions: string[], role?: string) {
  return role !== "SUPER_ADMIN" && permissions.includes("budget.manage");
}

export function canAdjustBudgets(permissions: string[], role?: string) {
  return role !== "SUPER_ADMIN" && permissions.includes("budget.adjust");
}

export function canActivateBudgets(permissions: string[], role?: string) {
  return role !== "SUPER_ADMIN" && permissions.includes("budget.activate");
}

export function canCloseBudgets(permissions: string[], role?: string) {
  return role !== "SUPER_ADMIN" && permissions.includes("budget.close");
}

export function canUseBudgetDepartmentFilter(role?: string) {
  const roles: AdminRole[] = ["COMPANY_ADMIN", "FINANCE", "PROCUREMENT"];

  return roles.includes(role as AdminRole);
}

export function canEditBudget(budget?: Budget | null) {
  return budget?.status === "DRAFT" || budget?.status === "ACTIVE";
}

export function canEditBudgetFullDetails(budget?: Budget | null) {
  return budget?.status === "DRAFT";
}

export function canActivateBudget(budget?: Budget | null) {
  return budget?.status === "DRAFT";
}

export function canCloseBudget(budget?: Budget | null) {
  return budget?.status === "ACTIVE";
}

export function canAdjustBudget(budget?: Budget | null) {
  return budget?.status === "ACTIVE";
}

export function getBudgetStatusLabel(status?: string) {
  return (
    budgetStatuses.find((item) => item.value === status)?.label ??
    formatBudgetEnum(status)
  );
}

export function getBudgetPeriodTypeLabel(periodType?: string) {
  return (
    budgetPeriodTypes.find((item) => item.value === periodType)?.label ??
    formatBudgetEnum(periodType)
  );
}

export function getBudgetTransactionTypeLabel(type?: string) {
  return (
    budgetTransactionTypes.find((item) => item.value === type)?.label ??
    formatBudgetEnum(type)
  );
}

export function getBudgetStatusVariant(status?: string) {
  switch (status as BudgetStatus) {
    case "ACTIVE":
      return "success";
    case "CLOSED":
      return "warning";
    case "DRAFT":
    default:
      return "default";
  }
}

export function getBudgetTransactionVariant(type?: string) {
  switch (type as BudgetTransactionType) {
    case "CONSUMED":
      return "error";
    case "RELEASED":
      return "info";
    case "RESERVED":
      return "warning";
    case "ADJUSTED":
    default:
      return "primary";
  }
}

export function getBudgetActionLabel(action: BudgetAction) {
  return action === "activate" ? "Activate budget" : "Close budget";
}

export function getBudgetActionDescription(action: BudgetAction, budget: Budget) {
  if (action === "activate") {
    return `This will activate ${budget.name} after backend overlap validation.`;
  }

  return `This will close ${budget.name}. Closed budgets are read-only.`;
}

export function formatBudgetCurrency(value?: number | string | null) {
  return new Intl.NumberFormat("en", {
    currency: "BDT",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(Number(value ?? 0));
}

export function formatBudgetDate(value?: string | null) {
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

export function formatBudgetDateTime(value?: string | null) {
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

export function toDateInputValue(value?: string | null) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

export function normalizeOptionalString(value?: string) {
  const trimmed = value?.trim() ?? "";

  return trimmed || undefined;
}

export function getBudgetMutationError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("overlap")) {
    return "An active budget already overlaps this department and period.";
  }

  if (normalized.includes("immutable") || normalized.includes("current status")) {
    return "This budget cannot be changed in its current status.";
  }

  if (normalized.includes("insufficient")) {
    return "This adjustment would make the available budget negative.";
  }

  if (normalized.includes("department")) {
    return "Choose an active department that belongs to this company.";
  }

  if (normalized.includes("period")) {
    return "Use a valid budget period and date range.";
  }

  if (normalized.includes("forbidden")) {
    return "You do not have permission to perform this budget action.";
  }

  return message;
}

function formatBudgetEnum(value?: string) {
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
