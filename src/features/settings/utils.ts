import type { AdminRole } from "@/types/auth";
import type { ApprovalWorkflow } from "@/features/approval-workflows/types";

export const settingsViewerRoles: AdminRole[] = [
  "COMPANY_ADMIN",
  "FINANCE",
  "PROCUREMENT",
];

export const currencyOptions = ["BDT", "USD", "EUR", "GBP", "INR"];

export const fiscalMonthOptions = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

export function canViewSettings(role?: string) {
  return settingsViewerRoles.includes(role as AdminRole);
}

export function canManageSettings(role?: string) {
  return role === "COMPANY_ADMIN";
}

export function getSettingsErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("email is already in use")) {
    return "That company email is already used by another company.";
  }
  if (normalized.includes("default workflow")) {
    return "Choose an active approval workflow from this company.";
  }
  if (normalized.includes("password change is required")) {
    return "Your password must be changed before updating settings.";
  }
  if (normalized.includes("forbidden")) {
    return "You do not have permission to update company settings.";
  }

  return message || "Company settings update failed.";
}

export function workflowRuleLabel(workflow: ApprovalWorkflow) {
  const rules: string[] = [];

  if (workflow.departmentId) {
    rules.push("Department rule");
  }
  if (workflow.minAmount != null || workflow.maxAmount != null) {
    const min = workflow.minAmount == null ? "0" : formatAmount(workflow.minAmount);
    const max = workflow.maxAmount == null ? "No max" : formatAmount(workflow.maxAmount);
    rules.push(`${min} - ${max}`);
  }
  if (workflow.isDefault) {
    rules.push("Legacy default");
  }

  return rules.length > 0 ? rules.join(" · ") : "Company-wide workflow";
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("en", {
    currency: "BDT",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}
