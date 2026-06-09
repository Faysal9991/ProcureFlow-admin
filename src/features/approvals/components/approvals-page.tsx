"use client";

import { ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDepartments } from "@/features/departments/hooks";
import { PurchaseRequestFilters } from "@/features/purchase-requests/components";
import type {
  PurchaseRequest,
  PurchaseRequestPriority,
  PurchaseRequestStatus,
} from "@/features/purchase-requests/types";
import {
  canAccessApprovalInbox,
  canUseDepartmentFilter,
  PURCHASE_REQUEST_PAGE_SIZE,
} from "@/features/purchase-requests/utils";
import { useAuthStore } from "@/store/auth-store";
import { useApprovalInbox } from "../hooks";
import type { ApprovalInboxFilters } from "../types";
import { ApprovalActionDialog } from "./approval-action-dialog";
import { ApprovalInboxTable } from "./approval-inbox-table";

type ApprovalActionState = {
  action: "approve" | "reject";
  request: PurchaseRequest;
};

export function ApprovalsPage() {
  const currentUser = useAuthStore((state) => state.user);
  const canAccess = canAccessApprovalInbox(currentUser?.role);
  const showDepartmentFilter = canUseDepartmentFilter(currentUser?.role);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<"ALL" | PurchaseRequestPriority>(
    "ALL",
  );
  const [departmentId, setDepartmentId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [approvalAction, setApprovalAction] =
    useState<ApprovalActionState | null>(null);
  const departmentsQuery = useDepartments(canAccess && showDepartmentFilter);
  const departments = useMemo(
    () => departmentsQuery.data ?? [],
    [departmentsQuery.data],
  );
  const queryFilters = useMemo<ApprovalInboxFilters>(
    () => ({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      departmentId:
        showDepartmentFilter && departmentId ? departmentId : undefined,
      limit: PURCHASE_REQUEST_PAGE_SIZE,
      page,
      priority: priority === "ALL" ? undefined : priority,
      search: search.trim() || undefined,
    }),
    [dateFrom, dateTo, departmentId, page, priority, search, showDepartmentFilter],
  );
  const approvalsQuery = useApprovalInbox(queryFilters, canAccess);
  const approvalList = approvalsQuery.data ?? {
    items: [],
    limit: PURCHASE_REQUEST_PAGE_SIZE,
    page,
    total: 0,
  };
  const totalPages = Math.max(1, Math.ceil(approvalList.total / approvalList.limit));
  const currentPage = approvalList.page || page;

  function resetToFirstPage() {
    setPage(1);
  }

  if (!canAccess) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Procurement" title="Approvals">
          Review purchase requests assigned to your current approval step.
        </PageHeader>
        <Card>
          <CardContent className="p-8">
            <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
              <div>
                <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                  <ShieldAlert className="size-5" />
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  Approval inbox unavailable
                </p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Approval inbox access is available to managers, procurement,
                  finance, and company admins when the backend workflow assigns
                  them a current approval step.
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
      <PageHeader eyebrow="Procurement" title="Approval Inbox">
        Review current-step purchase requests and record approval decisions.
      </PageHeader>

      <PurchaseRequestFilters
        dateFrom={dateFrom}
        dateTo={dateTo}
        departmentId={departmentId}
        departments={departments}
        isDisabled={approvalsQuery.isLoading}
        priority={priority}
        resultCount={approvalList.items.length}
        search={search}
        showDepartmentFilter={showDepartmentFilter}
        showStatusFilter={false}
        status={"ALL" as "ALL" | PurchaseRequestStatus}
        totalCount={approvalList.total}
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
        onStatusChange={() => undefined}
      />

      <ApprovalInboxTable
        error={approvalsQuery.error}
        isError={approvalsQuery.isError}
        isLoading={approvalsQuery.isLoading}
        requests={approvalList.items}
        onApprove={(request) => setApprovalAction({ action: "approve", request })}
        onReject={(request) => setApprovalAction({ action: "reject", request })}
      />

      {!approvalsQuery.isLoading &&
      !approvalsQuery.isError &&
      approvalList.total > 0 ? (
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

      <ApprovalActionDialog
        action={approvalAction?.action ?? "approve"}
        request={approvalAction?.request ?? null}
        onClose={() => setApprovalAction(null)}
      />
    </div>
  );
}
