import type {
  CreatePlatformPlanRequest,
  PlatformPlan,
} from "@/features/platform/companies/types";
import type { PlatformPlanFormValues } from "./schemas";

export function formatPlanLimit(value?: number | null, suffix = "") {
  if (value == null) {
    return "Unlimited";
  }

  return `${value.toLocaleString()}${suffix}`;
}

export function formatPlatformMoney(value?: number | string | null) {
  return new Intl.NumberFormat("en", {
    currency: "BDT",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(Number(value ?? 0));
}

export function getPlanStatusLabel(isActive: boolean) {
  return isActive ? "Active" : "Inactive";
}

export function getPlanStatusVariant(isActive: boolean) {
  return isActive ? "success" : "warning";
}

export function getPlanDefaultValues(
  plan?: PlatformPlan | null,
): PlatformPlanFormValues {
  return {
    isActive: plan?.isActive ?? true,
    maxDepartments: plan?.maxDepartments?.toString() ?? "",
    maxRequestsPerMonth: plan?.maxRequestsPerMonth?.toString() ?? "",
    maxStorageMb: plan?.maxStorageMb?.toString() ?? "",
    maxUsers: plan?.maxUsers?.toString() ?? "",
    name: plan?.name ?? "",
    price: plan?.price ?? 0,
  };
}

export function toPlanPayload(
  values: PlatformPlanFormValues,
): CreatePlatformPlanRequest {
  return {
    isActive: values.isActive,
    maxDepartments: parseLimit(values.maxDepartments),
    maxRequestsPerMonth: parseLimit(values.maxRequestsPerMonth),
    maxStorageMb: parseLimit(values.maxStorageMb),
    maxUsers: parseLimit(values.maxUsers),
    name: values.name.trim(),
    price: Number(values.price),
  };
}

export function getPlanMutationError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("already exists")) {
    return "A plan already exists with this name.";
  }
  if (normalized.includes("forbidden")) {
    return "Only super admins can manage platform plans.";
  }
  if (normalized.includes("validation")) {
    return "Check the plan values and try again.";
  }

  return message || "Plan operation failed.";
}

function parseLimit(value: string) {
  const trimmed = value.trim();
  return trimmed ? Number(trimmed) : null;
}
