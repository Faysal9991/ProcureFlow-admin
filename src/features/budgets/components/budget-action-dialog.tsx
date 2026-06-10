"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/client";
import { useRunBudgetAction } from "../hooks";
import type { Budget, BudgetAction } from "../types";
import {
  getBudgetActionDescription,
  getBudgetActionLabel,
  getBudgetMutationError,
} from "../utils";

type BudgetActionDialogProps = {
  action: BudgetAction;
  budget: Budget | null;
  onClose: () => void;
};

export function BudgetActionDialog({
  action,
  budget,
  onClose,
}: BudgetActionDialogProps) {
  const [apiError, setApiError] = useState("");
  const mutation = useRunBudgetAction();

  if (!budget) {
    return null;
  }

  const selectedBudget = budget;
  const label = getBudgetActionLabel(action);

  function handleClose() {
    if (!mutation.isPending) {
      setApiError("");
      onClose();
    }
  }

  function handleConfirm() {
    setApiError("");
    mutation.mutate(
      {
        action,
        id: selectedBudget.id,
      },
      {
        onError: (error) => {
          setApiError(getBudgetMutationError(getApiErrorMessage(error)));
        },
        onSuccess: () => {
          setApiError("");
          onClose();
        },
      },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label={`Close ${label} confirmation`}
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
            <h2 className="text-base font-semibold text-foreground">{label}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {getBudgetActionDescription(action, selectedBudget)}
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
            Cancel
          </Button>
          <Button
            isLoading={mutation.isPending}
            type="button"
            variant={action === "close" ? "danger" : "primary"}
            onClick={handleConfirm}
          >
            {label}
          </Button>
        </div>
      </div>
    </div>
  );
}
