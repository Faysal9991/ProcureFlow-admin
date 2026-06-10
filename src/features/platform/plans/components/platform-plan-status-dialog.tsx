"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUpdatePlatformPlan } from "@/features/platform/companies/hooks";
import type { PlatformPlan } from "@/features/platform/companies/types";
import { getApiErrorMessage } from "@/lib/api/client";
import { getPlanMutationError } from "../utils";

type PlatformPlanStatusDialogProps = {
  isActivating: boolean;
  onClose: () => void;
  plan: PlatformPlan | null;
};

export function PlatformPlanStatusDialog({
  isActivating,
  onClose,
  plan,
}: PlatformPlanStatusDialogProps) {
  const [apiError, setApiError] = useState("");
  const mutation = useUpdatePlatformPlan();

  if (!plan) {
    return null;
  }

  function handleClose() {
    if (!mutation.isPending) {
      setApiError("");
      onClose();
    }
  }

  function handleConfirm() {
    if (!plan) {
      return;
    }
    setApiError("");
    mutation.mutate(
      {
        id: plan.id,
        payload: { isActive: isActivating },
      },
      {
        onError: (error) => {
          setApiError(getPlanMutationError(getApiErrorMessage(error)));
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
        aria-label="Close plan status confirmation"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-2xl">
        <div className="flex gap-3">
          <div
            className={
              isActivating
                ? "flex size-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success"
                : "flex size-10 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning"
            }
          >
            {isActivating ? (
              <CheckCircle2 className="size-5" />
            ) : (
              <AlertTriangle className="size-5" />
            )}
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {isActivating ? "Activate plan" : "Deactivate plan"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {isActivating
                ? `${plan.name} will become available for company creation and assignment.`
                : `${plan.name} will be hidden from new company creation and assignment. Existing subscriptions keep their current plan.`}
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
            variant={isActivating ? "primary" : "danger"}
            onClick={handleConfirm}
          >
            {isActivating ? "Activate" : "Deactivate"}
          </Button>
        </div>
      </div>
    </div>
  );
}
