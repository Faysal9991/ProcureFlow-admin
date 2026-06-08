"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import type { Department } from "@/features/departments/types";
import type { UserRole, UserStatus } from "../types";
import { tenantRoles } from "../utils";

type UserFiltersProps = {
  departmentId: string;
  departments: Department[];
  isDisabled?: boolean;
  resultCount: number;
  role: "ALL" | UserRole;
  search: string;
  status: "ALL" | UserStatus;
  totalCount: number;
  onDepartmentChange: (value: string) => void;
  onRoleChange: (value: "ALL" | UserRole) => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "ALL" | UserStatus) => void;
};

export function UserFilters({
  departmentId,
  departments,
  isDisabled = false,
  resultCount,
  role,
  search,
  status,
  totalCount,
  onDepartmentChange,
  onRoleChange,
  onSearchChange,
  onStatusChange,
}: UserFiltersProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(240px,340px)_180px_220px_180px]">
          <div className="space-y-2">
            <Label htmlFor="user-search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="user-search"
                className="pl-9"
                disabled={isDisabled}
                placeholder="Search name, email, phone"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-role-filter">Role</Label>
            <select
              id="user-role-filter"
              className={selectClassName}
              disabled={isDisabled}
              value={role}
              onChange={(event) =>
                onRoleChange(event.target.value as "ALL" | UserRole)
              }
            >
              <option value="ALL">All roles</option>
              {tenantRoles.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-department-filter">Department</Label>
            <select
              id="user-department-filter"
              className={selectClassName}
              disabled={isDisabled}
              value={departmentId}
              onChange={(event) => onDepartmentChange(event.target.value)}
            >
              <option value="">All departments</option>
              {departments.map((department) => (
                <option key={department.uuid} value={department.uuid}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-status-filter">Status</Label>
            <select
              id="user-status-filter"
              className={selectClassName}
              disabled={isDisabled}
              value={status}
              onChange={(event) =>
                onStatusChange(event.target.value as "ALL" | UserStatus)
              }
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {resultCount} of {totalCount} users
        </p>
      </div>
    </div>
  );
}

const selectClassName = cn(
  "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors",
  "focus:border-primary focus:ring-4 focus:ring-ring",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
);
