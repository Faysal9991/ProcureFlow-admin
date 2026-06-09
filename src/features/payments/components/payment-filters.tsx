"use client";

import { Label } from "@/components/ui/label";
import type { Vendor } from "@/features/vendors/types";
import { cn } from "@/lib/utils/cn";
import { paymentMethods } from "@/features/invoices/utils";

type PaymentFiltersProps = {
  dateFrom: string;
  dateTo: string;
  invoiceId: string;
  isDisabled?: boolean;
  paymentMethod: string;
  resultCount: number;
  totalCount: number;
  vendorId: string;
  vendors: Vendor[];
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onInvoiceChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
  onVendorChange: (value: string) => void;
};

export function PaymentFilters({
  dateFrom,
  dateTo,
  invoiceId,
  isDisabled = false,
  paymentMethod,
  resultCount,
  totalCount,
  vendorId,
  vendors,
  onDateFromChange,
  onDateToChange,
  onInvoiceChange,
  onPaymentMethodChange,
  onVendorChange,
}: PaymentFiltersProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[220px_180px_220px_150px_150px]">
          <div className="space-y-2">
            <Label htmlFor="payment-vendor-filter">Vendor</Label>
            <select
              id="payment-vendor-filter"
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
            <Label htmlFor="payment-method-filter">Method</Label>
            <select
              id="payment-method-filter"
              className={selectClassName}
              disabled={isDisabled}
              value={paymentMethod}
              onChange={(event) => onPaymentMethodChange(event.target.value)}
            >
              <option value="">All methods</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-invoice-filter">Invoice UUID</Label>
            <input
              id="payment-invoice-filter"
              className={inputClassName}
              disabled={isDisabled}
              placeholder="Invoice UUID"
              value={invoiceId}
              onChange={(event) => onInvoiceChange(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-date-from">From</Label>
            <input
              id="payment-date-from"
              className={inputClassName}
              disabled={isDisabled}
              type="date"
              value={dateFrom}
              onChange={(event) => onDateFromChange(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-date-to">To</Label>
            <input
              id="payment-date-to"
              className={inputClassName}
              disabled={isDisabled}
              type="date"
              value={dateTo}
              onChange={(event) => onDateToChange(event.target.value)}
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {resultCount} of {totalCount} payments
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
