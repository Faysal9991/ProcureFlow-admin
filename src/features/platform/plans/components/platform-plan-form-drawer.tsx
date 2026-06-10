"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreatePlatformPlan,
  useUpdatePlatformPlan,
} from "@/features/platform/companies/hooks";
import type { PlatformPlan } from "@/features/platform/companies/types";
import { getApiErrorMessage } from "@/lib/api/client";
import { platformPlanFormSchema, type PlatformPlanFormValues } from "../schemas";
import {
  getPlanDefaultValues,
  getPlanMutationError,
  toPlanPayload,
} from "../utils";

type PlatformPlanFormDrawerProps = {
  isOpen: boolean;
  plan: PlatformPlan | null;
  onClose: () => void;
};

export function PlatformPlanFormDrawer({
  isOpen,
  plan,
  onClose,
}: PlatformPlanFormDrawerProps) {
  const [apiError, setApiError] = useState("");
  const createMutation = useCreatePlatformPlan();
  const updateMutation = useUpdatePlatformPlan();
  const isEditing = !!plan;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const defaultValues = useMemo(() => getPlanDefaultValues(plan), [plan]);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<PlatformPlanFormValues>({
    defaultValues,
    resolver: zodResolver(platformPlanFormSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
  }, [defaultValues, isOpen, reset]);

  if (!isOpen) {
    return null;
  }

  function handleClose() {
    if (!isPending) {
      setApiError("");
      onClose();
    }
  }

  function onSubmit(values: PlatformPlanFormValues) {
    setApiError("");

    if (plan) {
      updateMutation.mutate(
        {
          id: plan.id,
          payload: toPlanPayload(values),
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
      return;
    }

    createMutation.mutate(toPlanPayload(values), {
      onError: (error) => {
        setApiError(getPlanMutationError(getApiErrorMessage(error)));
      },
      onSuccess: () => {
        setApiError("");
        onClose();
      },
    });
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close plan form"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isEditing ? "Edit Plan" : "Create Plan"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure pricing and tenant usage limits. Blank limits are
              unlimited.
            </p>
          </div>
          <Button
            aria-label="Close"
            disabled={isPending}
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

            <Field error={errors.name?.message} id="plan-name" label="Name">
              <Input
                id="plan-name"
                aria-invalid={!!errors.name}
                placeholder="Growth"
                {...register("name")}
              />
            </Field>

            <Field error={errors.price?.message} id="plan-price" label="Price">
              <Input
                id="plan-price"
                aria-invalid={!!errors.price}
                min={0}
                step="0.01"
                type="number"
                {...register("price", { valueAsNumber: true })}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                error={errors.maxUsers?.message}
                id="plan-max-users"
                label="Max Users"
              >
                <Input
                  id="plan-max-users"
                  aria-invalid={!!errors.maxUsers}
                  inputMode="numeric"
                  placeholder="Unlimited"
                  {...register("maxUsers")}
                />
              </Field>

              <Field
                error={errors.maxDepartments?.message}
                id="plan-max-departments"
                label="Max Departments"
              >
                <Input
                  id="plan-max-departments"
                  aria-invalid={!!errors.maxDepartments}
                  inputMode="numeric"
                  placeholder="Unlimited"
                  {...register("maxDepartments")}
                />
              </Field>

              <Field
                error={errors.maxStorageMb?.message}
                id="plan-max-storage"
                label="Max Storage MB"
              >
                <Input
                  id="plan-max-storage"
                  aria-invalid={!!errors.maxStorageMb}
                  inputMode="numeric"
                  placeholder="Unlimited"
                  {...register("maxStorageMb")}
                />
              </Field>

              <Field
                error={errors.maxRequestsPerMonth?.message}
                id="plan-max-requests"
                label="Max Requests / Month"
              >
                <Input
                  id="plan-max-requests"
                  aria-invalid={!!errors.maxRequestsPerMonth}
                  inputMode="numeric"
                  placeholder="Unlimited"
                  {...register("maxRequestsPerMonth")}
                />
              </Field>
            </div>

            <label className="flex items-start gap-3 rounded-lg border border-border bg-background p-3">
              <input
                className="mt-1 size-4 accent-primary"
                type="checkbox"
                {...register("isActive")}
              />
              <span>
                <span className="block text-sm font-medium text-foreground">
                  Active plan
                </span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  Active plans can be selected when creating companies or
                  assigning subscriptions.
                </span>
              </span>
            </label>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border p-5 sm:flex-row sm:justify-end">
            <Button
              disabled={isPending}
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button isLoading={isPending} type="submit">
              {isEditing ? "Save Changes" : "Create Plan"}
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}

function Field({
  children,
  error,
  id,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  id: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  );
}
