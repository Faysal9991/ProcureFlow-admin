"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Vendor } from "@/features/vendors/types";
import { cn } from "@/lib/utils/cn";
import type { PurchaseOrderStatus } from "../types";
import { purchaseOrderStatuses } from "../utils";

type PurchaseOrderFiltersProps = {
  isDisabled?: boolean;
  purchaseRequestId: string;
  resultCount: number;
  search: string;
  status: "ALL" | PurchaseOrderStatus;
  totalCount: number;
  vendorId: string;
  vendors: Vendor[];
  onPurchaseRequestChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "ALL" | PurchaseOrderStatus) => void;
  onVendorChange: (value: string) => void;
};

export function PurchaseOrderFilters({
  isDisabled = false,
  purchaseRequestId,
  resultCount,
  search,
  status,
  totalCount,
  vendorId,
  vendors,
  onPurchaseRequestChange,
  onSearchChange,
  onStatusChange,
  onVendorChange,
}: PurchaseOrderFiltersProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(240px,340px)_170px_220px_240px]">
          <div className="space-y-2">
            <Label htmlFor="po-search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="po-search"
                className="pl-9"
                disabled={isDisabled}
                placeholder="PO number, vendor, request"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="po-status-filter">Status</Label>
            <select
              id="po-status-filter"
              className={selectClassName}
              disabled={isDisabled}
              value={status}
              onChange={(event) =>
                onStatusChange(event.target.value as "ALL" | PurchaseOrderStatus)
              }
            >
              <option value="ALL">All statuses</option>
              {purchaseOrderStatuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="po-vendor-filter">Vendor</Label>
            <select
              id="po-vendor-filter"
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
            <Label htmlFor="po-request-filter">Request UUID</Label>
            <Input
              id="po-request-filter"
              disabled={isDisabled}
              placeholder="Optional request UUID"
              value={purchaseRequestId}
              onChange={(event) => onPurchaseRequestChange(event.target.value)}
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {resultCount} of {totalCount} purchase orders
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
