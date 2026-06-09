"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/client";
import { useCancelPurchaseRequest } from "../hooks";
import type { PurchaseRequest } from "../types";
import { getPurchaseRequestMutationError } from "../utils";

type CancelRequestDialogProps = {
  request: PurchaseRequest | null;
  onClose: () => void;
};

export function CancelRequestDialog({
  request,
  onClose,
}: CancelRequestDialogProps) {
  const [apiError, setApiError] = useState("");
  const mutation = useCancelPurchaseRequest();

  if (!request) {
    return null;
  }

  const selectedRequest = request;

  function handleClose() {
    if (!mutation.isPending) {
      setApiError("");
      onClose();
    }
  }

  function handleCancelRequest() {
    setApiError("");
    mutation.mutate(selectedRequest.id, {
      onError: (error) => {
        setApiError(
          getPurchaseRequestMutationError(getApiErrorMessage(error)),
        );
      },
      onSuccess: () => {
        setApiError("");
        onClose();
      },
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close cancel confirmation"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-2xl">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Cancel request
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              This will cancel {selectedRequest.title}. Cancelled requests stay
              visible in history but cannot be submitted again.
            </p>
          </div>
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
            Keep request
          </Button>
          <Button
            isLoading={mutation.isPending}
            type="button"
            variant="danger"
            onClick={handleCancelRequest}
          >
            Cancel request
          </Button>
        </div>
      </div>
    </div>
  );
}
