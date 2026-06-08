"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import type { VendorStatus } from "../types";

type VendorFiltersProps = {
  isDisabled?: boolean;
  resultCount: number;
  search: string;
  status: "ALL" | VendorStatus;
  totalCount: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "ALL" | VendorStatus) => void;
};

export function VendorFilters({
  isDisabled = false,
  resultCount,
  search,
  status,
  totalCount,
  onSearchChange,
  onStatusChange,
}: VendorFiltersProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-3 sm:grid-cols-[minmax(240px,360px)_180px]">
          <div className="space-y-2">
            <Label htmlFor="vendor-search">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="vendor-search"
                className="pl-9"
                disabled={isDisabled}
                placeholder="Search vendors"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor-status-filter">Status</Label>
            <select
              id="vendor-status-filter"
              className={selectClassName}
              disabled={isDisabled}
              value={status}
              onChange={(event) =>
                onStatusChange(event.target.value as "ALL" | VendorStatus)
              }
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {resultCount} of {totalCount} vendors
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
