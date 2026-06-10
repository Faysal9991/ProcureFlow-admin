"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Search, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/client";
import { useBudgetAvailability } from "../hooks";
import {
  budgetAvailabilitySchema,
  type BudgetAvailabilityValues,
} from "../schemas";
import type { BudgetAvailabilityFilters } from "../types";
import {
  formatBudgetCurrency,
  getBudgetStatusLabel,
  getBudgetStatusVariant,
  toDateInputValue,
} from "../utils";

type BudgetAvailabilityCheckerProps = {
  defaultAmount?: number;
  defaultDate?: string | null;
  departmentId?: string;
  description?: string;
  title?: string;
};

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function BudgetAvailabilityChecker({
  defaultAmount = 0,
  defaultDate,
  departmentId,
  description = "Check available budget for one department, amount, and date.",
  title = "Check Availability",
}: BudgetAvailabilityCheckerProps) {
  const normalizedDefaultDate =
    toDateInputValue(defaultDate) || todayInputValue();
  const [submittedFilters, setSubmittedFilters] =
    useState<BudgetAvailabilityFilters | null>(null);
  const queryFilters = useMemo(
    () => submittedFilters ?? {},
    [submittedFilters],
  );
  const availabilityQuery = useBudgetAvailability(
    queryFilters,
    !!submittedFilters,
  );
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<BudgetAvailabilityValues>({
    defaultValues: {
      amount: defaultAmount,
      date: normalizedDefaultDate,
    },
    resolver: zodResolver(budgetAvailabilitySchema),
  });

  useEffect(() => {
    reset({
      amount: defaultAmount,
      date: normalizedDefaultDate,
    });
  }, [defaultAmount, normalizedDefaultDate, reset]);

  function onSubmit(values: BudgetAvailabilityValues) {
    setSubmittedFilters({
      amount: Number(values.amount),
      date: values.date,
      departmentId,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 md:grid-cols-[1fr_1fr_auto]"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <Label htmlFor="budget-availability-amount">Amount</Label>
            <Input
              id="budget-availability-amount"
              aria-invalid={!!errors.amount}
              min="0"
              step="0.01"
              type="number"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount ? (
              <p className="text-sm text-error">{errors.amount.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-availability-date">Date</Label>
            <Input
              id="budget-availability-date"
              aria-invalid={!!errors.date}
              type="date"
              {...register("date")}
            />
            {errors.date ? (
              <p className="text-sm text-error">{errors.date.message}</p>
            ) : null}
          </div>

          <div className="flex items-end">
            <Button
              disabled={!departmentId}
              isLoading={availabilityQuery.isFetching}
              type="submit"
            >
              <Search className="size-4" />
              Check
            </Button>
          </div>
        </form>

        <p className="mt-3 text-sm text-muted-foreground">
          {departmentId ? description : "A department is required for checking availability."}
        </p>

        {availabilityQuery.isError ? (
          <div className="mt-4 rounded-lg border border-error/20 bg-error/10 p-3 text-sm text-error">
            {getApiErrorMessage(availabilityQuery.error)}
          </div>
        ) : null}

        {availabilityQuery.data ? (
          <div className="mt-5 rounded-lg border border-border bg-background p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  availabilityQuery.data.isSufficient ? "success" : "error"
                }
              >
                {availabilityQuery.data.isSufficient ? (
                  <CheckCircle2 className="mr-1 size-3" />
                ) : (
                  <XCircle className="mr-1 size-3" />
                )}
                {availabilityQuery.data.isSufficient
                  ? "Sufficient"
                  : "Insufficient"}
              </Badge>
              {availabilityQuery.data.status ? (
                <Badge
                  variant={getBudgetStatusVariant(availabilityQuery.data.status)}
                >
                  {getBudgetStatusLabel(availabilityQuery.data.status)}
                </Badge>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <AvailabilityMetric
                label="Available"
                value={formatBudgetCurrency(
                  availabilityQuery.data.availableAmount,
                )}
              />
              <AvailabilityMetric
                label="Request Amount"
                value={formatBudgetCurrency(availabilityQuery.data.requestAmount)}
              />
              <AvailabilityMetric
                label="Allocated"
                value={formatBudgetCurrency(
                  availabilityQuery.data.allocatedAmount,
                )}
              />
            </div>

            {availabilityQuery.data.message ? (
              <p className="mt-4 text-sm text-muted-foreground">
                {availabilityQuery.data.message}
              </p>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function AvailabilityMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
