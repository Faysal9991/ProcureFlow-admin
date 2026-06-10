"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/client";
import { useCancelPlatformBillingInvoice } from "../hooks";
import type { PlatformBillingInvoice } from "../types";
import { getBillingMutationError } from "../utils";

type CancelInvoiceDialogProps = {
  invoice: PlatformBillingInvoice | null;
  onClose: () => void;
};

export function CancelInvoiceDialog({
  invoice,
  onClose,
}: CancelInvoiceDialogProps) {
  const [apiError, setApiError] = useState("");
  const mutation = useCancelPlatformBillingInvoice();

  if (!invoice) {
    return null;
  }

  function handleClose() {
    if (!mutation.isPending) {
      setApiError("");
      onClose();
    }
  }

  function handleCancelInvoice() {
    if (!invoice) {
      return;
    }
    setApiError("");
    mutation.mutate(invoice.id, {
      onError: (error) => {
        setApiError(getBillingMutationError(getApiErrorMessage(error)));
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
        aria-label="Close cancel invoice confirmation"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-2xl">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-error/10 text-error">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Cancel billing invoice
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              This will cancel {invoice.invoiceNumber}. Cancelled invoices
              cannot receive payments.
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
            Keep Invoice
          </Button>
          <Button
            isLoading={mutation.isPending}
            type="button"
            variant="danger"
            onClick={handleCancelInvoice}
          >
            Cancel Invoice
          </Button>
        </div>
      </div>
    </div>
  );
}
