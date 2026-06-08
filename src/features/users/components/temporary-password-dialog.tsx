"use client";

import { Check, Copy, KeyRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type TemporaryPasswordDialogProps = {
  description: string;
  password: string | null;
  title: string;
  onClose: () => void;
};

export function TemporaryPasswordDialog({
  description,
  password,
  title,
  onClose,
}: TemporaryPasswordDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!password) {
    return null;
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(password ?? "");
    setCopied(true);
  }

  function handleClose() {
    setCopied(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close temporary password"
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
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-border bg-background p-4">
          <p className="font-mono text-base font-semibold tracking-normal text-foreground">
            {password}
          </p>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          This password is shown once. The user must change it at first login.
        </p>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={handleClose}>
            Close
          </Button>
          <Button type="button" onClick={handleCopy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy Password"}
          </Button>
        </div>
      </div>
    </div>
  );
}
