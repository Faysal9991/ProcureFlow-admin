"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Edit3,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { PageHeader } from "@/components/shared";
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
import { ROUTES } from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";
import { useInvoice } from "../hooks";
import type { Invoice, InvoiceEligiblePurchaseOrder } from "../types";
import {
  canAddInvoicePayment,
  canCancelInvoice,
  canEditInvoice,
  canManageInvoiceDetails,
  canPayInvoice,
  canReadInvoices,
  formatCurrency,
  formatInvoiceDate,
  getInvoiceStatusLabel,
  getInvoiceStatusVariant,
} from "../utils";
import { AddPaymentDialog } from "./add-payment-dialog";
import { CancelInvoiceDialog } from "./cancel-invoice-dialog";
import { InvoiceFormDrawer } from "./invoice-form-drawer";

type InvoiceDetailPageProps = {
  invoiceId: string;
};

export function InvoiceDetailPage({ invoiceId }: InvoiceDetailPageProps) {
  const currentUser = useAuthStore((state) => state.user);
  const role = currentUser?.role;
  const canRead = canReadInvoices(role);
  const canManage = canManageInvoiceDetails(role);
  const canPay = canAddInvoicePayment(role);
  const invoiceQuery = useInvoice(invoiceId, canRead);
  const invoice = invoiceQuery.data;
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [cancelInvoice, setCancelInvoice] = useState<Invoice | null>(null);

  if (!canRead) {
    return (
      <BlockedState message="Invoice details are available to company admins, procurement, and finance users." />
    );
  }

  if (invoiceQuery.isLoading) {
    return <DetailSkeleton />;
  }

  if (invoiceQuery.isError || !invoice) {
    return (
      <BlockedState
        message={getApiErrorMessage(invoiceQuery.error)}
        title="Invoice unavailable"
      />
    );
  }

  const formOrders: InvoiceEligiblePurchaseOrder[] = [
    {
      id: invoice.purchaseOrder.id,
      poNumber: invoice.purchaseOrder.poNumber,
      totalAmount: invoice.purchaseOrder.totalAmount,
      vendor: invoice.vendor,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Link
              className={getButtonClassName({ variant: "outline" })}
              href={ROUTES.invoices}
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
            {canManage && canEditInvoice(invoice) ? (
              <Button variant="outline" onClick={() => setIsFormOpen(true)}>
                <Edit3 className="size-4" />
                Edit
              </Button>
            ) : null}
            {canPay && canPayInvoice(invoice) ? (
              <Button variant="outline" onClick={() => setPaymentInvoice(invoice)}>
                <CreditCard className="size-4" />
                Add Payment
              </Button>
            ) : null}
            {canManage && canCancelInvoice(invoice) ? (
              <Button variant="danger" onClick={() => setCancelInvoice(invoice)}>
                <XCircle className="size-4" />
                Cancel
              </Button>
            ) : null}
          </>
        }
        eyebrow="Invoice"
        title={invoice.invoiceNumber}
      >
        {invoice.vendor.name} - {invoice.purchaseOrder.poNumber}
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-4">
        <SummaryTile label="Status">
          <div className="flex flex-wrap gap-2">
            <Badge variant={getInvoiceStatusVariant(invoice.status)}>
              {getInvoiceStatusLabel(invoice.status)}
            </Badge>
            {invoice.isOverdue ? (
              <Badge variant="error">{invoice.daysOverdue} days overdue</Badge>
            ) : null}
          </div>
        </SummaryTile>
        <SummaryTile label="Invoice Amount">
          {formatCurrency(invoice.invoiceAmount)}
        </SummaryTile>
        <SummaryTile label="Paid">
          {formatCurrency(invoice.paidAmount)}
        </SummaryTile>
        <SummaryTile label="Remaining">
          {formatCurrency(invoice.remainingAmount)}
        </SummaryTile>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetadataRow label="Vendor">{invoice.vendor.name}</MetadataRow>
            <MetadataRow label="Purchase order">
              {invoice.purchaseOrder.poNumber}
            </MetadataRow>
            <MetadataRow label="PO total">
              {formatCurrency(invoice.purchaseOrder.totalAmount)}
            </MetadataRow>
            <MetadataRow label="Invoice date">
              {formatInvoiceDate(invoice.invoiceDate)}
            </MetadataRow>
            <MetadataRow label="Due date">
              {formatInvoiceDate(invoice.dueDate)}
            </MetadataRow>
            <MetadataRow label="Paid at">
              {formatInvoiceDate(invoice.paidAt)}
            </MetadataRow>
            <MetadataRow label="Created by">
              {invoice.createdBy.name} ({invoice.createdBy.role})
            </MetadataRow>
            <MetadataRow label="Created">
              {formatInvoiceDate(invoice.createdAt)}
            </MetadataRow>
            <MetadataRow label="Updated">
              {formatInvoiceDate(invoice.updatedAt)}
            </MetadataRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <PaymentHistoryTable invoice={invoice} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {invoice.notes || "No notes added."}
          </p>
        </CardContent>
      </Card>

      <InvoiceFormDrawer
        eligibleOrders={formOrders}
        invoice={invoice}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
      <AddPaymentDialog
        invoice={paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
      />
      <CancelInvoiceDialog
        invoice={cancelInvoice}
        onClose={() => setCancelInvoice(null)}
      />
    </div>
  );
}

function PaymentHistoryTable({ invoice }: { invoice: Invoice }) {
  const payments = invoice.payments ?? [];

  if (payments.length === 0) {
    return (
      <div className="flex min-h-48 items-center justify-center p-6 text-center">
        <div>
          <p className="text-sm font-medium text-foreground">
            No payments recorded
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Finance users can record payments while the invoice has a remaining
            balance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead>Recorded By</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell className="min-w-32">
              {formatInvoiceDate(payment.paymentDate)}
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
              {payment.createdBy.name} ({payment.createdBy.role})
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function SummaryTile({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          {label}
        </p>
        <div className="mt-2 text-base font-semibold text-foreground">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

function MetadataRow({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">
        {children}
      </span>
    </div>
  );
}

function BlockedState({
  message,
  title = "Invoice access unavailable",
}: {
  message: string;
  title?: string;
}) {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
          <div>
            <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
              <ShieldAlert className="size-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {message}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 rounded-lg bg-muted" />
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 rounded-lg bg-muted" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-80 rounded-lg bg-muted" />
        <div className="h-80 rounded-lg bg-muted" />
      </div>
    </div>
  );
}
