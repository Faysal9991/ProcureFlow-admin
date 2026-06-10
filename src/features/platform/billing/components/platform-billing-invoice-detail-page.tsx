"use client";

import Link from "next/link";
import { ArrowLeft, CreditCard, ShieldAlert, XCircle } from "lucide-react";
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
import { canManagePlatformCompanies } from "@/features/platform/companies/utils";
import { CancelInvoiceDialog } from "./cancel-invoice-dialog";
import { RecordPaymentDialog } from "./record-payment-dialog";
import {
  useCompanyPlatformBillingInvoices,
  usePlatformBillingInvoice,
} from "../hooks";
import type { PlatformBillingInvoice } from "../types";
import {
  formatBillingDate,
  formatBillingMoney,
  getBillingStatusLabel,
  getBillingStatusVariant,
} from "../utils";

type PlatformBillingInvoiceDetailPageProps = {
  invoiceId: string;
};

export function PlatformBillingInvoiceDetailPage({
  invoiceId,
}: PlatformBillingInvoiceDetailPageProps) {
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManagePlatformCompanies(currentUser?.role);
  const invoiceQuery = usePlatformBillingInvoice(invoiceId, canManage);
  const invoice = invoiceQuery.data;
  const companyHistoryQuery = useCompanyPlatformBillingInvoices(
    invoice?.company.id ?? "",
    canManage && !!invoice?.company.id,
  );
  const [paymentInvoice, setPaymentInvoice] =
    useState<PlatformBillingInvoice | null>(null);
  const [cancelInvoice, setCancelInvoice] =
    useState<PlatformBillingInvoice | null>(null);

  if (!canManage) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Platform Billing" title="Invoice Detail">
          Review billing invoice, payment history, and company billing context.
        </PageHeader>
        <PermissionState />
      </div>
    );
  }

  if (invoiceQuery.isLoading) {
    return <DetailSkeleton />;
  }

  if (invoiceQuery.isError || !invoice) {
    return (
      <div className="space-y-6">
        <PageHeader
          actions={
            <Link
              className={getButtonClassName({ variant: "outline" })}
              href={ROUTES.platformBilling}
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
          }
          eyebrow="Platform Billing"
          title="Invoice unavailable"
        >
          {getApiErrorMessage(invoiceQuery.error)}
        </PageHeader>
        <ErrorState message={getApiErrorMessage(invoiceQuery.error)} />
      </div>
    );
  }

  const canMutate = invoice.status === "PENDING";

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Link
              className={getButtonClassName({ variant: "outline" })}
              href={ROUTES.platformBilling}
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
            {canMutate ? (
              <>
                <Button variant="outline" onClick={() => setPaymentInvoice(invoice)}>
                  <CreditCard className="size-4" />
                  Record Payment
                </Button>
                <Button variant="danger" onClick={() => setCancelInvoice(invoice)}>
                  <XCircle className="size-4" />
                  Cancel
                </Button>
              </>
            ) : null}
          </>
        }
        eyebrow="Platform Billing"
        title={invoice.invoiceNumber}
      >
        {invoice.company.name}
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-4">
        <SummaryTile label="Status">
          <Badge
            variant={getBillingStatusVariant(invoice.status, invoice.isOverdue)}
          >
            {getBillingStatusLabel(invoice.status, invoice.isOverdue)}
          </Badge>
        </SummaryTile>
        <SummaryTile label="Amount">
          {formatBillingMoney(invoice.amount)}
        </SummaryTile>
        <SummaryTile label="Paid">
          {formatBillingMoney(invoice.paidAmount)}
        </SummaryTile>
        <SummaryTile label="Remaining">
          {formatBillingMoney(invoice.remainingAmount)}
        </SummaryTile>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetadataRow label="Company">{invoice.company.name}</MetadataRow>
            <MetadataRow label="Company Email">{invoice.company.email}</MetadataRow>
            <MetadataRow label="Plan">{invoice.plan.name}</MetadataRow>
            <MetadataRow label="Subscription">
              {invoice.subscriptionId ?? "Manual plan invoice"}
            </MetadataRow>
            <MetadataRow label="Billing Period">
              {formatBillingDate(invoice.billingPeriodStart)} to{" "}
              {formatBillingDate(invoice.billingPeriodEnd)}
            </MetadataRow>
            <MetadataRow label="Due Date">
              {formatBillingDate(invoice.dueDate)}
            </MetadataRow>
            <MetadataRow label="Paid At">
              {formatBillingDate(invoice.paidAt)}
            </MetadataRow>
            <MetadataRow label="Created By">
              {invoice.createdBy?.name ?? "Not available"}
            </MetadataRow>
          </CardContent>
        </Card>

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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
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
              {(invoice.payments ?? []).length > 0 ? (
                (invoice.payments ?? []).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatBillingDate(payment.paymentDate)}</TableCell>
                    <TableCell>{formatBillingMoney(payment.amount)}</TableCell>
                    <TableCell>{payment.paymentMethod}</TableCell>
                    <TableCell>{payment.referenceNumber || "Not set"}</TableCell>
                    <TableCell>{payment.createdBy?.name ?? "Not available"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="py-8 text-center text-muted-foreground"
                    colSpan={5}
                  >
                    No payments recorded.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company Billing History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(companyHistoryQuery.data?.items ?? []).map((historyInvoice) => (
                <TableRow key={historyInvoice.id}>
                  <TableCell>
                    <Link
                      className="font-medium hover:text-primary"
                      href={`/platform/billing/invoices/${historyInvoice.id}`}
                    >
                      {historyInvoice.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {formatBillingDate(historyInvoice.billingPeriodStart)} to{" "}
                    {formatBillingDate(historyInvoice.billingPeriodEnd)}
                  </TableCell>
                  <TableCell>{formatBillingMoney(historyInvoice.amount)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getBillingStatusVariant(
                        historyInvoice.status,
                        historyInvoice.isOverdue,
                      )}
                    >
                      {getBillingStatusLabel(
                        historyInvoice.status,
                        historyInvoice.isOverdue,
                      )}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RecordPaymentDialog
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

function SummaryTile({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-2 text-base font-semibold text-foreground">
        {children}
      </div>
    </div>
  );
}

function MetadataRow({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="max-w-80 text-right text-sm font-medium text-foreground">
        {children}
      </span>
    </div>
  );
}

function PermissionState() {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
          <div>
            <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
              <ShieldAlert className="size-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              Super admin access required
            </p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Platform billing invoices are available only to super admins.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <p className="text-sm font-medium text-foreground">
          Billing invoice could not be loaded
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-20 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-lg bg-muted" />
        <div className="h-80 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
