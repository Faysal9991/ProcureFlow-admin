"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDepartments } from "@/features/departments/hooks";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { useCreateBudget, useUpdateBudget } from "../hooks";
import { budgetFormSchema, type BudgetFormValues } from "../schemas";
import type { Budget } from "../types";
import {
  budgetPeriodTypes,
  canEditBudgetFullDetails,
  getBudgetMutationError,
  toDateInputValue,
} from "../utils";

type BudgetFormDrawerProps = {
  budget: Budget | null;
  isOpen: boolean;
  onClose: () => void;
};

const emptyValues: BudgetFormValues = {
  allocatedAmount: 0,
  departmentId: "",
  name: "",
  periodEndDate: "",
  periodStartDate: "",
  periodType: "MONTHLY",
};

export function BudgetFormDrawer({
  budget,
  isOpen,
  onClose,
}: BudgetFormDrawerProps) {
  const [apiError, setApiError] = useState("");
  const departmentsQuery = useDepartments(isOpen);
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const isEditing = !!budget;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const canEditFullDetails = !budget || canEditBudgetFullDetails(budget);
  const title = isEditing ? "Edit Budget" : "Create Budget";
  const description =
    budget?.status === "ACTIVE"
      ? "Active budgets allow name-only updates."
      : "Create or update a draft department-period budget.";
  const defaultValues = useMemo<BudgetFormValues>(
    () =>
      budget
        ? {
            allocatedAmount: budget.allocatedAmount,
            departmentId: budget.department.id,
            name: budget.name,
            periodEndDate: toDateInputValue(budget.periodEndDate),
            periodStartDate: toDateInputValue(budget.periodStartDate),
            periodType: budget.periodType as BudgetFormValues["periodType"],
          }
        : emptyValues,
    [budget],
  );

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<BudgetFormValues>({
    defaultValues,
    resolver: zodResolver(budgetFormSchema),
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

  function onSubmit(values: BudgetFormValues) {
    setApiError("");

    if (budget) {
      updateMutation.mutate(
        {
          id: budget.id,
          payload: canEditFullDetails
            ? {
                allocatedAmount: Number(values.allocatedAmount),
                departmentId: values.departmentId,
                name: values.name.trim(),
                periodEndDate: values.periodEndDate,
                periodStartDate: values.periodStartDate,
                periodType: values.periodType,
              }
            : {
                name: values.name.trim(),
              },
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
      return;
    }

    createMutation.mutate(
      {
        allocatedAmount: Number(values.allocatedAmount),
        departmentId: values.departmentId,
        name: values.name.trim(),
        periodEndDate: values.periodEndDate,
        periodStartDate: values.periodStartDate,
        periodType: values.periodType,
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
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close budget form"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
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

            <div className="space-y-2">
              <Label htmlFor="budget-name">Name</Label>
              <Input
                id="budget-name"
                aria-invalid={!!errors.name}
                placeholder="Operations Q2 budget"
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-sm text-error">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget-department">Department</Label>
              <select
                id="budget-department"
                className={selectClassName}
                disabled={!canEditFullDetails || departmentsQuery.isLoading}
                {...register("departmentId")}
              >
                <option value="">Select department</option>
                {(departmentsQuery.data ?? []).map((department) => (
                  <option key={department.uuid} value={department.uuid}>
                    {department.name}
                  </option>
                ))}
              </select>
              {errors.departmentId ? (
                <p className="text-sm text-error">
                  {errors.departmentId.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="budget-period-type">Period Type</Label>
                <select
                  id="budget-period-type"
                  className={selectClassName}
                  disabled={!canEditFullDetails}
                  {...register("periodType")}
                >
                  {budgetPeriodTypes.map((period) => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
                {errors.periodType ? (
                  <p className="text-sm text-error">
                    {errors.periodType.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget-allocated-amount">
                  Allocated Amount
                </Label>
                <Input
                  id="budget-allocated-amount"
                  aria-invalid={!!errors.allocatedAmount}
                  disabled={!canEditFullDetails}
                  min="0"
                  step="0.01"
                  type="number"
                  {...register("allocatedAmount", { valueAsNumber: true })}
                />
                {errors.allocatedAmount ? (
                  <p className="text-sm text-error">
                    {errors.allocatedAmount.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="budget-period-start">Period Start Date</Label>
                <Input
                  id="budget-period-start"
                  aria-invalid={!!errors.periodStartDate}
                  disabled={!canEditFullDetails}
                  type="date"
                  {...register("periodStartDate")}
                />
                {errors.periodStartDate ? (
                  <p className="text-sm text-error">
                    {errors.periodStartDate.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget-period-end">Period End Date</Label>
                <Input
                  id="budget-period-end"
                  aria-invalid={!!errors.periodEndDate}
                  disabled={!canEditFullDetails}
                  type="date"
                  {...register("periodEndDate")}
                />
                {errors.periodEndDate ? (
                  <p className="text-sm text-error">
                    {errors.periodEndDate.message}
                  </p>
                ) : null}
              </div>
            </div>
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
              {isEditing ? "Save changes" : "Create budget"}
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}

const selectClassName = cn(
  "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors",
  "focus:border-primary focus:ring-4 focus:ring-ring",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
);
