"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  ShieldAlert,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button, getButtonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api/client";
import { ROUTES } from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";
import { useBudget, useBudgetTransactions } from "../hooks";
import type { Budget, BudgetAction } from "../types";
import {
  canActivateBudget,
  canActivateBudgets,
  canAdjustBudget,
  canAdjustBudgets,
  canCloseBudget,
  canCloseBudgets,
  canEditBudget,
  canManageBudgets,
  canViewBudgets,
  formatBudgetCurrency,
  formatBudgetDate,
  formatBudgetDateTime,
  getBudgetPeriodTypeLabel,
  getBudgetStatusLabel,
  getBudgetStatusVariant,
} from "../utils";
import { BudgetActionDialog } from "./budget-action-dialog";
import { BudgetAdjustmentDialog } from "./budget-adjustment-dialog";
import { BudgetAvailabilityChecker } from "./budget-availability-checker";
import { BudgetFormDrawer } from "./budget-form-drawer";
import { BudgetTransactionTable } from "./budget-transaction-table";

type BudgetDetailPageProps = {
  budgetId: string;
};

type BudgetActionState = {
  action: BudgetAction;
  budget: Budget;
};

export function BudgetDetailPage({ budgetId }: BudgetDetailPageProps) {
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);
  const canView = canViewBudgets(permissions, user?.role);
  const canManage = canManageBudgets(permissions, user?.role);
  const canAdjust = canAdjustBudgets(permissions, user?.role);
  const canActivate = canActivateBudgets(permissions, user?.role);
  const canClose = canCloseBudgets(permissions, user?.role);
  const budgetQuery = useBudget(budgetId, canView);
  const transactionsQuery = useBudgetTransactions(budgetId, canView);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [adjustingBudget, setAdjustingBudget] = useState<Budget | null>(null);
  const [budgetAction, setBudgetAction] = useState<BudgetActionState | null>(
    null,
  );
  const budget = budgetQuery.data;

  if (!canView) {
    return (
      <BlockedBudgetState
        message="You need budget.view for this company to inspect budgets."
        title="Budget unavailable"
      />
    );
  }

  if (budgetQuery.isLoading) {
    return <BudgetDetailSkeleton />;
  }

  if (budgetQuery.isError || !budget) {
    return (
      <BlockedBudgetState
        message={getApiErrorMessage(budgetQuery.error)}
        title="Budget unavailable"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              className={getButtonClassName({ variant: "outline" })}
              href={ROUTES.budgets}
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
            {canManage && canEditBudget(budget) ? (
              <Button variant="outline" onClick={() => setIsFormOpen(true)}>
                <Edit3 className="size-4" />
                Edit
              </Button>
            ) : null}
            {canActivate && canActivateBudget(budget) ? (
              <Button
                variant="secondary"
                onClick={() => setBudgetAction({ action: "activate", budget })}
              >
                <CheckCircle2 className="size-4" />
                Activate
              </Button>
            ) : null}
            {canAdjust && canAdjustBudget(budget) ? (
              <Button variant="outline" onClick={() => setAdjustingBudget(budget)}>
                <SlidersHorizontal className="size-4" />
                Adjust
              </Button>
            ) : null}
            {canClose && canCloseBudget(budget) ? (
              <Button
                variant="danger"
                onClick={() => setBudgetAction({ action: "close", budget })}
              >
                <XCircle className="size-4" />
                Close
              </Button>
            ) : null}
          </div>
        }
        eyebrow="Budget"
        title={budget.name}
      >
        {budget.department.name} budget for{" "}
        {getBudgetPeriodTypeLabel(budget.periodType)} period.
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <BudgetMetric
          label="Allocated"
          value={formatBudgetCurrency(budget.allocatedAmount)}
        />
        <BudgetMetric
          label="Reserved"
          value={formatBudgetCurrency(budget.reservedAmount)}
        />
        <BudgetMetric
          label="Consumed"
          value={formatBudgetCurrency(budget.consumedAmount)}
        />
        <BudgetMetric
          label="Released"
          value={formatBudgetCurrency(budget.releasedAmount)}
        />
        <BudgetMetric
          label="Adjusted"
          value={formatBudgetCurrency(budget.adjustedAmount)}
        />
        <BudgetMetric
          label="Available"
          value={formatBudgetCurrency(budget.availableAmount)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Budget Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailField label="Department" value={budget.department.name} />
            <DetailField
              label="Period Type"
              value={getBudgetPeriodTypeLabel(budget.periodType)}
            />
            <DetailField
              label="Start Date"
              value={formatBudgetDate(budget.periodStartDate)}
            />
            <DetailField
              label="End Date"
              value={formatBudgetDate(budget.periodEndDate)}
            />
            <DetailField
              label="Status"
              value={
                <Badge variant={getBudgetStatusVariant(budget.status)}>
                  {getBudgetStatusLabel(budget.status)}
                </Badge>
              }
            />
            <DetailField
              label="Created By"
              value={budget.createdBy.name || budget.createdBy.role}
            />
            <DetailField
              label="Created"
              value={formatBudgetDateTime(budget.createdAt)}
            />
            <DetailField
              label="Updated"
              value={formatBudgetDateTime(budget.updatedAt)}
            />
            <DetailField
              label="Activated By"
              value={budget.activatedBy?.name || budget.activatedBy?.role}
            />
            <DetailField
              label="Activated"
              value={formatBudgetDateTime(budget.activatedAt)}
            />
            <DetailField
              label="Closed By"
              value={budget.closedBy?.name || budget.closedBy?.role}
            />
            <DetailField
              label="Closed"
              value={formatBudgetDateTime(budget.closedAt)}
            />
          </div>
        </CardContent>
      </Card>

      <BudgetAvailabilityChecker
        defaultAmount={0}
        defaultDate={budget.periodStartDate}
        departmentId={budget.department.id}
        description="Check this department budget for a planned amount and date."
      />

      <BudgetTransactionTable
        error={transactionsQuery.error}
        isError={transactionsQuery.isError}
        isLoading={transactionsQuery.isLoading}
        transactions={transactionsQuery.data ?? []}
      />

      <BudgetFormDrawer
        budget={budget}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />

      <BudgetAdjustmentDialog
        budget={adjustingBudget}
        onClose={() => setAdjustingBudget(null)}
      />

      <BudgetActionDialog
        action={budgetAction?.action ?? "activate"}
        budget={budgetAction?.budget ?? null}
        onClose={() => setBudgetAction(null)}
      />
    </div>
  );
}

function BudgetMetric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 text-sm font-medium text-foreground">
        {value || "Not available"}
      </div>
    </div>
  );
}

function BlockedBudgetState({
  message,
  title,
}: {
  message: string;
  title: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Finance" title={title}>
        {message}
      </PageHeader>
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                <ShieldAlert className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Budget access unavailable
              </p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {message}
              </p>
              <div className="mt-4 flex justify-center">
                <Link
                  className={getButtonClassName({ variant: "outline" })}
                  href={ROUTES.budgets}
                >
                  Back to budgets
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BudgetDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 max-w-xl rounded-lg bg-muted" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="mt-3 h-6 w-32 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="h-96 rounded-lg bg-muted" />
    </div>
  );
}
