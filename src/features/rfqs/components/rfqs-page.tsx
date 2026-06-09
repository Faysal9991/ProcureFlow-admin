"use client";

import Link from "next/link";
import { Plus, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button, getButtonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDepartments } from "@/features/departments/hooks";
import { useVendors } from "@/features/vendors/hooks";
import { ROUTES } from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";
import { useRFQs } from "../hooks";
import type { RFQListFilters, RFQStatus } from "../types";
import { canManageRFQs, canReadRFQs, RFQ_PAGE_SIZE } from "../utils";
import { RFQFilters } from "./rfq-filters";
import { RFQsTable } from "./rfqs-table";

export function RFQsPage() {
  const currentUser = useAuthStore((state) => state.user);
  const role = currentUser?.role;
  const canRead = canReadRFQs(role);
  const canManage = canManageRFQs(role);
  const [status, setStatus] = useState<"ALL" | RFQStatus>("ALL");
  const [vendorId, setVendorId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [purchaseRequestId, setPurchaseRequestId] = useState("");
  const [page, setPage] = useState(1);
  const vendorsQuery = useVendors({ limit: 100, page: 1 }, canRead);
  const departmentsQuery = useDepartments(canRead);
  const vendors = vendorsQuery.data?.items ?? [];
  const departments = departmentsQuery.data ?? [];
  const queryFilters = useMemo<RFQListFilters>(
    () => ({
      departmentId: departmentId || undefined,
      limit: RFQ_PAGE_SIZE,
      page,
      purchaseRequestId: purchaseRequestId.trim() || undefined,
      status: status === "ALL" ? undefined : status,
      vendorId: vendorId || undefined,
    }),
    [departmentId, page, purchaseRequestId, status, vendorId],
  );
  const rfqsQuery = useRFQs(queryFilters, canRead);
  const rfqList = rfqsQuery.data ?? {
    items: [],
    limit: RFQ_PAGE_SIZE,
    page,
    total: 0,
  };
  const totalPages = Math.max(1, Math.ceil(rfqList.total / rfqList.limit));
  const currentPage = rfqList.page || page;

  function resetToFirstPage() {
    setPage(1);
  }

  if (!canRead) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Procurement" title="RFQ">
          Manage RFQ drafting, vendor invitations, quotation comparison, and
          supplier selection.
        </PageHeader>
        <Card>
          <CardContent className="p-8">
            <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
              <div>
                <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                  <ShieldAlert className="size-5" />
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  RFQ access unavailable
                </p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  RFQs are available to company admins, procurement, finance,
                  and managers. Super admins do not manage tenant RFQs here.
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
          canManage ? (
            <Link className={getButtonClassName()} href={`${ROUTES.rfqs}/new`}>
              <Plus className="size-4" />
              Create RFQ
            </Link>
          ) : null
        }
        eyebrow="Procurement"
        title="RFQ"
      >
        Create RFQs, invite vendors, compare quotations, and select suppliers.
      </PageHeader>

      {!canManage ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            This is a read-only RFQ view. Procurement and company admin users
            manage vendor invites, quotation entry, and supplier selection.
          </CardContent>
        </Card>
      ) : null}

      <RFQFilters
        departmentId={departmentId}
        departments={departments}
        isDisabled={rfqsQuery.isLoading}
        purchaseRequestId={purchaseRequestId}
        resultCount={rfqList.items.length}
        status={status}
        totalCount={rfqList.total}
        vendorId={vendorId}
        vendors={vendors}
        onDepartmentChange={(value) => {
          setDepartmentId(value);
          resetToFirstPage();
        }}
        onPurchaseRequestChange={(value) => {
          setPurchaseRequestId(value);
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

      <RFQsTable
        error={rfqsQuery.error}
        isError={rfqsQuery.isError}
        isLoading={rfqsQuery.isLoading}
        rfqs={rfqList.items}
      />

      {!rfqsQuery.isLoading && !rfqsQuery.isError && rfqList.total > 0 ? (
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
