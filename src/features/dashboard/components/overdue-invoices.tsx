"use client";

import { AlertTriangle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OverdueInvoicesData } from "../types";
import { formatCurrency, formatDateLabel, formatNumber } from "../utils";
import { getSectionErrorMessage, SectionState } from "./section-state";

type OverdueInvoicesProps = {
  data?: OverdueInvoicesData;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  isUnavailable?: boolean;
};

export function OverdueInvoices({
  data,
  error,
  isError,
  isLoading,
  isUnavailable,
}: OverdueInvoicesProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Overdue Invoices</CardTitle>
            <CardDescription>
              Open invoice balances past their due date.
            </CardDescription>
          </div>
          <AlertTriangle className="size-5 text-error" />
        </div>
      </CardHeader>
      <CardContent>
        {isUnavailable ? (
          <SectionState
            message="Overdue invoice data is not available for this role."
            title="Not available for this role"
            type="unavailable"
          />
        ) : isLoading ? (
          <SectionState title="Loading overdue invoices" type="loading" />
        ) : isError ? (
          <SectionState
            message={getSectionErrorMessage(error)}
            title="Overdue invoices unavailable"
            type="error"
          />
        ) : !data?.items.length ? (
          <SectionState
            message="No overdue invoices were found for this filter range."
            title="No overdue invoices"
            type="empty"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice No</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Days Overdue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell>{invoice.vendorName}</TableCell>
                  <TableCell>{formatDateLabel(invoice.dueDate)}</TableCell>
                  <TableCell className="whitespace-nowrap font-medium">
                    {formatCurrency(invoice.remainingAmount)}
                  </TableCell>
                  <TableCell>{formatNumber(invoice.daysOverdue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
