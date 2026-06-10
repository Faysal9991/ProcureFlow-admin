"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDepartments } from "@/features/departments/hooks";
import { useVendors } from "@/features/vendors/hooks";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";
import type { ReportConfig, ReportFilterKey, ReportFilters } from "../types";
import { getVisibleReportFilters } from "../utils";

type ReportFiltersPanelProps = {
  config: ReportConfig;
  filters: ReportFilters;
  isDisabled?: boolean;
  resultCount: number;
  totalCount: number;
  userRole?: string;
  onFilterChange: (key: ReportFilterKey, value: string) => void;
  onReset: () => void;
};

export function ReportFiltersPanel({
  config,
  filters,
  isDisabled = false,
  resultCount,
  totalCount,
  userRole,
  onFilterChange,
  onReset,
}: ReportFiltersPanelProps) {
  const visibleFilters = getVisibleReportFilters(config, userRole);
  const showDepartments = visibleFilters.includes("departmentId");
  const showVendors = visibleFilters.includes("vendorId");
  const departmentsQuery = useDepartments(showDepartments);
  const vendorsQuery = useVendors(
    { limit: 100, page: 1, status: "ACTIVE" },
    showVendors,
  );

  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleFilters.includes("dateFrom") ? (
            <FilterField label="Date From">
              <Input
                disabled={isDisabled}
                type="date"
                value={filters.dateFrom ?? ""}
                onChange={(event) =>
                  onFilterChange("dateFrom", event.target.value)
                }
              />
            </FilterField>
          ) : null}

          {visibleFilters.includes("dateTo") ? (
            <FilterField label="Date To">
              <Input
                disabled={isDisabled}
                type="date"
                value={filters.dateTo ?? ""}
                onChange={(event) =>
                  onFilterChange("dateTo", event.target.value)
                }
              />
            </FilterField>
          ) : null}

          {showDepartments ? (
            <FilterField label="Department">
              <select
                className={selectClassName}
                disabled={isDisabled || departmentsQuery.isLoading}
                value={filters.departmentId ?? ""}
                onChange={(event) =>
                  onFilterChange("departmentId", event.target.value)
                }
              >
                <option value="">All departments</option>
                {(departmentsQuery.data ?? []).map((department) => (
                  <option key={department.uuid} value={department.uuid}>
                    {department.name}
                  </option>
                ))}
              </select>
            </FilterField>
          ) : null}

          {showVendors ? (
            <FilterField label="Vendor">
              <select
                className={selectClassName}
                disabled={isDisabled || vendorsQuery.isLoading}
                value={filters.vendorId ?? ""}
                onChange={(event) =>
                  onFilterChange("vendorId", event.target.value)
                }
              >
                <option value="">All vendors</option>
                {(vendorsQuery.data?.items ?? []).map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </FilterField>
          ) : null}

          {visibleFilters.includes("status") ? (
            <FilterField label="Status">
              <select
                className={selectClassName}
                disabled={isDisabled}
                value={filters.status ?? ""}
                onChange={(event) =>
                  onFilterChange("status", event.target.value)
                }
              >
                <option value="">All statuses</option>
                {(config.statusOptions ?? []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FilterField>
          ) : null}

          {visibleFilters.includes("action") ? (
            <FilterField label="Action">
              <select
                className={selectClassName}
                disabled={isDisabled}
                value={filters.action ?? ""}
                onChange={(event) =>
                  onFilterChange("action", event.target.value)
                }
              >
                <option value="">All actions</option>
                {(config.statusOptions ?? []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FilterField>
          ) : null}

          {visibleFilters.includes("paymentMethod") ? (
            <FilterField label="Payment Method">
              <select
                className={selectClassName}
                disabled={isDisabled}
                value={filters.paymentMethod ?? ""}
                onChange={(event) =>
                  onFilterChange("paymentMethod", event.target.value)
                }
              >
                <option value="">All methods</option>
                {(config.statusOptions ?? []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FilterField>
          ) : null}

          {visibleFilters.includes("requestedBy") ? (
            <FilterField label="Requester UUID">
              <Input
                disabled={isDisabled}
                placeholder="Requester UUID"
                value={filters.requestedBy ?? ""}
                onChange={(event) =>
                  onFilterChange("requestedBy", event.target.value)
                }
              />
            </FilterField>
          ) : null}

          {visibleFilters.includes("approverId") ? (
            <FilterField label="Approver UUID">
              <Input
                disabled={isDisabled}
                placeholder="Approver UUID"
                value={filters.approverId ?? ""}
                onChange={(event) =>
                  onFilterChange("approverId", event.target.value)
                }
              />
            </FilterField>
          ) : null}
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center xl:flex-col xl:items-end">
          <p className="text-sm text-muted-foreground">
            Showing {resultCount} of {totalCount} rows
          </p>
          <Button
            disabled={isDisabled}
            size="sm"
            variant="outline"
            onClick={onReset}
          >
            <RotateCcw className="size-4" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}

function FilterField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  const id = `report-filter-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div id={id}>{children}</div>
    </div>
  );
}

const selectClassName = cn(
  "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors",
  "focus:border-primary focus:ring-4 focus:ring-ring",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
);
