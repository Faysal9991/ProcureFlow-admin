"use client";

import { ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePayments } from "@/features/invoices/hooks";
import type { PaymentListFilters } from "@/features/invoices/types";
import {
  canReadPayments,
  PAYMENT_PAGE_SIZE,
} from "@/features/invoices/utils";
import { useVendors } from "@/features/vendors/hooks";
import { useAuthStore } from "@/store/auth-store";
import { PaymentFilters } from "./payment-filters";
import { PaymentsTable } from "./payments-table";

export function PaymentsPage() {
  const currentUser = useAuthStore((state) => state.user);
  const canRead = canReadPayments(currentUser?.role);
  const [vendorId, setVendorId] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const vendorsQuery = useVendors({ limit: 100, page: 1 }, canRead);
  const vendors = vendorsQuery.data?.items ?? [];
  const queryFilters = useMemo<PaymentListFilters>(
    () => ({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      invoiceId: invoiceId.trim() || undefined,
      limit: PAYMENT_PAGE_SIZE,
      page,
      paymentMethod: paymentMethod || undefined,
      vendorId: vendorId || undefined,
    }),
    [dateFrom, dateTo, invoiceId, page, paymentMethod, vendorId],
  );
  const paymentsQuery = usePayments(queryFilters, canRead);
  const paymentList = paymentsQuery.data ?? {
    items: [],
    limit: PAYMENT_PAGE_SIZE,
    page,
    total: 0,
  };
  const totalPages = Math.max(1, Math.ceil(paymentList.total / paymentList.limit));
  const currentPage = paymentList.page || page;

  function resetToFirstPage() {
    setPage(1);
  }

  if (!canRead) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Finance" title="Payments">
          Review invoice payment records.
        </PageHeader>
        <Card>
          <CardContent className="p-8">
            <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
              <div>
                <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                  <ShieldAlert className="size-5" />
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  Payment access unavailable
                </p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Payments are available to company admins and finance users.
                  Other tenant users do not manage payment records here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Finance" title="Payments">
        Review payment history recorded against vendor invoices.
      </PageHeader>

      <PaymentFilters
        dateFrom={dateFrom}
        dateTo={dateTo}
        invoiceId={invoiceId}
        isDisabled={paymentsQuery.isLoading}
        paymentMethod={paymentMethod}
        resultCount={paymentList.items.length}
        totalCount={paymentList.total}
        vendorId={vendorId}
        vendors={vendors}
        onDateFromChange={(value) => {
          setDateFrom(value);
          resetToFirstPage();
        }}
        onDateToChange={(value) => {
          setDateTo(value);
          resetToFirstPage();
        }}
        onInvoiceChange={(value) => {
          setInvoiceId(value);
          resetToFirstPage();
        }}
        onPaymentMethodChange={(value) => {
          setPaymentMethod(value);
          resetToFirstPage();
        }}
        onVendorChange={(value) => {
          setVendorId(value);
          resetToFirstPage();
        }}
      />

      <PaymentsTable
        error={paymentsQuery.error}
        isError={paymentsQuery.isError}
        isLoading={paymentsQuery.isLoading}
        payments={paymentList.items}
      />

      {!paymentsQuery.isLoading &&
      !paymentsQuery.isError &&
      paymentList.total > 0 ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              disabled={currentPage <= 1}
              size="sm"
              variant="outline"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </Button>
            <Button
              disabled={currentPage >= totalPages}
              size="sm"
              variant="outline"
              onClick={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
