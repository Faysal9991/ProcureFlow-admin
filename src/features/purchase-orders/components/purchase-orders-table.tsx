"use client";

import Link from "next/link";
import {
  Edit3,
  Eye,
  Inbox,
  PlayCircle,
  ShieldAlert,
} from "lucide-react";
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
import type { PurchaseOrder, PurchaseOrderAction } from "../types";
import {
  canEditPurchaseOrder,
  formatCurrency,
  formatPurchaseOrderDate,
  getActionLabel,
  getAvailablePurchaseOrderActions,
  getPurchaseOrderStatusLabel,
  getPurchaseOrderStatusVariant,
} from "../utils";

type PurchaseOrdersTableProps = {
  canManage: boolean;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  onAction: (order: PurchaseOrder, action: PurchaseOrderAction) => void;
  orders: PurchaseOrder[];
};

export function PurchaseOrdersTable({
  canManage,
  error,
  isError,
  isLoading,
  onAction,
  orders,
}: PurchaseOrdersTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[130px_1.4fr_1.2fr_110px_130px_140px]"
              >
                <div className="h-4 rounded-md bg-muted" />
                <div className="h-4 rounded-md bg-muted" />
                <div className="h-4 rounded-md bg-muted" />
                <div className="h-4 rounded-md bg-muted" />
                <div className="h-4 rounded-md bg-muted" />
                <div className="h-4 rounded-md bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                <ShieldAlert className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Purchase orders unavailable
              </p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {getApiErrorMessage(error)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Inbox className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                No purchase orders found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a purchase order or adjust your filters.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO Number</TableHead>
              <TableHead>Request</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const actions = getAvailablePurchaseOrderActions(order);

              return (
                <TableRow key={order.id}>
                  <TableCell className="min-w-36 font-medium">
                    {order.poNumber}
                  </TableCell>
                  <TableCell className="min-w-56">
                    <p className="font-medium">{order.purchaseRequest.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.purchaseRequest.status}
                    </p>
                  </TableCell>
                  <TableCell className="min-w-44 text-muted-foreground">
                    {order.vendor.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPurchaseOrderStatusVariant(order.status)}>
                      {getPurchaseOrderStatusLabel(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-32 font-medium">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  <TableCell className="min-w-32 text-muted-foreground">
                    {formatPurchaseOrderDate(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Link
                        className={getButtonClassName({
                          size: "sm",
                          variant: "outline",
                        })}
                        href={`/purchase-orders/${order.id}`}
                      >
                        <Eye className="size-4" />
                        View
                      </Link>
                      {canManage && canEditPurchaseOrder(order) ? (
                        <Link
                          className={getButtonClassName({
                            size: "sm",
                            variant: "outline",
                          })}
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
                              size="sm"
                              variant={action === "cancel" ? "danger" : "primary"}
                              onClick={() => onAction(order, action)}
                            >
                              <PlayCircle className="size-4" />
                              {getActionLabel(action)}
                            </Button>
                          ))
                        : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
