"use client";

import { Edit3, Inbox, Power, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PlatformPlan } from "@/features/platform/companies/types";
import { formatPlatformDate } from "@/features/platform/companies/utils";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  formatPlanLimit,
  formatPlatformMoney,
  getPlanStatusLabel,
  getPlanStatusVariant,
} from "../utils";

type PlatformPlansTableProps = {
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  plans: PlatformPlan[];
  onEdit: (plan: PlatformPlan) => void;
  onToggleStatus: (plan: PlatformPlan) => void;
};

export function PlatformPlansTable({
  error,
  isError,
  isLoading,
  onEdit,
  onToggleStatus,
  plans,
}: PlatformPlansTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[1.2fr_120px_repeat(4,1fr)_120px]"
              >
                {Array.from({ length: 7 }).map((__, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="h-4 rounded-md bg-muted"
                  />
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
                Plans unavailable
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

  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Inbox className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                No plans found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a platform plan to start assigning subscriptions.
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
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Departments</TableHead>
              <TableHead>Storage</TableHead>
              <TableHead>Requests</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="min-w-44">
                  <p className="font-medium text-foreground">{plan.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Updated {formatPlatformDate(plan.updatedAt)}
                  </p>
                </TableCell>
                <TableCell className="min-w-28">
                  {formatPlatformMoney(plan.price)}
                </TableCell>
                <TableCell>{formatPlanLimit(plan.maxUsers)}</TableCell>
                <TableCell>{formatPlanLimit(plan.maxDepartments)}</TableCell>
                <TableCell>{formatPlanLimit(plan.maxStorageMb, " MB")}</TableCell>
                <TableCell>
                  {formatPlanLimit(plan.maxRequestsPerMonth)}
                </TableCell>
                <TableCell>
                  <Badge variant={getPlanStatusVariant(plan.isActive)}>
                    {getPlanStatusLabel(plan.isActive)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(plan)}
                    >
                      <Edit3 className="size-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={plan.isActive ? "danger" : "primary"}
                      onClick={() => onToggleStatus(plan)}
                    >
                      <Power className="size-4" />
                      {plan.isActive ? "Deactivate" : "Activate"}
                    </Button>
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
