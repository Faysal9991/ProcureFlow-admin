"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Edit3,
  Eye,
  Inbox,
  Lock,
  ShieldAlert,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, getButtonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api/client";
import type { Budget, BudgetAction } from "../types";
import {
  canActivateBudget,
  canAdjustBudget,
  canCloseBudget,
  canEditBudget,
  formatBudgetCurrency,
  formatBudgetDate,
  getBudgetPeriodTypeLabel,
  getBudgetStatusLabel,
  getBudgetStatusVariant,
} from "../utils";

type BudgetsTableProps = {
  budgets: Budget[];
  canActivate: boolean;
  canAdjust: boolean;
  canClose: boolean;
  canManage: boolean;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  onAction: (budget: Budget, action: BudgetAction) => void;
  onAdjust: (budget: Budget) => void;
  onEdit: (budget: Budget) => void;
};

export function BudgetsTable({
  budgets,
  canActivate,
  canAdjust,
  canClose,
  canManage,
  error,
  isError,
  isLoading,
  onAction,
  onAdjust,
  onEdit,
}: BudgetsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budgets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[1.2fr_1fr_120px_120px_120px_120px]"
              >
                {Array.from({ length: 6 }).map((__, childIndex) => (
                  <div key={childIndex} className="h-4 rounded-md bg-muted" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                <ShieldAlert className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Budgets unavailable
              </p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {getApiErrorMessage(error)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (budgets.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Inbox className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                No budgets found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a budget or adjust your filters.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Budget</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Allocated</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgets.map((budget) => (
              <TableRow key={budget.id}>
                <TableCell className="min-w-64">
                  <div className="font-medium text-foreground">
                    {budget.name}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {getBudgetPeriodTypeLabel(budget.periodType)}
                  </div>
                </TableCell>
                <TableCell className="min-w-44 text-muted-foreground">
                  {budget.department.name}
                </TableCell>
                <TableCell className="min-w-48 text-muted-foreground">
                  {formatBudgetDate(budget.periodStartDate)} -{" "}
                  {formatBudgetDate(budget.periodEndDate)}
                </TableCell>
                <TableCell className="min-w-32 font-medium">
                  {formatBudgetCurrency(budget.allocatedAmount)}
                </TableCell>
                <TableCell className="min-w-32 font-medium">
                  {formatBudgetCurrency(budget.availableAmount)}
                </TableCell>
                <TableCell>
                  <Badge variant={getBudgetStatusVariant(budget.status)}>
                    {getBudgetStatusLabel(budget.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link
                      className={getButtonClassName({
                        size: "sm",
                        variant: "outline",
                      })}
                      href={`/budgets/${budget.id}`}
                    >
                      <Eye className="size-4" />
                      View
                    </Link>
                    {canManage && canEditBudget(budget) ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(budget)}
                      >
                        <Edit3 className="size-4" />
                        Edit
                      </Button>
                    ) : null}
                    {canActivate && canActivateBudget(budget) ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onAction(budget, "activate")}
                      >
                        <CheckCircle2 className="size-4" />
                        Activate
                      </Button>
                    ) : null}
                    {canAdjust && canAdjustBudget(budget) ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAdjust(budget)}
                      >
                        <SlidersHorizontal className="size-4" />
                        Adjust
                      </Button>
                    ) : null}
                    {canClose && canCloseBudget(budget) ? (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => onAction(budget, "close")}
                      >
                        <XCircle className="size-4" />
                        Close
                      </Button>
                    ) : null}
                    {!canManage && !canActivate && !canAdjust && !canClose ? (
                      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <Lock className="size-4" />
                        Read only
                      </span>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
