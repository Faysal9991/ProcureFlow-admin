"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DashboardFilterPreset } from "../types";
import { canUseDepartmentFilter } from "../utils";

const presets: Array<{ label: string; value: DashboardFilterPreset }> = [
  { label: "This Month", value: "thisMonth" },
  { label: "This Quarter", value: "thisQuarter" },
  { label: "This Year", value: "thisYear" },
  { label: "Custom", value: "custom" },
];

type DashboardFiltersProps = {
  dateFrom: string;
  dateTo: string;
  departmentId: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onDepartmentIdChange: (value: string) => void;
  onPresetChange: (value: DashboardFilterPreset) => void;
  preset: DashboardFilterPreset;
  role?: string;
};

export function DashboardFilters({
  dateFrom,
  dateTo,
  departmentId,
  onDateFromChange,
  onDateToChange,
  onDepartmentIdChange,
  onPresetChange,
  preset,
  role,
}: DashboardFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Filter className="size-4 text-primary" />
              Dashboard filters
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Filter all dashboard sections by period and optional department.
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <div className="flex flex-wrap gap-2">
              {presets.map((item) => (
                <Button
                  key={item.value}
                  size="sm"
                  type="button"
                  variant={preset === item.value ? "primary" : "outline"}
                  onClick={() => onPresetChange(item.value)}
                >
                  {item.label}
                </Button>
              ))}
            </div>

            {preset === "custom" ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dashboard-date-from">Date From</Label>
                  <Input
                    id="dashboard-date-from"
                    type="date"
                    value={dateFrom}
                    onChange={(event) => onDateFromChange(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dashboard-date-to">Date To</Label>
                  <Input
                    id="dashboard-date-to"
                    type="date"
                    value={dateTo}
                    onChange={(event) => onDateToChange(event.target.value)}
                  />
                </div>
              </div>
            ) : null}

            {canUseDepartmentFilter(role) ? (
              <div className="space-y-2 lg:w-72">
                <Label htmlFor="dashboard-department-id">Department UUID</Label>
                <Input
                  id="dashboard-department-id"
                  placeholder="Optional departmentId"
                  value={departmentId}
                  onChange={(event) => onDepartmentIdChange(event.target.value)}
                />
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
