"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import type { DepartmentStatus } from "../types";

type DepartmentFiltersProps = {
  resultCount: number;
  search: string;
  status: "ALL" | DepartmentStatus;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "ALL" | DepartmentStatus) => void;
};

export function DepartmentFilters({
  resultCount,
  search,
  status,
  totalCount,
  onSearchChange,
  onStatusChange,
}: DepartmentFiltersProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-3 sm:grid-cols-[minmax(240px,360px)_180px]">
          <div className="space-y-2">
            <Label htmlFor="department-search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="department-search"
                className="pl-9"
                placeholder="Search departments"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department-status">Status</Label>
            <select
              id="department-status"
              className={selectClassName}
              value={status}
              onChange={(event) =>
                onStatusChange(event.target.value as "ALL" | DepartmentStatus)
              }
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {resultCount} of {totalCount} departments
        </p>
      </div>
    </div>
  );
}

const selectClassName = cn(
  "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors",
  "focus:border-primary focus:ring-4 focus:ring-ring",
);
