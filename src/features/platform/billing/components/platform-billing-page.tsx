"use client";

import { Plus, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  usePlatformCompanies,
  usePlatformPlans,
} from "@/features/platform/companies/hooks";
import type { PlatformCompanyListFilters } from "@/features/platform/companies/types";
import { canManagePlatformCompanies } from "@/features/platform/companies/utils";
import { useAuthStore } from "@/store/auth-store";
import { BillingFilters } from "./billing-filters";
import { BillingInvoicesTable } from "./billing-invoices-table";
import { CancelInvoiceDialog } from "./cancel-invoice-dialog";
import { CreatePlatformInvoiceDrawer } from "./create-platform-invoice-drawer";
import { RecordPaymentDialog } from "./record-payment-dialog";
import { usePlatformBillingInvoices } from "../hooks";
import type {
  PlatformBillingFilters,
  PlatformBillingInvoice,
  PlatformBillingStatus,
} from "../types";
import {
  formatBillingMoney,
  PLATFORM_BILLING_PAGE_SIZE,
} from "../utils";

export function PlatformBillingPage() {
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManagePlatformCompanies(currentUser?.role);
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [planId, setPlanId] = useState("");
  const [status, setStatus] = useState<"ALL" | PlatformBillingStatus>("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] =
    useState<PlatformBillingInvoice | null>(null);
  const [cancelInvoice, setCancelInvoice] =
    useState<PlatformBillingInvoice | null>(null);
  const filters = useMemo<PlatformBillingFilters>(
    () => ({
      companyId: companyId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      limit: PLATFORM_BILLING_PAGE_SIZE,
      page,
      planId: planId || undefined,
      search: search.trim() || undefined,
      status: status === "ALL" ? undefined : status,
    }),
    [companyId, dateFrom, dateTo, page, planId, search, status],
  );
  const companyFilters = useMemo<PlatformCompanyListFilters>(
    () => ({ limit: 100, page: 1 }),
    [],
  );
  const billingQuery = usePlatformBillingInvoices(filters, canManage);
  const companiesQuery = usePlatformCompanies(companyFilters, canManage);
  const plansQuery = usePlatformPlans(canManage);
  const billingList = billingQuery.data ?? {
    items: [],
    limit: PLATFORM_BILLING_PAGE_SIZE,
    page,
    summary: {
      mrr: 0,
      overdueInvoiceCount: 0,
      paidAmount: 0,
      paidInvoiceCount: 0,
      pendingAmount: 0,
      pendingInvoiceCount: 0,
    },
    total: 0,
  };
  const totalPages = Math.max(
    1,
    Math.ceil(billingList.total / billingList.limit),
  );
  const currentPage = billingList.page || page;

  function resetToFirstPage() {
    setPage(1);
  }

  if (!canManage) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Platform" title="Billing">
          Manage SaaS billing invoices and manual platform payments.
        </PageHeader>
        <PermissionState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="size-4" />
            Create Invoice
          </Button>
        }
        eyebrow="Platform"
        title="Billing"
      >
        Manage SaaS billing invoices, payment collection, and pending platform
        receivables.
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <SummaryCard label="MRR" value={formatBillingMoney(billingList.summary.mrr)} />
        <SummaryCard
          label="Paid"
          value={formatBillingMoney(billingList.summary.paidAmount)}
        />
        <SummaryCard
          label="Pending"
          value={formatBillingMoney(billingList.summary.pendingAmount)}
        />
        <SummaryCard
          label="Overdue"
          value={billingList.summary.overdueInvoiceCount.toLocaleString()}
        />
        <SummaryCard
          label="Pending Count"
          value={billingList.summary.pendingInvoiceCount.toLocaleString()}
        />
        <SummaryCard
          label="Paid Count"
          value={billingList.summary.paidInvoiceCount.toLocaleString()}
        />
      </div>

      <BillingFilters
        companies={companiesQuery.data?.items ?? []}
        companyId={companyId}
        dateFrom={dateFrom}
        dateTo={dateTo}
        isDisabled={billingQuery.isLoading}
        planId={planId}
        plans={plansQuery.data ?? []}
        search={search}
        status={status}
        onCompanyChange={(value) => {
          setCompanyId(value);
          resetToFirstPage();
        }}
        onDateFromChange={(value) => {
          setDateFrom(value);
          resetToFirstPage();
        }}
        onDateToChange={(value) => {
          setDateTo(value);
          resetToFirstPage();
        }}
        onPlanChange={(value) => {
          setPlanId(value);
          resetToFirstPage();
        }}
        onSearchChange={(value) => {
          setSearch(value);
          resetToFirstPage();
        }}
        onStatusChange={(value) => {
          setStatus(value);
          resetToFirstPage();
        }}
      />

      <BillingInvoicesTable
        error={billingQuery.error}
        invoices={billingList.items}
        isError={billingQuery.isError}
        isLoading={billingQuery.isLoading}
        onCancel={setCancelInvoice}
        onRecordPayment={setPaymentInvoice}
      />

      {!billingQuery.isLoading && !billingQuery.isError && billingList.total > 0 ? (
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

      <CreatePlatformInvoiceDrawer
        companies={companiesQuery.data?.items ?? []}
        isOpen={isCreateOpen}
        plans={plansQuery.data ?? []}
        onClose={() => setIsCreateOpen(false)}
      />

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

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
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
              Platform billing is available only to super admins.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
