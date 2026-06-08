"use client";

import { CircleDollarSign } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SpendSummaryData } from "../types";
import { formatCurrency } from "../utils";
import { getSectionErrorMessage, SectionState } from "./section-state";

type SpendSummaryProps = {
  data?: SpendSummaryData;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  isUnavailable?: boolean;
};

export function SpendSummary({
  data,
  error,
  isError,
  isLoading,
  isUnavailable,
}: SpendSummaryProps) {
  const total = data
    ? data.totalPOAmount +
      data.totalInvoiceAmount +
      data.totalPaidAmount +
      data.remainingDue
    : 0;

  const rows = [
    {
      color: "bg-primary",
      label: "Total PO Amount",
      value: data?.totalPOAmount ?? 0,
    },
    {
      color: "bg-info",
      label: "Total Invoice Amount",
      value: data?.totalInvoiceAmount ?? 0,
    },
    {
      color: "bg-success",
      label: "Paid Amount",
      value: data?.totalPaidAmount ?? 0,
    },
    {
      color: "bg-warning",
      label: "Remaining Due",
      value: data?.remainingDue ?? 0,
    },
  ];
  const max = Math.max(...rows.map((item) => item.value), 1);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Spend Summary</CardTitle>
            <CardDescription>
              Purchase order, invoice, payment, and due amounts.
            </CardDescription>
          </div>
          <CircleDollarSign className="size-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        {isUnavailable ? (
          <SectionState
            message="Spend summary is not available for this role."
            title="Not available for this role"
            type="unavailable"
          />
        ) : isLoading ? (
          <SectionState title="Loading spend summary" type="loading" />
        ) : isError ? (
          <SectionState
            message={getSectionErrorMessage(error)}
            title="Spend summary unavailable"
            type="error"
          />
        ) : total === 0 ? (
          <SectionState
            message="No spend activity was found for this filter range."
            title="No spend activity"
            type="empty"
          />
        ) : (
          <div className="space-y-4">
            {rows.map((item) => {
              const percent = Math.round((item.value / max) * 100);

              return (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-foreground">
                      {item.label}
                    </span>
                    <span className="text-muted-foreground">
                      {formatCurrency(item.value)}
                    </span>
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
