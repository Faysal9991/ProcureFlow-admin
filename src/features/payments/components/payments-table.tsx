"use client";

import Link from "next/link";
import { Eye, Inbox, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getButtonClassName } from "@/components/ui/button";
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
import type { PaymentListItem } from "@/features/invoices/types";
import {
  formatCurrency,
  formatInvoiceDate,
  getInvoiceStatusLabel,
  getInvoiceStatusVariant,
} from "@/features/invoices/utils";

type PaymentsTableProps = {
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  payments: PaymentListItem[];
};

export function PaymentsTable({
  error,
  isError,
  isLoading,
  payments,
}: PaymentsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[130px_1.2fr_120px_120px_140px_120px_120px]"
              >
                <div className="h-4 rounded-md bg-muted" />
                <div className="h-4 rounded-md bg-muted" />
                <div className="h-4 rounded-md bg-muted" />
                <div className="h-4 rounded-md bg-muted" />
                <div className="h-4 rounded-md bg-muted" />
                <div className="h-4 rounded-md bg-muted" />
                <div className="h-4 rounded-md bg-muted" />
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
                Payments unavailable
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

  if (payments.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Inbox className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                No payments found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a payment from an invoice detail page or adjust your
                filters.
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
              <TableHead>Payment Date</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>PO Number</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Recorded By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="min-w-32">
                  {formatInvoiceDate(payment.paymentDate)}
                </TableCell>
                <TableCell className="min-w-44">
                  <p className="font-medium">{payment.invoice.invoiceNumber}</p>
                  <Badge variant={getInvoiceStatusVariant(payment.invoice.status)}>
                    {getInvoiceStatusLabel(payment.invoice.status)}
                  </Badge>
                </TableCell>
                <TableCell className="min-w-44 text-muted-foreground">
                  {payment.vendor.name}
                </TableCell>
                <TableCell className="min-w-36 text-muted-foreground">
                  {payment.purchaseOrder.poNumber}
                </TableCell>
                <TableCell className="min-w-32 font-medium">
                  {formatCurrency(payment.amount)}
                </TableCell>
                <TableCell className="min-w-36 text-muted-foreground">
                  {payment.paymentMethod || "Not set"}
                </TableCell>
                <TableCell className="min-w-40 text-muted-foreground">
                  {payment.referenceNumber || "Not set"}
                </TableCell>
                <TableCell className="min-w-44 text-muted-foreground">
                  {payment.createdBy.name}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Link
                      className={getButtonClassName({
                        size: "sm",
                        variant: "outline",
                      })}
                      href={`/invoices/${payment.invoice.id}`}
                    >
                      <Eye className="size-4" />
                      Invoice
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
