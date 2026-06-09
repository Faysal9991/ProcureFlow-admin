"use client";

import { Label } from "@/components/ui/label";
import type { Department } from "@/features/departments/types";
import type { Vendor } from "@/features/vendors/types";
import { cn } from "@/lib/utils/cn";
import type { RFQStatus } from "../types";
import { rfqStatuses } from "../utils";

type RFQFiltersProps = {
  departmentId: string;
  departments: Department[];
  isDisabled?: boolean;
  purchaseRequestId: string;
  resultCount: number;
  status: "ALL" | RFQStatus;
  totalCount: number;
  vendorId: string;
  vendors: Vendor[];
  onDepartmentChange: (value: string) => void;
  onPurchaseRequestChange: (value: string) => void;
  onStatusChange: (value: "ALL" | RFQStatus) => void;
  onVendorChange: (value: string) => void;
};

export function RFQFilters({
  departmentId,
  departments,
  isDisabled = false,
  purchaseRequestId,
  resultCount,
  status,
  totalCount,
  vendorId,
  vendors,
  onDepartmentChange,
  onPurchaseRequestChange,
  onStatusChange,
  onVendorChange,
}: RFQFiltersProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[180px_220px_220px_240px]">
          <div className="space-y-2">
            <Label htmlFor="rfq-status-filter">Status</Label>
            <select
              id="rfq-status-filter"
              className={selectClassName}
              disabled={isDisabled}
              value={status}
              onChange={(event) =>
                onStatusChange(event.target.value as "ALL" | RFQStatus)
              }
            >
              <option value="ALL">All statuses</option>
              {rfqStatuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rfq-vendor-filter">Vendor</Label>
            <select
              id="rfq-vendor-filter"
              className={selectClassName}
              disabled={isDisabled}
              value={vendorId}
              onChange={(event) => onVendorChange(event.target.value)}
            >
              <option value="">All vendors</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rfq-department-filter">Department</Label>
            <select
              id="rfq-department-filter"
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
            <Label htmlFor="rfq-request-filter">Request UUID</Label>
            <input
              id="rfq-request-filter"
              className={selectClassName}
              disabled={isDisabled}
              placeholder="Optional request UUID"
              value={purchaseRequestId}
              onChange={(event) => onPurchaseRequestChange(event.target.value)}
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {resultCount} of {totalCount} RFQs
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
