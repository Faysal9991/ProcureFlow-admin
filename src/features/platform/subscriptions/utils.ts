import type { AssignPlatformPlanRequest } from "@/features/platform/companies/types";
import type { PlatformAssignPlanValues } from "./schemas";

export const PLATFORM_SUBSCRIPTION_COMPANY_PAGE_SIZE = 10;

export function getTodayInputDate() {
  return formatDateInput(new Date());
}

export function addDaysToInputDate(value: string, days: number) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateInput(date);
}

export function toAssignPlanPayload(
  values: PlatformAssignPlanValues,
): AssignPlatformPlanRequest {
  const startDate = values.startDate?.trim() || getTodayInputDate();
  const endDate = values.endDate?.trim() || addDaysToInputDate(startDate, 30);

  return {
    endDate,
    planId: values.planId,
    startDate,
  };
}

export function getSubscriptionStatusVariant(status?: string) {
  const normalized = (status ?? "").toUpperCase();

  if (normalized === "ACTIVE") {
    return "success";
  }
  if (normalized === "PENDING") {
    return "warning";
  }
  if (normalized === "CANCELLED" || normalized === "EXPIRED") {
    return "error";
  }
  return "default";
}

export function getAssignPlanMutationError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("plan limit")) {
    return "The selected plan cannot support this company’s current usage.";
  }
  if (normalized.includes("inactive")) {
    return "Choose an active plan before assigning it.";
  }
  if (normalized.includes("forbidden")) {
    return "Only super admins can assign company subscriptions.";
  }
  if (normalized.includes("validation")) {
    return "Check the assignment dates and selected plan.";
  }

  return message || "Plan assignment failed.";
}

function formatDateInput(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
