"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  Send,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/shared";
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
import { ApprovalActionDialog } from "@/features/approvals/components/approval-action-dialog";
import { ApprovalHistory } from "@/features/approvals/components/approval-history";
import { AttachmentSection } from "@/features/attachments/components";
import { BudgetAvailabilityChecker } from "@/features/budgets/components";
import { getApiErrorMessage } from "@/lib/api/client";
import { ROUTES } from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";
import { usePurchaseRequest, useSubmitPurchaseRequest } from "../hooks";
import type { PurchaseRequest } from "../types";
import {
  canAccessPurchaseRequests,
  canCancelRequest,
  canEditRequest,
  canShowApprovalActions,
  canSubmitRequest,
  formatCurrency,
  formatRequestDate,
  getApprovalStatusLabel,
  getPriorityLabel,
  getPriorityVariant,
  getPurchaseRequestMutationError,
  getRequestStatusLabel,
  getRequestStatusVariant,
} from "../utils";
import { CancelRequestDialog } from "./cancel-request-dialog";

type PurchaseRequestDetailPageProps = {
  requestId: string;
};

type ApprovalActionState = {
  action: "approve" | "reject";
  request: PurchaseRequest;
};

export function PurchaseRequestDetailPage({
  requestId,
}: PurchaseRequestDetailPageProps) {
  const currentUser = useAuthStore((state) => state.user);
  const canAccess = canAccessPurchaseRequests(currentUser?.role);
  const requestQuery = usePurchaseRequest(requestId, canAccess);
  const submitMutation = useSubmitPurchaseRequest();
  const [cancelRequest, setCancelRequest] = useState<PurchaseRequest | null>(
    null,
  );
  const [approvalAction, setApprovalAction] =
    useState<ApprovalActionState | null>(null);
  const [apiError, setApiError] = useState("");
  const request = requestQuery.data;

  if (!canAccess) {
    return (
      <BlockedDetailState
        title="Purchase request unavailable"
        message="Tenant purchase request workflows are not available to this account."
      />
    );
  }

  if (requestQuery.isLoading) {
    return <DetailSkeleton />;
  }

  if (requestQuery.isError || !request) {
    return (
      <BlockedDetailState
        title="Purchase request unavailable"
        message={getApiErrorMessage(requestQuery.error)}
      />
    );
  }

  function handleSubmitRequest() {
    if (!request) {
      return;
    }

    setApiError("");
    submitMutation.mutate(request.id, {
      onError: (error) => {
        setApiError(getPurchaseRequestMutationError(getApiErrorMessage(error)));
      },
      onSuccess: () => {
        setApiError("");
      },
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              className={getButtonClassName({ variant: "outline" })}
              href={ROUTES.purchaseRequests}
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
            {canEditRequest(request, currentUser) ? (
              <Link
                className={getButtonClassName({ variant: "outline" })}
                href={`/purchase-requests/${request.id}/edit`}
              >
                <Edit3 className="size-4" />
                Edit
              </Link>
            ) : null}
            {canSubmitRequest(request, currentUser) ? (
              <Button
                isLoading={submitMutation.isPending}
                variant="secondary"
                onClick={handleSubmitRequest}
              >
                <Send className="size-4" />
                Submit
              </Button>
            ) : null}
            {canCancelRequest(request, currentUser) ? (
              <Button variant="danger" onClick={() => setCancelRequest(request)}>
                <XCircle className="size-4" />
                Cancel
              </Button>
            ) : null}
            {canShowApprovalActions(request, currentUser) ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setApprovalAction({ action: "approve", request })
                  }
                >
                  <CheckCircle2 className="size-4" />
                  Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setApprovalAction({ action: "reject", request })}
                >
                  <XCircle className="size-4" />
                  Reject
                </Button>
              </>
            ) : null}
          </div>
        }
        eyebrow="Purchase Request"
        title={request.title}
      >
        Requested by {request.requesterName || "Unknown requester"} for{" "}
        {request.departmentName || "No department"}.
      </PageHeader>

      {apiError ? (
        <div className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
          {apiError}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-4">
        <DetailMetric
          label="Status"
          value={
            <Badge variant={getRequestStatusVariant(request.status)}>
              {getRequestStatusLabel(request.status)}
            </Badge>
          }
        />
        <DetailMetric
          label="Priority"
          value={
            <Badge variant={getPriorityVariant(request.priority)}>
              {getPriorityLabel(request.priority)}
            </Badge>
          }
        />
        <DetailMetric
          label="Estimated Total"
          value={formatCurrency(request.estimatedTotal)}
        />
        <DetailMetric
          label="Approval"
          value={getApprovalStatusLabel(request.approvalStatus)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailField label="Requester" value={request.requesterName} />
            <DetailField label="Requester Role" value={request.requesterRole} />
            <DetailField label="Department" value={request.departmentName} />
            <DetailField label="Needed Date" value={formatRequestDate(request.neededDate)} />
            <DetailField label="Submitted" value={formatRequestDate(request.submittedAt)} />
            <DetailField label="Current Step" value={`Step ${request.currentStep || 0}`} />
            <DetailField label="Created" value={formatRequestDate(request.createdAt)} />
            <DetailField label="Updated" value={formatRequestDate(request.updatedAt)} />
          </div>
          {request.description ? (
            <div className="mt-5 rounded-lg border border-border bg-background p-4">
              <p className="text-sm font-medium text-foreground">
                Description
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {request.description}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(request.items ?? []).map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="min-w-64">
                    <div className="font-medium text-foreground">
                      {item.itemName}
                    </div>
                    {item.description ? (
                      <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {item.description}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>
                    {formatCurrency(item.estimatedUnitPrice)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(item.estimatedTotalPrice)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} className="text-right font-medium">
                  Request Estimated Total
                </TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(request.estimatedTotal)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {request.budget ? (
        <Card>
          <CardHeader>
            <CardTitle>Budget Check</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <DetailField
                label="Available"
                value={formatCurrency(request.budget.availableAmount)}
              />
              <DetailField
                label="Request Amount"
                value={formatCurrency(request.budget.requestAmount)}
              />
              <DetailField
                label="Reserved"
                value={formatCurrency(request.budget.reservedAmount)}
              />
              <DetailField
                label="Sufficient"
                value={request.budget.isSufficient ? "Yes" : "No"}
              />
            </div>
            {request.budget.message ? (
              <p className="mt-4 rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground">
                {request.budget.message}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <BudgetAvailabilityChecker
        defaultAmount={request.estimatedTotal}
        defaultDate={request.submittedAt || request.neededDate || request.createdAt}
        departmentId={request.departmentId}
        description="Check live budget availability for this request amount before final approval."
        title="Live Budget Availability"
      />

      <ApprovalHistory requestId={request.id} />

      <AttachmentSection
        entityId={request.id}
        entityType="PURCHASE_REQUEST"
      />

      <CancelRequestDialog
        request={cancelRequest}
        onClose={() => setCancelRequest(null)}
      />

      <ApprovalActionDialog
        action={approvalAction?.action ?? "approve"}
        request={approvalAction?.request ?? null}
        onClose={() => setApprovalAction(null)}
      />
    </div>
  );
}

function DetailMetric({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="mt-2 text-lg font-semibold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}

function DetailField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-foreground">
        {value || "Not available"}
      </p>
    </div>
  );
}

function BlockedDetailState({
  message,
  title,
}: {
  message: string;
  title: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Procurement" title={title}>
        {message}
      </PageHeader>
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                <ShieldAlert className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Request unavailable
              </p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {message}
              </p>
              <div className="mt-4 flex justify-center">
                <Link
                  className={getButtonClassName({ variant: "outline" })}
                  href={ROUTES.purchaseRequests}
                >
                  Back to requests
                </Link>
              </div>
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
      <div className="h-16 max-w-xl rounded-lg bg-muted" />
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 rounded-lg bg-muted" />
        ))}
      </div>
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="h-32 rounded-lg bg-muted" />
          <div className="h-48 rounded-lg bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}
