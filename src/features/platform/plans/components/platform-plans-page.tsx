"use client";

import { Plus, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  usePlatformPlans,
} from "@/features/platform/companies/hooks";
import type { PlatformPlan } from "@/features/platform/companies/types";
import { canManagePlatformCompanies } from "@/features/platform/companies/utils";
import { useAuthStore } from "@/store/auth-store";
import { PlatformPlanFormDrawer } from "./platform-plan-form-drawer";
import { PlatformPlanStatusDialog } from "./platform-plan-status-dialog";
import { PlatformPlansTable } from "./platform-plans-table";

type PlanStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

export function PlatformPlansPage() {
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManagePlatformCompanies(currentUser?.role);
  const plansQuery = usePlatformPlans(canManage);
  const [statusFilter, setStatusFilter] = useState<PlanStatusFilter>("ALL");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlatformPlan | null>(null);
  const [statusPlan, setStatusPlan] = useState<PlatformPlan | null>(null);
  const plans = useMemo(() => plansQuery.data ?? [], [plansQuery.data]);
  const filteredPlans = useMemo(
    () =>
      plans.filter((plan) => {
        if (statusFilter === "ACTIVE") {
          return plan.isActive;
        }
        if (statusFilter === "INACTIVE") {
          return !plan.isActive;
        }
        return true;
      }),
    [plans, statusFilter],
  );

  function handleCreate() {
    setEditingPlan(null);
    setIsFormOpen(true);
  }

  function handleEdit(plan: PlatformPlan) {
    setEditingPlan(plan);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingPlan(null);
  }

  if (!canManage) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Platform" title="Plans">
          Manage SaaS subscription plans and platform usage limits.
        </PageHeader>
        <PermissionState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button onClick={handleCreate}>
            <Plus className="size-4" />
            Create Plan
          </Button>
        }
        eyebrow="Platform"
        title="Plans"
      >
        Manage SaaS subscription plans and tenant usage limits.
      </PageHeader>

      <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="plan-status-filter"
            >
              Status
            </label>
            <select
              id="plan-status-filter"
              className="flex h-10 w-44 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-ring"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as PlanStatusFilter)
              }
            >
              <option value="ALL">All plans</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {filteredPlans.length} of {plans.length} plans
          </p>
        </div>
      </div>

      <PlatformPlansTable
        error={plansQuery.error}
        isError={plansQuery.isError}
        isLoading={plansQuery.isLoading}
        plans={filteredPlans}
        onEdit={handleEdit}
        onToggleStatus={setStatusPlan}
      />

      <PlatformPlanFormDrawer
        isOpen={isFormOpen}
        plan={editingPlan}
        onClose={handleCloseForm}
      />

      <PlatformPlanStatusDialog
        isActivating={!(statusPlan?.isActive ?? true)}
        plan={statusPlan}
        onClose={() => setStatusPlan(null)}
      />
    </div>
  );
}

function PermissionState() {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
          <div>
            <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
              <ShieldAlert className="size-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              Super admin access required
            </p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Platform plan management is available only to super admins.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
