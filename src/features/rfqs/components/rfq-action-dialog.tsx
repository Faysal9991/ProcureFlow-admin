"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  useCancelRFQ,
  useOpenRFQ,
  useSelectQuotation,
} from "../hooks";
import type { ComparisonQuotation, RFQ, RFQAction } from "../types";
import { getRFQMutationError } from "../utils";

type RFQActionDialogProps = {
  action: RFQAction | null;
  quotation?: ComparisonQuotation | null;
  rfq: RFQ | null;
  onClose: () => void;
};

export function RFQActionDialog({
  action,
  quotation,
  rfq,
  onClose,
}: RFQActionDialogProps) {
  const [apiError, setApiError] = useState("");
  const openMutation = useOpenRFQ();
  const cancelMutation = useCancelRFQ();
  const selectMutation = useSelectQuotation();

  if (!rfq || !action) {
    return null;
  }

  const selectedRFQ = rfq;
  const selectedAction = action;
  const isPending =
    openMutation.isPending ||
    cancelMutation.isPending ||
    selectMutation.isPending;
  const copy = getActionCopy(selectedAction, selectedRFQ, quotation);

  function handleClose() {
    if (!isPending) {
      setApiError("");
      onClose();
    }
  }

  function handleConfirm() {
    setApiError("");
    const onError = (error: unknown) => {
      setApiError(getRFQMutationError(getApiErrorMessage(error)));
    };
    const onSuccess = () => {
      setApiError("");
      onClose();
    };

    if (selectedAction === "open") {
      openMutation.mutate(selectedRFQ.id, { onError, onSuccess });
      return;
    }

    if (selectedAction === "cancel") {
      cancelMutation.mutate(selectedRFQ.id, { onError, onSuccess });
      return;
    }

    if (quotation) {
      selectMutation.mutate(
        { id: selectedRFQ.id, payload: { quotationId: quotation.id } },
        { onError, onSuccess },
      );
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close RFQ action confirmation"
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
              {copy.title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {copy.description}
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
            disabled={isPending}
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            Back
          </Button>
          <Button
            isLoading={isPending}
            type="button"
            variant={selectedAction === "cancel" ? "danger" : "primary"}
            onClick={handleConfirm}
          >
            {copy.confirm}
          </Button>
        </div>
      </div>
    </div>
  );
}

function getActionCopy(
  action: RFQAction,
  rfq: RFQ,
  quotation?: ComparisonQuotation | null,
) {
  switch (action) {
    case "open":
      return {
        confirm: "Open RFQ",
        description: `This will open ${rfq.rfqNumber} so quotations can be entered for invited vendors.`,
        title: "Open RFQ",
      };
    case "cancel":
      return {
        confirm: "Cancel RFQ",
        description: `This will cancel ${rfq.rfqNumber}. Cancelled RFQs are read-only.`,
        title: "Cancel RFQ",
      };
    case "select":
      return {
        confirm: "Select Quotation",
        description: `This will select ${quotation?.vendor.name ?? "this vendor"} as the winning quotation and complete ${rfq.rfqNumber}.`,
        title: "Select winning quotation",
      };
  }
}
