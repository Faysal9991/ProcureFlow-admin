"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/client";
import type { PurchaseRequest } from "@/features/purchase-requests/types";
import {
  formatCurrency,
  getPurchaseRequestMutationError,
} from "@/features/purchase-requests/utils";
import {
  useApprovePurchaseRequest,
  useRejectPurchaseRequest,
} from "../hooks";

type ApprovalActionDialogProps = {
  action: "approve" | "reject";
  request: PurchaseRequest | null;
  onClose: () => void;
};

export function ApprovalActionDialog({
  action,
  request,
  onClose,
}: ApprovalActionDialogProps) {
  const [comment, setComment] = useState("");
  const [apiError, setApiError] = useState("");
  const approveMutation = useApprovePurchaseRequest();
  const rejectMutation = useRejectPurchaseRequest();
  const mutation = action === "approve" ? approveMutation : rejectMutation;

  if (!request) {
    return null;
  }

  const selectedRequest = request;
  const isApprove = action === "approve";

  function handleClose() {
    if (!mutation.isPending) {
      setApiError("");
      setComment("");
      onClose();
    }
  }

  function handleSubmit() {
    setApiError("");
    mutation.mutate(
      {
        payload: { comment: comment.trim() || undefined },
        requestId: selectedRequest.id,
      },
      {
        onError: (error) => {
          setApiError(
            getPurchaseRequestMutationError(getApiErrorMessage(error)),
          );
        },
        onSuccess: () => {
          setApiError("");
          setComment("");
          onClose();
        },
      },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close approval action"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-lg rounded-lg border border-border bg-surface p-5 shadow-2xl">
        <div className="flex gap-3">
          <div
            className={
              isApprove
                ? "flex size-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success"
                : "flex size-10 shrink-0 items-center justify-center rounded-lg bg-error/10 text-error"
            }
          >
            {isApprove ? (
              <CheckCircle2 className="size-5" />
            ) : (
              <XCircle className="size-5" />
            )}
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {isApprove ? "Approve request" : "Reject request"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {selectedRequest.title} totals{" "}
              {formatCurrency(selectedRequest.estimatedTotal)}. The backend
              will validate whether this request is currently assigned to your
              approval step.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <label
            className="text-sm font-medium text-foreground"
            htmlFor="approval-comment"
          >
            Comment
          </label>
          <textarea
            id="approval-comment"
            className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70"
            disabled={mutation.isPending}
            placeholder={
              isApprove
                ? "Optional approval note"
                : "Reason for rejection"
            }
            rows={4}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </div>

        {apiError ? (
          <div className="mt-4 rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
            {apiError}
          </div>
        ) : null}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            disabled={mutation.isPending}
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            isLoading={mutation.isPending}
            type="button"
            variant={isApprove ? "primary" : "danger"}
            onClick={handleSubmit}
          >
            {isApprove ? "Approve" : "Reject"}
          </Button>
        </div>
      </div>
    </div>
  );
}
