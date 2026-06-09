"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Department } from "@/features/departments/types";
import { cn } from "@/lib/utils/cn";
import type {
  PurchaseRequestPriority,
  PurchaseRequestStatus,
} from "../types";
import { requestPriorities, requestStatuses } from "../utils";

type PurchaseRequestFiltersProps = {
  dateFrom: string;
  dateTo: string;
  departmentId: string;
  departments: Department[];
  isDisabled?: boolean;
  priority: "ALL" | PurchaseRequestPriority;
  resultCount: number;
  search: string;
  showDepartmentFilter?: boolean;
  showStatusFilter?: boolean;
  status: "ALL" | PurchaseRequestStatus;
  totalCount: number;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onPriorityChange: (value: "ALL" | PurchaseRequestPriority) => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "ALL" | PurchaseRequestStatus) => void;
};

export function PurchaseRequestFilters({
  dateFrom,
  dateTo,
  departmentId,
  departments,
  isDisabled = false,
  priority,
  resultCount,
  search,
  showDepartmentFilter = true,
  showStatusFilter = true,
  status,
  totalCount,
  onDateFromChange,
  onDateToChange,
  onDepartmentChange,
  onPriorityChange,
  onSearchChange,
  onStatusChange,
}: PurchaseRequestFiltersProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(240px,340px)_170px_170px_170px_170px_220px]">
          <div className="space-y-2">
            <Label htmlFor="purchase-request-search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="purchase-request-search"
                className="pl-9"
                disabled={isDisabled}
                placeholder="Search title or requester"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </div>
          </div>

          {showStatusFilter ? (
            <div className="space-y-2">
              <Label htmlFor="purchase-request-status-filter">Status</Label>
              <select
                id="purchase-request-status-filter"
                className={selectClassName}
                disabled={isDisabled}
                value={status}
                onChange={(event) =>
                  onStatusChange(
                    event.target.value as "ALL" | PurchaseRequestStatus,
                  )
                }
              >
                <option value="ALL">All statuses</option>
                {requestStatuses.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="purchase-request-priority-filter">Priority</Label>
            <select
              id="purchase-request-priority-filter"
              className={selectClassName}
              disabled={isDisabled}
              value={priority}
              onChange={(event) =>
                onPriorityChange(
                  event.target.value as "ALL" | PurchaseRequestPriority,
                )
              }
            >
              <option value="ALL">All priorities</option>
              {requestPriorities.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchase-request-date-from">Needed From</Label>
            <Input
              id="purchase-request-date-from"
              disabled={isDisabled}
              type="date"
              value={dateFrom}
              onChange={(event) => onDateFromChange(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchase-request-date-to">Needed To</Label>
            <Input
              id="purchase-request-date-to"
              disabled={isDisabled}
              type="date"
              value={dateTo}
              onChange={(event) => onDateToChange(event.target.value)}
            />
          </div>

          {showDepartmentFilter ? (
            <div className="space-y-2">
              <Label htmlFor="purchase-request-department-filter">
                Department
              </Label>
              <select
                id="purchase-request-department-filter"
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
          ) : null}
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {resultCount} of {totalCount} requests
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
