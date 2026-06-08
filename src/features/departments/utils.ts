import type { Department, DepartmentStatus } from "./types";

export const DEPARTMENT_PAGE_SIZE = 10;

export function getDepartmentStatus(status?: string): DepartmentStatus {
  return status === "INACTIVE" ? "INACTIVE" : "ACTIVE";
}

export function getDepartmentStatusLabel(status?: string) {
  return getDepartmentStatus(status) === "ACTIVE" ? "Active" : "Inactive";
}

export function filterDepartments({
  departments,
  search,
  status,
}: {
  departments: Department[];
  search: string;
  status: "ALL" | DepartmentStatus;
}) {
  const normalizedSearch = search.trim().toLowerCase();

  return departments.filter((department) => {
    const matchesSearch =
      !normalizedSearch ||
      department.name.toLowerCase().includes(normalizedSearch) ||
      department.description.toLowerCase().includes(normalizedSearch);
    const matchesStatus =
      status === "ALL" || getDepartmentStatus(department.status) === status;

    return matchesSearch && matchesStatus;
  });
}

export function getDepartmentMutationError(message: string) {
  if (message.toLowerCase().includes("forbidden")) {
    return "You do not have permission to manage departments.";
  }

  return message;
}
