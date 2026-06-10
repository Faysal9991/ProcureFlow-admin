"use client";

import Link from "next/link";
import { ArrowLeft, Edit3, PlayCircle, ShieldAlert } from "lucide-react";
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
import { AttachmentSection } from "@/features/attachments/components";
import { getApiErrorMessage } from "@/lib/api/client";
import { ROUTES } from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";
import { usePurchaseOrder } from "../hooks";
import type {
  PurchaseOrderAction,
  PurchaseOrderItem,
} from "../types";
import {
  canEditPurchaseOrder,
  canManagePurchaseOrders,
  canReadPurchaseOrders,
  formatCurrency,
  formatPurchaseOrderDate,
  getActionLabel,
  getAvailablePurchaseOrderActions,
  getPurchaseOrderStatusLabel,
  getPurchaseOrderStatusVariant,
} from "../utils";
import { PurchaseOrderActionDialog } from "./purchase-order-action-dialog";

type PurchaseOrderDetailPageProps = {
  orderId: string;
};

export function PurchaseOrderDetailPage({
  orderId,
}: PurchaseOrderDetailPageProps) {
  const currentUser = useAuthStore((state) => state.user);
  const canRead = canReadPurchaseOrders(currentUser?.role);
  const canManage = canManagePurchaseOrders(currentUser?.role);
  const orderQuery = usePurchaseOrder(orderId, canRead);
  const order = orderQuery.data;
  const [selectedAction, setSelectedAction] =
    useState<PurchaseOrderAction | null>(null);

  if (!canRead) {
    return (
      <BlockedDetailState message="Purchase order details are available to company admins, procurement, and finance users." />
    );
  }

  if (orderQuery.isLoading) {
    return <DetailSkeleton />;
  }

  if (orderQuery.isError || !order) {
    return (
      <BlockedDetailState
        message={getApiErrorMessage(orderQuery.error)}
        title="Purchase order unavailable"
      />
    );
  }

  const actions = getAvailablePurchaseOrderActions(order);

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Link
              className={getButtonClassName({ variant: "outline" })}
              href={ROUTES.purchaseOrders}
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
            {canManage && canEditPurchaseOrder(order) ? (
              <Link
                className={getButtonClassName({ variant: "outline" })}
                href={`/purchase-orders/${order.id}/edit`}
              >
                <Edit3 className="size-4" />
                Edit
              </Link>
            ) : null}
            {canManage
              ? actions.map((action) => (
                  <Button
                    key={action}
                    variant={action === "cancel" ? "danger" : "primary"}
                    onClick={() => setSelectedAction(action)}
                  >
                    <PlayCircle className="size-4" />
                    {getActionLabel(action)}
                  </Button>
                ))
              : null}
          </>
        }
        eyebrow="Purchase Order"
        title={order.poNumber}
      >
        {order.purchaseRequest.title}
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-4">
        <SummaryTile label="Status">
          <Badge variant={getPurchaseOrderStatusVariant(order.status)}>
            {getPurchaseOrderStatusLabel(order.status)}
          </Badge>
        </SummaryTile>
        <SummaryTile label="Vendor">{order.vendor.name}</SummaryTile>
        <SummaryTile label="Total">
          {formatCurrency(order.totalAmount)}
        </SummaryTile>
        <SummaryTile label="Created By">{order.createdBy.name}</SummaryTile>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>PO Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ItemsTable items={order.items ?? []} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetadataRow label="Request">
              {order.purchaseRequest.title}
            </MetadataRow>
            <MetadataRow label="Request status">
              {order.purchaseRequest.status}
            </MetadataRow>
            <MetadataRow label="Quotation">
              {order.quotationId ?? "Not linked"}
            </MetadataRow>
            <MetadataRow label="Created">
              {formatPurchaseOrderDate(order.createdAt)}
            </MetadataRow>
            <MetadataRow label="Updated">
              {formatPurchaseOrderDate(order.updatedAt)}
            </MetadataRow>
            <MetadataRow label="Issued">
              {formatPurchaseOrderDate(order.issuedAt)}
            </MetadataRow>
            <MetadataRow label="Received">
              {formatPurchaseOrderDate(order.receivedAt)}
            </MetadataRow>
            <MetadataRow label="Closed">
              {formatPurchaseOrderDate(order.closedAt)}
            </MetadataRow>
            <MetadataRow label="Cancelled">
              {formatPurchaseOrderDate(order.cancelledAt)}
            </MetadataRow>
            <MetadataRow label="Status actor">
              {order.statusChangedBy
                ? `${order.statusChangedBy.name} (${order.statusChangedBy.role})`
                : "Not set"}
            </MetadataRow>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Original Request Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Estimated Unit</TableHead>
                  <TableHead>Estimated Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(order.purchaseRequest.items ?? []).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-medium">{item.itemName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.description || "No description"}
                      </p>
                    </TableCell>
                    <TableCell>
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(item.estimatedUnitPrice)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(item.estimatedTotalPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {order.notes || "No notes added."}
            </p>
          </CardContent>
        </Card>
      </div>

      <AttachmentSection entityId={order.id} entityType="PURCHASE_ORDER" />

      <PurchaseOrderActionDialog
        action={selectedAction}
        order={order}
        onClose={() => setSelectedAction(null)}
      />
    </div>
  );
}

function ItemsTable({ items }: { items: PurchaseOrderItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead>Unit Price</TableHead>
          <TableHead>Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <p className="font-medium">{item.itemName}</p>
              <p className="text-xs text-muted-foreground">
                {item.description || "No description"}
              </p>
            </TableCell>
            <TableCell>
              {item.quantity} {item.unit}
            </TableCell>
            <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
            <TableCell className="font-medium">
              {formatCurrency(item.totalPrice)}
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
      <span className="max-w-64 text-right text-sm font-medium text-foreground">
        {children}
      </span>
    </div>
  );
}

function BlockedDetailState({
  message,
  title = "Purchase order access unavailable",
}: {
  message: string;
  title?: string;
}) {
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
              <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {message}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-20 rounded-lg bg-muted" />
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-96 rounded-lg bg-muted" />
    </div>
  );
}
