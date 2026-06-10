"use client";

import { Label } from "@/components/ui/label";
import type { Department } from "@/features/departments/types";
import { cn } from "@/lib/utils/cn";
import type { BudgetPeriodType, BudgetStatus } from "../types";
import {
  budgetPeriodTypes,
  budgetStatuses,
} from "../utils";

type BudgetFiltersProps = {
  dateFrom: string;
  dateTo: string;
  departmentId: string;
  departments: Department[];
  isDisabled?: boolean;
  periodType: "ALL" | BudgetPeriodType;
  resultCount: number;
  showDepartmentFilter: boolean;
  status: "ALL" | BudgetStatus;
  totalCount: number;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onPeriodTypeChange: (value: "ALL" | BudgetPeriodType) => void;
  onStatusChange: (value: "ALL" | BudgetStatus) => void;
};

export function BudgetFilters({
  dateFrom,
  dateTo,
  departmentId,
  departments,
  isDisabled = false,
  periodType,
  resultCount,
  showDepartmentFilter,
  status,
  totalCount,
  onDateFromChange,
  onDateToChange,
  onDepartmentChange,
  onPeriodTypeChange,
  onStatusChange,
}: BudgetFiltersProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[180px_180px_220px_150px_150px]">
          <div className="space-y-2">
            <Label htmlFor="budget-status-filter">Status</Label>
            <select
              id="budget-status-filter"
              className={inputClassName}
              disabled={isDisabled}
              value={status}
              onChange={(event) =>
                onStatusChange(event.target.value as "ALL" | BudgetStatus)
              }
            >
              <option value="ALL">All statuses</option>
              {budgetStatuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-period-filter">Period Type</Label>
            <select
              id="budget-period-filter"
              className={inputClassName}
              disabled={isDisabled}
              value={periodType}
              onChange={(event) =>
                onPeriodTypeChange(
                  event.target.value as "ALL" | BudgetPeriodType,
                )
              }
            >
              <option value="ALL">All periods</option>
              {budgetPeriodTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {showDepartmentFilter ? (
            <div className="space-y-2">
              <Label htmlFor="budget-department-filter">Department</Label>
              <select
                id="budget-department-filter"
                className={inputClassName}
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

          <div className="space-y-2">
            <Label htmlFor="budget-date-from">From</Label>
            <input
              id="budget-date-from"
              className={inputClassName}
              disabled={isDisabled}
              type="date"
              value={dateFrom}
              onChange={(event) => onDateFromChange(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-date-to">To</Label>
            <input
              id="budget-date-to"
              className={inputClassName}
              disabled={isDisabled}
              type="date"
              value={dateTo}
              onChange={(event) => onDateToChange(event.target.value)}
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {resultCount} of {totalCount} budgets
        </p>
      </div>
    </div>
  );
}

const inputClassName = cn(
  "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors",
  "placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
);
