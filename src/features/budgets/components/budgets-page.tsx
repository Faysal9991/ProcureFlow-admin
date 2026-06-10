"use client";

import { Plus, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDepartments } from "@/features/departments/hooks";
import { useAuthStore } from "@/store/auth-store";
import { useBudgets } from "../hooks";
import type {
  Budget,
  BudgetAction,
  BudgetListFilters,
  BudgetPeriodType,
  BudgetStatus,
} from "../types";
import {
  BUDGET_PAGE_SIZE,
  canActivateBudgets,
  canAdjustBudgets,
  canCloseBudgets,
  canManageBudgets,
  canUseBudgetDepartmentFilter,
  canViewBudgets,
} from "../utils";
import { BudgetActionDialog } from "./budget-action-dialog";
import { BudgetAdjustmentDialog } from "./budget-adjustment-dialog";
import { BudgetFilters } from "./budget-filters";
import { BudgetFormDrawer } from "./budget-form-drawer";
import { BudgetsTable } from "./budgets-table";

type BudgetActionState = {
  action: BudgetAction;
  budget: Budget;
};

export function BudgetsPage() {
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);
  const canView = canViewBudgets(permissions, user?.role);
  const canManage = canManageBudgets(permissions, user?.role);
  const canAdjust = canAdjustBudgets(permissions, user?.role);
  const canActivate = canActivateBudgets(permissions, user?.role);
  const canClose = canCloseBudgets(permissions, user?.role);
  const showDepartmentFilter = canUseBudgetDepartmentFilter(user?.role);
  const [status, setStatus] = useState<"ALL" | BudgetStatus>("ALL");
  const [periodType, setPeriodType] = useState<"ALL" | BudgetPeriodType>("ALL");
  const [departmentId, setDepartmentId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [adjustingBudget, setAdjustingBudget] = useState<Budget | null>(null);
  const [budgetAction, setBudgetAction] = useState<BudgetActionState | null>(
    null,
  );
  const departmentsQuery = useDepartments(canView && showDepartmentFilter);
  const departments = useMemo(
    () => departmentsQuery.data ?? [],
    [departmentsQuery.data],
  );
  const queryFilters = useMemo<BudgetListFilters>(
    () => ({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      departmentId:
        showDepartmentFilter && departmentId ? departmentId : undefined,
      limit: BUDGET_PAGE_SIZE,
      page,
      periodType: periodType === "ALL" ? undefined : periodType,
      status: status === "ALL" ? undefined : status,
    }),
    [dateFrom, dateTo, departmentId, page, periodType, showDepartmentFilter, status],
  );
  const budgetsQuery = useBudgets(queryFilters, canView);
  const budgetList = budgetsQuery.data ?? {
    items: [],
    limit: BUDGET_PAGE_SIZE,
    page,
    total: 0,
  };
  const totalPages = Math.max(1, Math.ceil(budgetList.total / budgetList.limit));
  const currentPage = budgetList.page || page;

  function resetToFirstPage() {
    setPage(1);
  }

  function handleCreate() {
    setEditingBudget(null);
    setIsFormOpen(true);
  }

  function handleEdit(budget: Budget) {
    setEditingBudget(budget);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setEditingBudget(null);
    setIsFormOpen(false);
  }

  if (!canView) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Finance" title="Budgets">
          Manage department-period budget allocation and consumption.
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
                  Budget access requires budget.view for this company. Super
                  admins do not access tenant budgets here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          canManage ? (
            <Button onClick={handleCreate}>
              <Plus className="size-4" />
              Create Budget
            </Button>
          ) : null
        }
        eyebrow="Finance"
        title="Budgets"
      >
        Manage department-period budget allocation, availability, and
        consumption.
      </PageHeader>

      {!canManage ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            This is a read-only budget view. Mutation controls appear only when
            your role includes the matching budget permissions.
          </CardContent>
        </Card>
      ) : null}

      <BudgetFilters
        dateFrom={dateFrom}
        dateTo={dateTo}
        departmentId={departmentId}
        departments={departments}
        isDisabled={budgetsQuery.isLoading}
        periodType={periodType}
        resultCount={budgetList.items.length}
        showDepartmentFilter={showDepartmentFilter}
        status={status}
        totalCount={budgetList.total}
        onDateFromChange={(value) => {
          setDateFrom(value);
          resetToFirstPage();
        }}
        onDateToChange={(value) => {
          setDateTo(value);
          resetToFirstPage();
        }}
        onDepartmentChange={(value) => {
          setDepartmentId(value);
          resetToFirstPage();
        }}
        onPeriodTypeChange={(value) => {
          setPeriodType(value);
          resetToFirstPage();
        }}
        onStatusChange={(value) => {
          setStatus(value);
          resetToFirstPage();
        }}
      />

      <BudgetsTable
        budgets={budgetList.items}
        canActivate={canActivate}
        canAdjust={canAdjust}
        canClose={canClose}
        canManage={canManage}
        error={budgetsQuery.error}
        isError={budgetsQuery.isError}
        isLoading={budgetsQuery.isLoading}
        onAction={(budget, action) => setBudgetAction({ action, budget })}
        onAdjust={setAdjustingBudget}
        onEdit={handleEdit}
      />

      {!budgetsQuery.isLoading && !budgetsQuery.isError && budgetList.total > 0 ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              disabled={currentPage <= 1}
              size="sm"
              variant="outline"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </Button>
            <Button
              disabled={currentPage >= totalPages}
              size="sm"
              variant="outline"
              onClick={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <BudgetFormDrawer
        budget={editingBudget}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
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
