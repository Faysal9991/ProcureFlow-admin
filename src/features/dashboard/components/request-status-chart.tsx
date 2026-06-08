"use client";

import { FileBarChart2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RequestStatusChartData } from "../types";
import { formatNumber } from "../utils";
import { getSectionErrorMessage, SectionState } from "./section-state";

const statusItems: Array<{
  color: string;
  key: keyof RequestStatusChartData;
  label: string;
}> = [
  { color: "bg-muted-foreground", key: "draft", label: "Draft" },
  { color: "bg-info", key: "submitted", label: "Submitted" },
  { color: "bg-success", key: "approved", label: "Approved" },
  { color: "bg-error", key: "rejected", label: "Rejected" },
  { color: "bg-primary", key: "poCreated", label: "PO Created" },
  { color: "bg-warning", key: "cancelled", label: "Cancelled" },
];

type RequestStatusChartProps = {
  data?: RequestStatusChartData;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
};

export function RequestStatusChart({
  data,
  error,
  isError,
  isLoading,
}: RequestStatusChartProps) {
  const rows = statusItems.map((item) => ({
    ...item,
    value: data?.[item.key] ?? 0,
  }));
  const total = rows.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Request Status</CardTitle>
            <CardDescription>
              Purchase request distribution for the selected period.
            </CardDescription>
          </div>
          <FileBarChart2 className="size-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <SectionState title="Loading request status" type="loading" />
        ) : isError ? (
          <SectionState
            message={getSectionErrorMessage(error)}
            title="Request status unavailable"
            type="error"
          />
        ) : total === 0 ? (
          <SectionState
            message="No purchase requests were found for this filter range."
            title="No request activity"
            type="empty"
          />
        ) : (
          <div className="space-y-4">
            {rows.map((item) => {
              const percent = total ? Math.round((item.value / total) * 100) : 0;

              return (
                <div key={item.key}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <span className={`size-2 rounded-full ${item.color}`} />
                      {item.label}
                    </div>
                    <div className="text-muted-foreground">
                      {formatNumber(item.value)} · {percent}%
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{
                        width: `${item.value > 0 ? Math.max(percent, 2) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
