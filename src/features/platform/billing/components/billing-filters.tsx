"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  PlatformCompany,
} from "@/features/platform/companies/types";
import type { PlatformPlan } from "@/features/platform/companies/types";
import { cn } from "@/lib/utils/cn";
import type { PlatformBillingStatus } from "../types";

type BillingFiltersProps = {
  companies: PlatformCompany[];
  companyId: string;
  dateFrom: string;
  dateTo: string;
  isDisabled?: boolean;
  planId: string;
  plans: PlatformPlan[];
  search: string;
  status: "ALL" | PlatformBillingStatus;
  onCompanyChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onPlanChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "ALL" | PlatformBillingStatus) => void;
};

export function BillingFilters({
  companies,
  companyId,
  dateFrom,
  dateTo,
  isDisabled = false,
  onCompanyChange,
  onDateFromChange,
  onDateToChange,
  onPlanChange,
  onSearchChange,
  onStatusChange,
  planId,
  plans,
  search,
  status,
}: BillingFiltersProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1.2fr)_180px_180px_160px_160px_160px]">
        <div className="space-y-2">
          <Label htmlFor="billing-search">Search</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="billing-search"
              className="pl-9"
              disabled={isDisabled}
              placeholder="Invoice, company, plan"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="billing-company">Company</Label>
          <select
            id="billing-company"
            className={selectClassName}
            disabled={isDisabled}
            value={companyId}
            onChange={(event) => onCompanyChange(event.target.value)}
          >
            <option value="">All companies</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="billing-plan">Plan</Label>
          <select
            id="billing-plan"
            className={selectClassName}
            disabled={isDisabled}
            value={planId}
            onChange={(event) => onPlanChange(event.target.value)}
          >
            <option value="">All plans</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="billing-status">Status</Label>
          <select
            id="billing-status"
            className={selectClassName}
            disabled={isDisabled}
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as "ALL" | PlatformBillingStatus)
            }
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="billing-date-from">Date From</Label>
          <Input
            id="billing-date-from"
            disabled={isDisabled}
            type="date"
            value={dateFrom}
            onChange={(event) => onDateFromChange(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="billing-date-to">Date To</Label>
          <Input
            id="billing-date-to"
            disabled={isDisabled}
            type="date"
            value={dateTo}
            onChange={(event) => onDateToChange(event.target.value)}
          />
        </div>
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
