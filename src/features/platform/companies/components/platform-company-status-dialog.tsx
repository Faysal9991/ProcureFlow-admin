"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/client";
import { useUpdatePlatformCompanyStatus } from "../hooks";
import type { PlatformCompany, PlatformCompanyAction } from "../types";
import {
  getCompanyActionDescription,
  getCompanyActionLabel,
  getPlatformMutationError,
} from "../utils";

type PlatformCompanyStatusDialogProps = {
  action: PlatformCompanyAction | null;
  company: PlatformCompany | null;
  onClose: () => void;
};

export function PlatformCompanyStatusDialog({
  action,
  company,
  onClose,
}: PlatformCompanyStatusDialogProps) {
  const [apiError, setApiError] = useState("");
  const mutation = useUpdatePlatformCompanyStatus();

  if (!action || !company) {
    return null;
  }

  const isSuspending = action === "suspend";

  function handleClose() {
    if (!mutation.isPending) {
      setApiError("");
      onClose();
    }
  }

  function handleConfirm() {
    if (!company || !action) {
      return;
    }
    setApiError("");
    mutation.mutate(
      {
        action,
        id: company.id,
      },
      {
        onError: (error) => {
          setApiError(getPlatformMutationError(getApiErrorMessage(error)));
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
        aria-label="Close status confirmation"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-2xl">
        <div className="flex gap-3">
          <div
            className={
              isSuspending
                ? "flex size-10 shrink-0 items-center justify-center rounded-lg bg-error/10 text-error"
                : "flex size-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success"
            }
          >
            {isSuspending ? (
              <AlertTriangle className="size-5" />
            ) : (
              <CheckCircle2 className="size-5" />
            )}
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {getCompanyActionLabel(action)}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {getCompanyActionDescription(action, company.name)}
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
            variant={isSuspending ? "danger" : "primary"}
            onClick={handleConfirm}
          >
            {isSuspending ? "Suspend" : "Activate"}
          </Button>
        </div>
      </div>
    </div>
  );
}
