"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { useAdjustBudget } from "../hooks";
import {
  budgetAdjustmentSchema,
  type BudgetAdjustmentValues,
} from "../schemas";
import type { Budget } from "../types";
import {
  formatBudgetCurrency,
  getBudgetMutationError,
  normalizeOptionalString,
} from "../utils";

type BudgetAdjustmentDialogProps = {
  budget: Budget | null;
  onClose: () => void;
};

export function BudgetAdjustmentDialog({
  budget,
  onClose,
}: BudgetAdjustmentDialogProps) {
  const [apiError, setApiError] = useState("");
  const mutation = useAdjustBudget();
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<BudgetAdjustmentValues>({
    defaultValues: {
      amount: 0,
      note: "",
    },
    resolver: zodResolver(budgetAdjustmentSchema),
  });

  useEffect(() => {
    if (budget) {
      reset({ amount: 0, note: "" });
    }
  }, [budget, reset]);

  if (!budget) {
    return null;
  }

  const selectedBudget = budget;

  function handleClose() {
    if (!mutation.isPending) {
      setApiError("");
      onClose();
    }
  }

  function onSubmit(values: BudgetAdjustmentValues) {
    setApiError("");
    mutation.mutate(
      {
        id: selectedBudget.id,
        payload: {
          amount: Number(values.amount),
          note: normalizeOptionalString(values.note),
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
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close budget adjustment"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-xl rounded-lg border border-border bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <SlidersHorizontal className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Add adjustment
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedBudget.name} has{" "}
                {formatBudgetCurrency(selectedBudget.availableAmount)} available.
              </p>
            </div>
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5 p-5">
            {apiError ? (
              <div className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
                {apiError}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="budget-adjustment-amount">Amount</Label>
              <Input
                id="budget-adjustment-amount"
                aria-invalid={!!errors.amount}
                step="0.01"
                type="number"
                {...register("amount", { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Use a positive amount to add budget or a negative amount to
                reduce it.
              </p>
              {errors.amount ? (
                <p className="text-sm text-error">{errors.amount.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget-adjustment-note">Note</Label>
              <textarea
                id="budget-adjustment-note"
                className={textareaClassName}
                placeholder="Reason for adjustment"
                rows={4}
                {...register("note")}
              />
              {errors.note ? (
                <p className="text-sm text-error">{errors.note.message}</p>
              ) : null}
            </div>
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
              Add adjustment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const textareaClassName = cn(
  "flex w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors",
  "placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
);
