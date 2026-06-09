"use client";

import Link from "next/link";
import { Eye, Inbox, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getButtonClassName } from "@/components/ui/button";
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
import type { RFQ } from "../types";
import {
  formatRFQDate,
  getRFQStatusLabel,
  getRFQStatusVariant,
} from "../utils";

type RFQsTableProps = {
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  rfqs: RFQ[];
};

export function RFQsTable({
  error,
  isError,
  isLoading,
  rfqs,
}: RFQsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>RFQs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[130px_1.5fr_1fr_120px_130px_110px]"
              >
                {Array.from({ length: 6 }).map((__, childIndex) => (
                  <div key={childIndex} className="h-4 rounded-md bg-muted" />
                ))}
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
                RFQs unavailable
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

  if (rfqs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Inbox className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                No RFQs found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create an RFQ or adjust your filters.
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
              <TableHead>RFQ Number</TableHead>
              <TableHead>Request</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rfqs.map((rfq) => (
              <TableRow key={rfq.id}>
                <TableCell className="min-w-36 font-medium">
                  {rfq.rfqNumber}
                </TableCell>
                <TableCell className="min-w-64">
                  <p className="font-medium">{rfq.purchaseRequest.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {rfq.purchaseRequest.status}
                  </p>
                </TableCell>
                <TableCell className="min-w-40 text-muted-foreground">
                  {rfq.purchaseRequest.department.name}
                </TableCell>
                <TableCell>
                  <Badge variant={getRFQStatusVariant(rfq.status)}>
                    {getRFQStatusLabel(rfq.status)}
                  </Badge>
                </TableCell>
                <TableCell className="min-w-32 text-muted-foreground">
                  {formatRFQDate(rfq.dueDate)}
                </TableCell>
                <TableCell className="min-w-32 text-muted-foreground">
                  {formatRFQDate(rfq.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Link
                      className={getButtonClassName({
                        size: "sm",
                        variant: "outline",
                      })}
                      href={`/rfqs/${rfq.id}`}
                    >
                      <Eye className="size-4" />
                      View
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
