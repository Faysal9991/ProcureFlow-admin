"use client";

import { Plus, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePurchaseOrders } from "@/features/purchase-orders/hooks";
import { useVendors } from "@/features/vendors/hooks";
import { useAuthStore } from "@/store/auth-store";
import { useInvoices } from "../hooks";
import type {
  Invoice,
  InvoiceEligiblePurchaseOrder,
  InvoiceListFilters,
  InvoiceStatus,
} from "../types";
import {
  canAddInvoicePayment,
  canCreateInvoices,
  canManageInvoiceDetails,
  canReadInvoices,
  INVOICE_PAGE_SIZE,
} from "../utils";
import { AddPaymentDialog } from "./add-payment-dialog";
import { CancelInvoiceDialog } from "./cancel-invoice-dialog";
import { InvoiceFilters } from "./invoice-filters";
import { InvoiceFormDrawer } from "./invoice-form-drawer";
import { InvoicesTable } from "./invoices-table";

export function InvoicesPage() {
  const currentUser = useAuthStore((state) => state.user);
  const role = currentUser?.role;
  const canRead = canReadInvoices(role);
  const canCreate = canCreateInvoices(role);
  const canManage = canManageInvoiceDetails(role);
  const canPay = canAddInvoicePayment(role);
  const [status, setStatus] = useState<"ALL" | InvoiceStatus>("ALL");
  const [vendorId, setVendorId] = useState("");
  const [purchaseOrderId, setPurchaseOrderId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [cancelInvoice, setCancelInvoice] = useState<Invoice | null>(null);
  const vendorsQuery = useVendors({ limit: 100, page: 1 }, canRead);
  const vendors = vendorsQuery.data?.items ?? [];
  const queryFilters = useMemo<InvoiceListFilters>(
    () => ({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      limit: INVOICE_PAGE_SIZE,
      page,
      purchaseOrderId: purchaseOrderId.trim() || undefined,
      status: status === "ALL" ? undefined : status,
      vendorId: vendorId || undefined,
    }),
    [dateFrom, dateTo, page, purchaseOrderId, status, vendorId],
  );
  const invoicesQuery = useInvoices(queryFilters, canRead);
  const receivedOrdersQuery = usePurchaseOrders(
    { limit: 100, page: 1, status: "RECEIVED" },
    canCreate,
  );
  const allInvoicesQuery = useInvoices(
    { limit: 100, page: 1 },
    canCreate,
  );
  const invoiceList = invoicesQuery.data ?? {
    items: [],
    limit: INVOICE_PAGE_SIZE,
    page,
    total: 0,
  };
  const totalPages = Math.max(1, Math.ceil(invoiceList.total / invoiceList.limit));
  const currentPage = invoiceList.page || page;
  const invoicedOrderIds = useMemo(
    () =>
      new Set(
        (allInvoicesQuery.data?.items ?? []).map(
          (invoice) => invoice.purchaseOrder.id,
        ),
      ),
    [allInvoicesQuery.data?.items],
  );
  const eligibleOrders = useMemo<InvoiceEligiblePurchaseOrder[]>(
    () =>
      (receivedOrdersQuery.data?.items ?? [])
        .filter((order) => !invoicedOrderIds.has(order.id))
        .map((order) => ({
          id: order.id,
          poNumber: order.poNumber,
          totalAmount: order.totalAmount,
          vendor: order.vendor,
        })),
    [invoicedOrderIds, receivedOrdersQuery.data?.items],
  );
  const formOrders = editingInvoice
    ? [invoiceToEligibleOrder(editingInvoice)]
    : eligibleOrders;

  function resetToFirstPage() {
    setPage(1);
  }

  function handleCreate() {
    setEditingInvoice(null);
    setIsFormOpen(true);
  }

  function handleEdit(invoice: Invoice) {
    setEditingInvoice(invoice);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingInvoice(null);
  }

  if (!canRead) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Finance" title="Invoices">
          Track vendor invoices against received purchase orders.
        </PageHeader>
        <Card>
          <CardContent className="p-8">
            <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
              <div>
                <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                  <ShieldAlert className="size-5" />
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  Invoice access unavailable
                </p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Invoices are available to company admins, procurement, and
                  finance users. Super admins do not manage tenant invoices
                  here.
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
      <PageHeader
        actions={
          canCreate ? (
            <Button onClick={handleCreate}>
              <Plus className="size-4" />
              Create Invoice
            </Button>
          ) : null
        }
        eyebrow="Finance"
        title="Invoices"
      >
        Track vendor invoices, due balances, and payment progress.
      </PageHeader>

      {!canManage ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Procurement can create and view invoices. Finance can view invoices
            and add payments. Company admins have full invoice access.
          </CardContent>
        </Card>
      ) : null}

      <InvoiceFilters
        dateFrom={dateFrom}
        dateTo={dateTo}
        isDisabled={invoicesQuery.isLoading}
        purchaseOrderId={purchaseOrderId}
        resultCount={invoiceList.items.length}
        status={status}
        totalCount={invoiceList.total}
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
        onPurchaseOrderChange={(value) => {
          setPurchaseOrderId(value);
          resetToFirstPage();
        }}
        onStatusChange={(value) => {
          setStatus(value);
          resetToFirstPage();
        }}
        onVendorChange={(value) => {
          setVendorId(value);
          resetToFirstPage();
        }}
      />

      <InvoicesTable
        canAddPayment={canPay}
        canManage={canManage}
        error={invoicesQuery.error}
        invoices={invoiceList.items}
        isError={invoicesQuery.isError}
        isLoading={invoicesQuery.isLoading}
        onAddPayment={setPaymentInvoice}
        onCancel={setCancelInvoice}
        onEdit={handleEdit}
      />

      {!invoicesQuery.isLoading &&
      !invoicesQuery.isError &&
      invoiceList.total > 0 ? (
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

      <InvoiceFormDrawer
        eligibleOrders={formOrders}
        invoice={editingInvoice}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
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

function invoiceToEligibleOrder(invoice: Invoice): InvoiceEligiblePurchaseOrder {
  return {
    id: invoice.purchaseOrder.id,
    poNumber: invoice.purchaseOrder.poNumber,
    totalAmount: invoice.purchaseOrder.totalAmount,
    vendor: invoice.vendor,
  };
}
