"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  PlatformCompanyStatus,
  PlatformPlan,
} from "@/features/platform/companies/types";
import { cn } from "@/lib/utils/cn";

type PlatformSubscriptionFiltersProps = {
  isDisabled?: boolean;
  planId: string;
  plans: PlatformPlan[];
  search: string;
  status: "ALL" | PlatformCompanyStatus;
  onPlanChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "ALL" | PlatformCompanyStatus) => void;
};

export function PlatformSubscriptionFilters({
  isDisabled = false,
  onPlanChange,
  onSearchChange,
  onStatusChange,
  planId,
  plans,
  search,
  status,
}: PlatformSubscriptionFiltersProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <div className="grid gap-3 sm:grid-cols-[minmax(240px,360px)_180px_220px]">
        <div className="space-y-2">
          <Label htmlFor="subscription-company-search">Search</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="subscription-company-search"
              className="pl-9"
              disabled={isDisabled}
              placeholder="Search companies"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subscription-company-status">Company Status</Label>
          <select
            id="subscription-company-status"
            className={selectClassName}
            disabled={isDisabled}
            value={status}
            onChange={(event) =>
              onStatusChange(event.target.value as "ALL" | PlatformCompanyStatus)
            }
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subscription-plan">Plan</Label>
          <select
            id="subscription-plan"
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
