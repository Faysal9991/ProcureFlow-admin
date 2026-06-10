"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAssignPlatformCompanyPlan,
} from "@/features/platform/companies/hooks";
import type {
  PlatformCompany,
  PlatformPlan,
} from "@/features/platform/companies/types";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import {
  platformAssignPlanSchema,
  type PlatformAssignPlanValues,
} from "../schemas";
import {
  getAssignPlanMutationError,
  getTodayInputDate,
  toAssignPlanPayload,
} from "../utils";

type AssignPlanDrawerProps = {
  companies: PlatformCompany[];
  initialCompanyId?: string;
  isOpen: boolean;
  onClose: () => void;
  plans: PlatformPlan[];
};

export function AssignPlanDrawer({
  companies,
  initialCompanyId,
  isOpen,
  onClose,
  plans,
}: AssignPlanDrawerProps) {
  const [apiError, setApiError] = useState("");
  const mutation = useAssignPlatformCompanyPlan();
  const activePlans = useMemo(
    () => plans.filter((plan) => plan.isActive),
    [plans],
  );
  const defaultValues = useMemo<PlatformAssignPlanValues>(
    () => ({
      companyId: initialCompanyId ?? "",
      endDate: "",
      planId: "",
      startDate: getTodayInputDate(),
    }),
    [initialCompanyId],
  );
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<PlatformAssignPlanValues>({
    defaultValues,
    resolver: zodResolver(platformAssignPlanSchema),
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
    if (!mutation.isPending) {
      setApiError("");
      onClose();
    }
  }

  function onSubmit(values: PlatformAssignPlanValues) {
    setApiError("");
    mutation.mutate(
      {
        companyId: values.companyId,
        payload: toAssignPlanPayload(values),
      },
      {
        onError: (error) => {
          setApiError(
            getAssignPlanMutationError(getApiErrorMessage(error)),
          );
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
        aria-label="Close assign plan form"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Assign Plan
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Assigning a plan cancels the company’s active or pending
              subscription and creates a new one.
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

            <Field error={errors.companyId?.message} id="assign-company" label="Company">
              <select
                id="assign-company"
                className={selectClassName}
                {...register("companyId")}
              >
                <option value="">Select company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field error={errors.planId?.message} id="assign-plan" label="Plan">
              <select
                id="assign-plan"
                className={selectClassName}
                {...register("planId")}
              >
                <option value="">Select plan</option>
                {activePlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                error={errors.startDate?.message}
                id="assign-start-date"
                label="Start Date"
              >
                <Input
                  id="assign-start-date"
                  aria-invalid={!!errors.startDate}
                  type="date"
                  {...register("startDate")}
                />
              </Field>

              <Field
                error={errors.endDate?.message}
                id="assign-end-date"
                label="End Date"
              >
                <Input
                  id="assign-end-date"
                  aria-invalid={!!errors.endDate}
                  type="date"
                  {...register("endDate")}
                />
              </Field>
            </div>

            <div className="rounded-lg border border-info/20 bg-info/10 px-3 py-2 text-sm text-info">
              If end date is blank, the app sends start date plus 30 days.
            </div>

            {activePlans.length === 0 ? (
              <div className="rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-warning">
                No active plans are available for assignment.
              </div>
            ) : null}
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
            <Button
              disabled={activePlans.length === 0}
              isLoading={mutation.isPending}
              type="submit"
            >
              Assign Plan
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

const selectClassName = cn(
  "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors",
  "focus:border-primary focus:ring-4 focus:ring-ring",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
);
