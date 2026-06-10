"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { useUpdatePlatformCompany } from "../hooks";
import {
  platformCompanyEditSchema,
  type PlatformCompanyEditValues,
} from "../schemas";
import type { PlatformCompany } from "../types";
import { getPlatformMutationError } from "../utils";

type PlatformCompanyEditDrawerProps = {
  company: PlatformCompany | null;
  isOpen: boolean;
  onClose: () => void;
};

export function PlatformCompanyEditDrawer({
  company,
  isOpen,
  onClose,
}: PlatformCompanyEditDrawerProps) {
  const [apiError, setApiError] = useState("");
  const mutation = useUpdatePlatformCompany();
  const defaultValues = useMemo<PlatformCompanyEditValues>(
    () => ({
      address: company?.address ?? "",
      email: company?.email ?? "",
      name: company?.name ?? "",
      phone: company?.phone ?? "",
      requireRfqBeforePo: company?.requireRfqBeforePo ?? false,
    }),
    [company],
  );
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<PlatformCompanyEditValues>({
    defaultValues,
    resolver: zodResolver(platformCompanyEditSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
  }, [defaultValues, isOpen, reset]);

  if (!isOpen || !company) {
    return null;
  }

  function handleClose() {
    if (!mutation.isPending) {
      setApiError("");
      onClose();
    }
  }

  function normalizeOptional(value?: string) {
    const trimmed = value?.trim() ?? "";
    return trimmed || undefined;
  }

  function onSubmit(values: PlatformCompanyEditValues) {
    if (!company) {
      return;
    }
    setApiError("");
    mutation.mutate(
      {
        id: company.id,
        payload: {
          address: normalizeOptional(values.address),
          email: values.email.trim().toLowerCase(),
          name: values.name.trim(),
          phone: normalizeOptional(values.phone),
          requireRfqBeforePo: values.requireRfqBeforePo,
        },
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
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close company profile form"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Edit Company Profile
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update tenant identity and procurement profile settings.
            </p>
          </div>
          <Button
            aria-label="Close"
            disabled={mutation.isPending}
            size="icon"
            variant="ghost"
            onClick={handleClose}
          >
            <X className="size-5" />
          </Button>
        </div>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            {apiError ? (
              <div className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
                {apiError}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="edit-company-name">Company Name</Label>
              <Input
                id="edit-company-name"
                aria-invalid={!!errors.name}
                placeholder="Company name"
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-sm text-error">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-company-email">Email</Label>
              <Input
                id="edit-company-email"
                aria-invalid={!!errors.email}
                placeholder="admin@company.com"
                type="email"
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-sm text-error">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-company-phone">Phone</Label>
              <Input
                id="edit-company-phone"
                aria-invalid={!!errors.phone}
                placeholder="01700000000"
                {...register("phone")}
              />
              {errors.phone ? (
                <p className="text-sm text-error">{errors.phone.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-company-address">Address</Label>
              <textarea
                id="edit-company-address"
                className={textareaClassName}
                placeholder="House, road, city"
                rows={5}
                {...register("address")}
              />
              {errors.address ? (
                <p className="text-sm text-error">{errors.address.message}</p>
              ) : null}
            </div>

            <label className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
              <input
                className="mt-1 size-4 accent-primary"
                type="checkbox"
                {...register("requireRfqBeforePo")}
              />
              <span>
                <span className="block text-sm font-medium text-foreground">
                  Require RFQ before PO
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  Direct purchase order creation will follow the tenant RFQ
                  policy enforced by the backend.
                </span>
              </span>
            </label>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border p-5 sm:flex-row sm:justify-end">
            <Button
              disabled={mutation.isPending}
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button isLoading={mutation.isPending} type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}

const textareaClassName = cn(
  "flex w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground",
  "focus:border-primary focus:ring-4 focus:ring-ring",
);
