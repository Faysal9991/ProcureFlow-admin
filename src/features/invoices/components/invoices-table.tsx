"use client";

import Link from "next/link";
import {
  CreditCard,
  Edit3,
  Eye,
  Inbox,
  ShieldAlert,
  XCircle,
} from "lucide-react";
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
import type { Invoice } from "../types";
import {
  canCancelInvoice,
  canEditInvoice,
  canPayInvoice,
  formatCurrency,
  formatInvoiceDate,
  getInvoiceStatusLabel,
  getInvoiceStatusVariant,
} from "../utils";

type InvoicesTableProps = {
  canAddPayment: boolean;
  canManage: boolean;
  error?: unknown;
  invoices: Invoice[];
  isError: boolean;
  isLoading: boolean;
  onAddPayment: (invoice: Invoice) => void;
  onCancel: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
};

export function InvoicesTable({
  canAddPayment,
  canManage,
  error,
  invoices,
  isError,
  isLoading,
  onAddPayment,
  onCancel,
  onEdit,
}: InvoicesTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[130px_1.2fr_120px_120px_120px_120px_120px]"
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
                Invoices unavailable
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
                No invoices found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create an invoice from a received purchase order or adjust your
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
              <TableHead>Invoice No</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>PO Number</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="min-w-40 font-medium">
                  {invoice.invoiceNumber}
                </TableCell>
                <TableCell className="min-w-44 text-muted-foreground">
                  {invoice.vendor.name}
                </TableCell>
                <TableCell className="min-w-36 text-muted-foreground">
                  {invoice.purchaseOrder.poNumber}
                </TableCell>
                <TableCell className="min-w-32 font-medium">
                  {formatCurrency(invoice.invoiceAmount)}
                </TableCell>
                <TableCell className="min-w-32 text-muted-foreground">
                  {formatCurrency(invoice.paidAmount)}
                </TableCell>
                <TableCell className="min-w-32 text-muted-foreground">
                  {formatCurrency(invoice.remainingAmount)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <Badge variant={getInvoiceStatusVariant(invoice.status)}>
                      {getInvoiceStatusLabel(invoice.status)}
                    </Badge>
                    {invoice.isOverdue ? (
                      <Badge variant="error">
                        {invoice.daysOverdue} days overdue
                      </Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="min-w-32 text-muted-foreground">
                  {formatInvoiceDate(invoice.dueDate)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link
                      className={getButtonClassName({
                        size: "sm",
                        variant: "outline",
                      })}
                      href={`/invoices/${invoice.id}`}
                    >
                      <Eye className="size-4" />
                      View
                    </Link>
                    {canManage && canEditInvoice(invoice) ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(invoice)}
                      >
                        <Edit3 className="size-4" />
                        Edit
                      </Button>
                    ) : null}
                    {canAddPayment && canPayInvoice(invoice) ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAddPayment(invoice)}
                      >
                        <CreditCard className="size-4" />
                        Pay
                      </Button>
                    ) : null}
                    {canManage && canCancelInvoice(invoice) ? (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onCancel(invoice)}
                      >
                        <XCircle className="size-4" />
                        Cancel
                      </Button>
                    ) : null}
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
