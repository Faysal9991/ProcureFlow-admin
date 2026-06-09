"use client";

import Link from "next/link";
import { CheckCircle2, Eye, Inbox, ShieldAlert, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, getButtonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api/client";
import type { PurchaseRequest } from "@/features/purchase-requests/types";
import {
  formatCurrency,
  formatRequestDate,
  getPriorityLabel,
  getPriorityVariant,
} from "@/features/purchase-requests/utils";

type ApprovalInboxTableProps = {
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  onApprove: (request: PurchaseRequest) => void;
  onReject: (request: PurchaseRequest) => void;
  requests: PurchaseRequest[];
};

export function ApprovalInboxTable({
  error,
  isError,
  isLoading,
  onApprove,
  onReject,
  requests,
}: ApprovalInboxTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approval Inbox</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[1.4fr_1fr_1fr_100px_120px_130px]"
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
                Approval inbox unavailable
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

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Inbox className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                No pending approvals
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Current-step requests assigned to you will appear here.
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
              <TableHead>Request</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Needed</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Step</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="min-w-64">
                  <div className="font-medium text-foreground">
                    {request.title}
                  </div>
                  {request.description ? (
                    <div className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                      {request.description}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell className="min-w-40 text-muted-foreground">
                  {request.requesterName || "Not available"}
                </TableCell>
                <TableCell className="min-w-40 text-muted-foreground">
                  {request.departmentName || "Not available"}
                </TableCell>
                <TableCell>
                  <Badge variant={getPriorityVariant(request.priority)}>
                    {getPriorityLabel(request.priority)}
                  </Badge>
                </TableCell>
                <TableCell className="min-w-32 text-muted-foreground">
                  {formatRequestDate(request.neededDate)}
                </TableCell>
                <TableCell className="min-w-32 font-medium">
                  {formatCurrency(request.estimatedTotal)}
                </TableCell>
                <TableCell className="min-w-20 text-muted-foreground">
                  Step {request.currentStep || 1}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link
                      className={getButtonClassName({
                        size: "sm",
                        variant: "outline",
                      })}
                      href={`/purchase-requests/${request.id}`}
                    >
                      <Eye className="size-4" />
                      View
                    </Link>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onApprove(request)}
                    >
                      <CheckCircle2 className="size-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onReject(request)}
                    >
                      <XCircle className="size-4" />
                      Reject
                    </Button>
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
