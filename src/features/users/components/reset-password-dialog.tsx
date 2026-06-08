"use client";

import { KeyRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/client";
import { useResetUserPassword } from "../hooks";
import type { ManagedUser } from "../types";
import { getUserMutationError } from "../utils";

type ResetPasswordDialogProps = {
  user: ManagedUser | null;
  onClose: () => void;
  onTemporaryPassword: (password: string, title: string, description: string) => void;
};

export function ResetPasswordDialog({
  user,
  onClose,
  onTemporaryPassword,
}: ResetPasswordDialogProps) {
  const [apiError, setApiError] = useState("");
  const mutation = useResetUserPassword();

  if (!user) {
    return null;
  }

  const selectedUser = user;

  function handleClose() {
    if (!mutation.isPending) {
      setApiError("");
      onClose();
    }
  }

  function handleReset() {
    setApiError("");
    mutation.mutate(selectedUser.uuid, {
      onError: (error) => {
        setApiError(getUserMutationError(getApiErrorMessage(error)));
      },
      onSuccess: (data) => {
        setApiError("");
        onClose();
        onTemporaryPassword(
          data.temporaryPassword,
          "Password reset",
          `Share this new temporary password with ${selectedUser.name} through a secure channel.`,
        );
      },
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close reset password confirmation"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-2xl">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <KeyRound className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Reset password
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              A new temporary password will be generated for {selectedUser.name}.
              The user must change it at next login.
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
          <Button isLoading={mutation.isPending} type="button" onClick={handleReset}>
            <KeyRound className="size-4" />
            Reset Password
          </Button>
        </div>
      </div>
    </div>
  );
}
