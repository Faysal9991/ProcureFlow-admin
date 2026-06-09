"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import type { Vendor } from "@/features/vendors/types";
import type { InvoiceStatus } from "../types";
import { invoiceStatuses } from "../utils";

type InvoiceFiltersProps = {
  dateFrom: string;
  dateTo: string;
  isDisabled?: boolean;
  purchaseOrderId: string;
  resultCount: number;
  status: "ALL" | InvoiceStatus;
  totalCount: number;
  vendorId: string;
  vendors: Vendor[];
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onPurchaseOrderChange: (value: string) => void;
  onStatusChange: (value: "ALL" | InvoiceStatus) => void;
  onVendorChange: (value: string) => void;
};

export function InvoiceFilters({
  dateFrom,
  dateTo,
  isDisabled = false,
  purchaseOrderId,
  resultCount,
  status,
  totalCount,
  vendorId,
  vendors,
  onDateFromChange,
  onDateToChange,
  onPurchaseOrderChange,
  onStatusChange,
  onVendorChange,
}: InvoiceFiltersProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[180px_220px_220px_150px_150px]">
          <div className="space-y-2">
            <Label htmlFor="invoice-status-filter">Status</Label>
            <select
              id="invoice-status-filter"
              className={selectClassName}
              disabled={isDisabled}
              value={status}
              onChange={(event) =>
                onStatusChange(event.target.value as "ALL" | InvoiceStatus)
              }
            >
              <option value="ALL">All statuses</option>
              {invoiceStatuses.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice-vendor-filter">Vendor</Label>
            <select
              id="invoice-vendor-filter"
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
            <Label htmlFor="invoice-po-filter">PO UUID</Label>
            <input
              id="invoice-po-filter"
              className={inputClassName}
              disabled={isDisabled}
              placeholder="Purchase order UUID"
              value={purchaseOrderId}
              onChange={(event) => onPurchaseOrderChange(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice-date-from">From</Label>
            <input
              id="invoice-date-from"
              className={inputClassName}
              disabled={isDisabled}
              type="date"
              value={dateFrom}
              onChange={(event) => onDateFromChange(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice-date-to">To</Label>
            <input
              id="invoice-date-to"
              className={inputClassName}
              disabled={isDisabled}
              type="date"
              value={dateTo}
              onChange={(event) => onDateToChange(event.target.value)}
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {resultCount} of {totalCount} invoices
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

const selectClassName = inputClassName;
