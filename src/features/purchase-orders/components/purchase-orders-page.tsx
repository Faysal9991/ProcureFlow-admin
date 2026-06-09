"use client";

import Link from "next/link";
import { Plus, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button, getButtonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useVendors } from "@/features/vendors/hooks";
import { ROUTES } from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";
import { usePurchaseOrders } from "../hooks";
import type {
  PurchaseOrder,
  PurchaseOrderAction,
  PurchaseOrderListFilters,
  PurchaseOrderStatus,
} from "../types";
import {
  canManagePurchaseOrders,
  canReadPurchaseOrders,
  PURCHASE_ORDER_PAGE_SIZE,
} from "../utils";
import { PurchaseOrderActionDialog } from "./purchase-order-action-dialog";
import { PurchaseOrderFilters } from "./purchase-order-filters";
import { PurchaseOrdersTable } from "./purchase-orders-table";

export function PurchaseOrdersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const role = currentUser?.role;
  const canRead = canReadPurchaseOrders(role);
  const canManage = canManagePurchaseOrders(role);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | PurchaseOrderStatus>("ALL");
  const [vendorId, setVendorId] = useState("");
  const [purchaseRequestId, setPurchaseRequestId] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [selectedAction, setSelectedAction] =
    useState<PurchaseOrderAction | null>(null);
  const vendorsQuery = useVendors({ limit: 100, page: 1 }, canRead);
  const vendors = vendorsQuery.data?.items ?? [];
  const queryFilters = useMemo<PurchaseOrderListFilters>(
    () => ({
      limit: PURCHASE_ORDER_PAGE_SIZE,
      page,
      purchaseRequestId: purchaseRequestId.trim() || undefined,
      search: search.trim() || undefined,
      status: status === "ALL" ? undefined : status,
      vendorId: vendorId || undefined,
    }),
    [page, purchaseRequestId, search, status, vendorId],
  );
  const purchaseOrdersQuery = usePurchaseOrders(queryFilters, canRead);
  const orderList = purchaseOrdersQuery.data ?? {
    items: [],
    limit: PURCHASE_ORDER_PAGE_SIZE,
    page,
    total: 0,
  };
  const totalPages = Math.max(1, Math.ceil(orderList.total / orderList.limit));
  const currentPage = orderList.page || page;

  function resetToFirstPage() {
    setPage(1);
  }

  function handleAction(order: PurchaseOrder, action: PurchaseOrderAction) {
    setSelectedOrder(order);
    setSelectedAction(action);
  }

  function handleCloseAction() {
    setSelectedOrder(null);
    setSelectedAction(null);
  }

  if (!canRead) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Procurement" title="Purchase Orders">
          Create, issue, receive, and close purchase orders.
        </PageHeader>
        <Card>
          <CardContent className="p-8">
            <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
              <div>
                <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                  <ShieldAlert className="size-5" />
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  Purchase order access unavailable
                </p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Purchase orders are available to company admins, procurement,
                  and finance users. Super admins do not manage tenant purchase
                  orders here.
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
            <Link
              className={getButtonClassName()}
              href={`${ROUTES.purchaseOrders}/new`}
            >
              <Plus className="size-4" />
              Create PO
            </Link>
          ) : null
        }
        eyebrow="Procurement"
        title="Purchase Orders"
      >
        Convert approved requests or selected RFQ quotations into purchase
        orders.
      </PageHeader>

      {!canManage ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Finance users can inspect purchase orders in read-only mode.
            Procurement and company admin users manage PO creation and lifecycle
            actions.
          </CardContent>
        </Card>
      ) : null}

      <PurchaseOrderFilters
        isDisabled={purchaseOrdersQuery.isLoading}
        purchaseRequestId={purchaseRequestId}
        resultCount={orderList.items.length}
        search={search}
        status={status}
        totalCount={orderList.total}
        vendorId={vendorId}
        vendors={vendors}
        onPurchaseRequestChange={(value) => {
          setPurchaseRequestId(value);
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
        onVendorChange={(value) => {
          setVendorId(value);
          resetToFirstPage();
        }}
      />

      <PurchaseOrdersTable
        canManage={canManage}
        error={purchaseOrdersQuery.error}
        isError={purchaseOrdersQuery.isError}
        isLoading={purchaseOrdersQuery.isLoading}
        orders={orderList.items}
        onAction={handleAction}
      />

      {!purchaseOrdersQuery.isLoading &&
      !purchaseOrdersQuery.isError &&
      orderList.total > 0 ? (
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

      <PurchaseOrderActionDialog
        action={selectedAction}
        order={selectedOrder}
        onClose={handleCloseAction}
      />
    </div>
  );
}
