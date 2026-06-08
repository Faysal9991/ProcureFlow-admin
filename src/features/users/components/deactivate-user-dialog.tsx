"use client";

import { AlertTriangle, Power, PowerOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/client";
import { useActivateUser, useDeactivateUser } from "../hooks";
import type { ManagedUser } from "../types";
import {
  getUserMutationError,
  getUserStatus,
} from "../utils";

type DeactivateUserDialogProps = {
  user: ManagedUser | null;
  onClose: () => void;
};

export function DeactivateUserDialog({
  user,
  onClose,
}: DeactivateUserDialogProps) {
  const [apiError, setApiError] = useState("");
  const activateMutation = useActivateUser();
  const deactivateMutation = useDeactivateUser();

  if (!user) {
    return null;
  }

  const selectedUser = user;
  const isActive = getUserStatus(selectedUser.status) === "ACTIVE";
  const mutation = isActive ? deactivateMutation : activateMutation;
  const title = isActive ? "Deactivate user" : "Activate user";
  const actionLabel = isActive ? "Deactivate user" : "Activate user";
  const Icon = isActive ? PowerOff : Power;

  function handleClose() {
    if (!mutation.isPending) {
      setApiError("");
      onClose();
    }
  }

  function handleSubmit() {
    setApiError("");
    mutation.mutate(selectedUser.uuid, {
      onError: (error) => {
        setApiError(getUserMutationError(getApiErrorMessage(error)));
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
        aria-label={`Close ${title.toLowerCase()} confirmation`}
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-2xl">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
            {isActive ? (
              <AlertTriangle className="size-5" />
            ) : (
              <Power className="size-5" />
            )}
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {isActive
                ? `${selectedUser.name} will no longer be able to sign in until reactivated.`
                : `${selectedUser.name} will regain access with their current password policy.`}
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
            variant={isActive ? "danger" : "primary"}
            onClick={handleSubmit}
          >
            <Icon className="size-4" />
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
