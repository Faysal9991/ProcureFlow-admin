import type { Department } from "@/features/departments/types";
import type { AdminRole } from "@/types/auth";
import type {
  ApprovalWorkflow,
  ApprovalWorkflowStep,
  WorkflowApproverRole,
} from "./types";

export const workflowApproverRoles: {
  label: string;
  value: WorkflowApproverRole;
}[] = [
  { label: "Manager", value: "MANAGER" },
  { label: "Procurement", value: "PROCUREMENT" },
  { label: "Finance", value: "FINANCE" },
  { label: "Company Admin", value: "COMPANY_ADMIN" },
];

const readableRoles: AdminRole[] = ["COMPANY_ADMIN", "PROCUREMENT"];

export function canReadApprovalWorkflows(role?: string) {
  return readableRoles.includes(role as AdminRole);
}

export function canManageApprovalWorkflows(role?: string) {
  return role === "COMPANY_ADMIN";
}

export function getApproverRoleLabel(role?: string) {
  return (
    workflowApproverRoles.find((item) => item.value === role)?.label ??
    role ??
    "Not set"
  );
}

export function getDepartmentName(
  departments: Department[],
  departmentId?: string | null,
) {
  if (!departmentId) {
    return "All departments";
  }

  return (
    departments.find((department) => department.uuid === departmentId)?.name ??
    "Unknown department"
  );
}

export function getWorkflowRuleLabel(
  workflow: Pick<ApprovalWorkflow, "departmentId" | "maxAmount" | "minAmount">,
  departments: Department[],
) {
  const department = getDepartmentName(departments, workflow.departmentId);
  const min = workflow.minAmount;
  const max = workflow.maxAmount;
  const amount =
    min == null && max == null
      ? "Any amount"
      : `${min == null ? "0" : formatWorkflowCurrency(min)} - ${
          max == null ? "No max" : formatWorkflowCurrency(max)
        }`;

  return `${department} · ${amount}`;
}

export function getWorkflowStepSummary(
  steps?: ApprovalWorkflowStep[] | null,
) {
  const count = steps?.length ?? 0;

  if (count === 0) {
    return "No steps";
  }

  return `${count} ${count === 1 ? "step" : "steps"}`;
}

export function formatWorkflowCurrency(value?: number | null) {
  if (value == null) {
    return "Not set";
  }

  return new Intl.NumberFormat("en", {
    currency: "BDT",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(Number(value));
}

export function formatWorkflowDate(value?: string) {
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

export function getWorkflowMutationError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("forbidden")) {
    return "You do not have permission to manage approval workflows.";
  }

  if (normalized.includes("active workflow steps")) {
    return "Active workflow steps cannot be modified. Deactivate the workflow first.";
  }

  if (normalized.includes("default")) {
    return "One active default approval workflow is required.";
  }

  if (normalized.includes("overlap")) {
    return "This active workflow overlaps another active workflow rule.";
  }

  if (normalized.includes("amount")) {
    return "Check the minimum and maximum amount range.";
  }

  if (normalized.includes("step")) {
    return "Check step order, role, and required status.";
  }

  return message;
}

export function parseOptionalAmount(value?: string) {
  const trimmed = value?.trim() ?? "";

  if (trimmed === "") {
    return null;
  }

  return Number(trimmed);
}

export function sortWorkflowSteps(steps?: ApprovalWorkflowStep[]) {
  return [...(steps ?? [])].sort((a, b) => a.stepOrder - b.stepOrder);
}
