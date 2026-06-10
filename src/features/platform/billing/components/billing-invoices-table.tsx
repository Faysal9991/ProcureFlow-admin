"use client";

import Link from "next/link";
import { ArrowRight, CreditCard, Inbox, ShieldAlert, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, getButtonClassName } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { getApiErrorMessage } from "@/lib/api/client";
import type { PlatformBillingInvoice } from "../types";
import {
  formatBillingDate,
  formatBillingMoney,
  getBillingStatusLabel,
  getBillingStatusVariant,
} from "../utils";

type BillingInvoicesTableProps = {
  error?: unknown;
  invoices: PlatformBillingInvoice[];
  isError: boolean;
  isLoading: boolean;
  onCancel: (invoice: PlatformBillingInvoice) => void;
  onRecordPayment: (invoice: PlatformBillingInvoice) => void;
};

export function BillingInvoicesTable({
  error,
  invoices,
  isError,
  isLoading,
  onCancel,
  onRecordPayment,
}: BillingInvoicesTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[1fr_1.2fr_1fr_1fr_120px_120px_120px]"
              >
                {Array.from({ length: 7 }).map((__, itemIndex) => (
                  <div key={itemIndex} className="h-4 rounded-md bg-muted" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                <ShieldAlert className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Billing invoices unavailable
              </p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {getApiErrorMessage(error)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Inbox className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                No billing invoices found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a manual billing invoice or adjust your filters.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice No</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Billing Period</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Paid At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => {
              const canMutate = invoice.status === "PENDING";

              return (
                <TableRow key={invoice.id}>
                  <TableCell className="min-w-44">
                    <Link
                      className="font-medium text-foreground hover:text-primary"
                      href={`/platform/billing/invoices/${invoice.id}`}
                    >
                      {invoice.invoiceNumber}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Remaining {formatBillingMoney(invoice.remainingAmount)}
                    </p>
                  </TableCell>
                  <TableCell className="min-w-52">
                    <p className="font-medium text-foreground">
                      {invoice.company.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {invoice.company.email}
                    </p>
                  </TableCell>
                  <TableCell className="min-w-36">{invoice.plan.name}</TableCell>
                  <TableCell className="min-w-48 text-muted-foreground">
                    {formatBillingDate(invoice.billingPeriodStart)} to{" "}
                    {formatBillingDate(invoice.billingPeriodEnd)}
                  </TableCell>
                  <TableCell className="min-w-32 font-medium">
                    {formatBillingMoney(invoice.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getBillingStatusVariant(
                        invoice.status,
                        invoice.isOverdue,
                      )}
                    >
                      {getBillingStatusLabel(invoice.status, invoice.isOverdue)}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-32 text-muted-foreground">
                    {formatBillingDate(invoice.dueDate)}
                  </TableCell>
                  <TableCell className="min-w-32 text-muted-foreground">
                    {formatBillingDate(invoice.paidAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {canMutate ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onRecordPayment(invoice)}
                          >
                            <CreditCard className="size-4" />
                            Pay
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => onCancel(invoice)}
                          >
                            <XCircle className="size-4" />
                            Cancel
                          </Button>
                        </>
                      ) : null}
                      <Link
                        className={getButtonClassName({
                          size: "sm",
                          variant: "outline",
                        })}
                        href={`/platform/billing/invoices/${invoice.id}`}
                      >
                        View
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
