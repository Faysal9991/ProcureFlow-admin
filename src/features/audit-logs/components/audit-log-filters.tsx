"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";
import type { AuditLogFilters as AuditLogFilterValues } from "../types";
import {
  auditActionOptions,
  auditEntityTypeOptions,
} from "../utils";

type AuditLogFiltersPanelProps = {
  filters: AuditLogFilterValues;
  isDisabled?: boolean;
  isEntityHistoryMode: boolean;
  resultCount: number;
  totalCount: number;
  onFilterChange: (
    key: keyof Pick<
      AuditLogFilterValues,
      "action" | "dateFrom" | "dateTo" | "entityId" | "entityType" | "userId"
    >,
    value: string,
  ) => void;
  onReset: () => void;
};

export function AuditLogFiltersPanel({
  filters,
  isDisabled = false,
  isEntityHistoryMode,
  resultCount,
  totalCount,
  onFilterChange,
  onReset,
}: AuditLogFiltersPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <FilterField id="audit-action-filter" label="Action">
            <select
              id="audit-action-filter"
              className={selectClassName}
              disabled={isDisabled}
              value={filters.action ?? ""}
              onChange={(event) =>
                onFilterChange("action", event.target.value)
              }
            >
              <option value="">All actions</option>
              {auditActionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField id="audit-entity-type-filter" label="Entity Type">
            <select
              id="audit-entity-type-filter"
              className={selectClassName}
              disabled={isDisabled}
              value={filters.entityType ?? ""}
              onChange={(event) =>
                onFilterChange("entityType", event.target.value)
              }
            >
              <option value="">All entities</option>
              {auditEntityTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField id="audit-entity-id-filter" label="Entity UUID">
            <Input
              id="audit-entity-id-filter"
              disabled={isDisabled}
              placeholder="Entity UUID"
              value={filters.entityId ?? ""}
              onChange={(event) =>
                onFilterChange("entityId", event.target.value)
              }
            />
          </FilterField>

          <FilterField id="audit-user-id-filter" label="User UUID">
            <Input
              id="audit-user-id-filter"
              disabled={isDisabled}
              placeholder="Actor UUID"
              value={filters.userId ?? ""}
              onChange={(event) => onFilterChange("userId", event.target.value)}
            />
          </FilterField>

          <FilterField id="audit-date-from-filter" label="Date From">
            <Input
              id="audit-date-from-filter"
              disabled={isDisabled}
              type="date"
              value={filters.dateFrom ?? ""}
              onChange={(event) =>
                onFilterChange("dateFrom", event.target.value)
              }
            />
          </FilterField>

          <FilterField id="audit-date-to-filter" label="Date To">
            <Input
              id="audit-date-to-filter"
              disabled={isDisabled}
              type="date"
              value={filters.dateTo ?? ""}
              onChange={(event) =>
                onFilterChange("dateTo", event.target.value)
              }
            />
          </FilterField>
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center xl:flex-col xl:items-end">
          <p className="text-sm text-muted-foreground">
            Showing {resultCount} of {totalCount} logs
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

      {isEntityHistoryMode ? (
        <div className="mt-4 rounded-lg border border-info/20 bg-info/10 px-3 py-2 text-sm text-info">
          Entity history mode is active. Results are ordered chronologically for
          this record.
        </div>
      ) : null}
    </div>
  );
}

function FilterField({
  children,
  id,
  label,
}: {
  children: ReactNode;
  id: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

const selectClassName = cn(
  "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors",
  "focus:border-primary focus:ring-4 focus:ring-ring",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
);
