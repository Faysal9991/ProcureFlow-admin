"use client";

import { Edit3, Inbox, ShieldAlert, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { Vendor } from "../types";
import {
  formatVendorDate,
  getVendorStatus,
  getVendorStatusLabel,
} from "../utils";

type VendorsTableProps = {
  canManage: boolean;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  onDelete: (vendor: Vendor) => void;
  onEdit: (vendor: Vendor) => void;
  vendors: Vendor[];
};

export function VendorsTable({
  canManage,
  error,
  isError,
  isLoading,
  onDelete,
  onEdit,
  vendors,
}: VendorsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[1.4fr_1.2fr_130px_1.4fr_100px_120px]"
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
                Vendors unavailable
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

  if (vendors.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Inbox className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                No vendors found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a vendor or adjust your filters.
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
              <TableHead>Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.map((vendor) => {
              const status = getVendorStatus(vendor.status);

              return (
                <TableRow key={vendor.id}>
                  <TableCell className="min-w-48 font-medium">
                    {vendor.name}
                  </TableCell>
                  <TableCell className="min-w-40 text-muted-foreground">
                    {vendor.contactPerson || "Not set"}
                  </TableCell>
                  <TableCell className="min-w-32 text-muted-foreground">
                    {vendor.phone || "Not set"}
                  </TableCell>
                  <TableCell className="min-w-56 text-muted-foreground">
                    {vendor.email || "Not set"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status === "ACTIVE" ? "success" : "warning"}>
                      {getVendorStatusLabel(status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-32 text-muted-foreground">
                    {formatVendorDate(vendor.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        disabled={!canManage}
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(vendor)}
                      >
                        <Edit3 className="size-4" />
                        Edit
                      </Button>
                      <Button
                        disabled={!canManage}
                        size="sm"
                        variant="danger"
                        onClick={() => onDelete(vendor)}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
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
