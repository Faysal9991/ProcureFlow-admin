"use client";

import Link from "next/link";
import { Plus, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button, getButtonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDepartments } from "@/features/departments/hooks";
import { ROUTES } from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";
import { usePurchaseRequests } from "../hooks";
import type {
  PurchaseRequest,
  PurchaseRequestListFilters,
  PurchaseRequestPriority,
  PurchaseRequestStatus,
} from "../types";
import {
  canAccessPurchaseRequests,
  canCreatePurchaseRequest,
  canUseDepartmentFilter,
  getRequestListScope,
  PURCHASE_REQUEST_PAGE_SIZE,
} from "../utils";
import { CancelRequestDialog } from "./cancel-request-dialog";
import { PurchaseRequestFilters } from "./purchase-request-filters";
import { PurchaseRequestsTable } from "./purchase-requests-table";

export function PurchaseRequestsPage() {
  const currentUser = useAuthStore((state) => state.user);
  const role = currentUser?.role;
  const canAccess = canAccessPurchaseRequests(role);
  const canCreate = canCreatePurchaseRequest(role);
  const showDepartmentFilter = canUseDepartmentFilter(role);
  const scope = getRequestListScope(role);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | PurchaseRequestStatus>("ALL");
  const [priority, setPriority] = useState<"ALL" | PurchaseRequestPriority>(
    "ALL",
  );
  const [departmentId, setDepartmentId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [cancelRequest, setCancelRequest] = useState<PurchaseRequest | null>(
    null,
  );
  const departmentsQuery = useDepartments(canAccess && showDepartmentFilter);
  const departments = useMemo(
    () => departmentsQuery.data ?? [],
    [departmentsQuery.data],
  );
  const queryFilters = useMemo<PurchaseRequestListFilters>(
    () => ({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      departmentId:
        showDepartmentFilter && departmentId ? departmentId : undefined,
      limit: PURCHASE_REQUEST_PAGE_SIZE,
      page,
      priority: priority === "ALL" ? undefined : priority,
      search: search.trim() || undefined,
      status: status === "ALL" ? undefined : status,
    }),
    [
      dateFrom,
      dateTo,
      departmentId,
      page,
      priority,
      search,
      showDepartmentFilter,
      status,
    ],
  );
  const requestsQuery = usePurchaseRequests(queryFilters, scope, canAccess);
  const requestList = requestsQuery.data ?? {
    items: [],
    limit: PURCHASE_REQUEST_PAGE_SIZE,
    page,
    total: 0,
  };
  const totalPages = Math.max(1, Math.ceil(requestList.total / requestList.limit));
  const currentPage = requestList.page || page;

  function resetToFirstPage() {
    setPage(1);
  }

  if (!canAccess) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Procurement" title="Purchase Requests">
          Create, submit, and track purchase requests through approval.
        </PageHeader>
        <Card>
          <CardContent className="p-8">
            <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
              <div>
                <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                  <ShieldAlert className="size-5" />
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  Purchase request access unavailable
                </p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Tenant purchase request workflows are not available to super
                  admin accounts.
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
            <Link
              className={getButtonClassName()}
              href={`${ROUTES.purchaseRequests}/new`}
            >
              <Plus className="size-4" />
              Create Request
            </Link>
          ) : null
        }
        eyebrow="Procurement"
        title="Purchase Requests"
      >
        Create, submit, and track requests from draft through approval.
      </PageHeader>

      {role === "MANAGER" ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Managers see their own requests and department-scoped company
            requests. The approval inbox shows only requests currently assigned
            to the manager approval step.
          </CardContent>
        </Card>
      ) : null}

      {role === "EMPLOYEE" ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Employees see only purchase requests they created.
          </CardContent>
        </Card>
      ) : null}

      <PurchaseRequestFilters
        dateFrom={dateFrom}
        dateTo={dateTo}
        departmentId={departmentId}
        departments={departments}
        isDisabled={requestsQuery.isLoading}
        priority={priority}
        resultCount={requestList.items.length}
        search={search}
        showDepartmentFilter={showDepartmentFilter}
        status={status}
        totalCount={requestList.total}
        onDateFromChange={(value) => {
          setDateFrom(value);
          resetToFirstPage();
        }}
        onDateToChange={(value) => {
          setDateTo(value);
          resetToFirstPage();
        }}
        onDepartmentChange={(value) => {
          setDepartmentId(value);
          resetToFirstPage();
        }}
        onPriorityChange={(value) => {
          setPriority(value);
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

      <PurchaseRequestsTable
        currentUser={currentUser}
        error={requestsQuery.error}
        isError={requestsQuery.isError}
        isLoading={requestsQuery.isLoading}
        requests={requestList.items}
        onCancel={setCancelRequest}
      />

      {!requestsQuery.isLoading &&
      !requestsQuery.isError &&
      requestList.total > 0 ? (
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

      <CancelRequestDialog
        request={cancelRequest}
        onClose={() => setCancelRequest(null)}
      />
    </div>
  );
}
