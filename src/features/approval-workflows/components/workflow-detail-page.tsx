"use client";

import Link from "next/link";
import { ArrowLeft, Edit3, ShieldAlert, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button, getButtonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDepartments } from "@/features/departments/hooks";
import { getApiErrorMessage } from "@/lib/api/client";
import { ROUTES } from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";
import { useApprovalWorkflow } from "../hooks";
import type { ApprovalWorkflow } from "../types";
import {
  canManageApprovalWorkflows,
  canReadApprovalWorkflows,
  formatWorkflowCurrency,
  formatWorkflowDate,
  getDepartmentName,
  getWorkflowRuleLabel,
  getWorkflowStepSummary,
} from "../utils";
import { DeleteWorkflowDialog } from "./delete-workflow-dialog";
import { WorkflowFormDrawer } from "./workflow-form-drawer";
import { WorkflowStepsBuilder } from "./workflow-steps-builder";

type WorkflowDetailPageProps = {
  workflowId: string;
};

export function WorkflowDetailPage({ workflowId }: WorkflowDetailPageProps) {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const canRead = canReadApprovalWorkflows(currentUser?.role);
  const canManage = canManageApprovalWorkflows(currentUser?.role);
  const workflowQuery = useApprovalWorkflow(workflowId, canRead);
  const departmentsQuery = useDepartments(canRead);
  const departments = useMemo(
    () => departmentsQuery.data ?? [],
    [departmentsQuery.data],
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingWorkflow, setDeletingWorkflow] =
    useState<ApprovalWorkflow | null>(null);
  const workflow = workflowQuery.data;

  if (!canRead) {
    return (
      <BlockedDetailState
        title="Approval workflow unavailable"
        message="Approval workflows are available to company admins and procurement users only."
      />
    );
  }

  if (workflowQuery.isLoading) {
    return <WorkflowDetailSkeleton />;
  }

  if (workflowQuery.isError || !workflow) {
    return (
      <BlockedDetailState
        title="Approval workflow unavailable"
        message={getApiErrorMessage(workflowQuery.error)}
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
              href={ROUTES.approvalWorkflows}
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
            {canManage ? (
              <Button variant="outline" onClick={() => setIsFormOpen(true)}>
                <Edit3 className="size-4" />
                Edit
              </Button>
            ) : null}
            {canManage ? (
              <Button
                disabled={workflow.isActive}
                variant="danger"
                onClick={() => setDeletingWorkflow(workflow)}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            ) : null}
          </div>
        }
        eyebrow="Approval Workflow"
        title={workflow.name}
      >
        {getWorkflowRuleLabel(workflow, departments)}
      </PageHeader>

      {!canManage ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Procurement users can view approval workflow configuration in
            read-only mode.
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-4">
        <WorkflowMetric
          label="Status"
          value={
            <Badge variant={workflow.isActive ? "success" : "warning"}>
              {workflow.isActive ? "Active" : "Inactive"}
            </Badge>
          }
        />
        <WorkflowMetric
          label="Default"
          value={
            <Badge variant={workflow.isDefault ? "primary" : "default"}>
              {workflow.isDefault ? "Default" : "Rule-based"}
            </Badge>
          }
        />
        <WorkflowMetric label="Priority" value={workflow.priority} />
        <WorkflowMetric
          label="Steps"
          value={getWorkflowStepSummary(workflow.steps)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Rule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <WorkflowField
              label="Department"
              value={getDepartmentName(departments, workflow.departmentId)}
            />
            <WorkflowField
              label="Min Amount"
              value={formatWorkflowCurrency(workflow.minAmount)}
            />
            <WorkflowField
              label="Max Amount"
              value={formatWorkflowCurrency(workflow.maxAmount)}
            />
            <WorkflowField
              label="Updated"
              value={formatWorkflowDate(workflow.updatedAt)}
            />
          </div>
        </CardContent>
      </Card>

      <WorkflowStepsBuilder
        canManage={canManage}
        departments={departments}
        workflow={workflow}
      />

      <WorkflowFormDrawer
        departments={departments}
        isOpen={isFormOpen}
        workflow={workflow}
        onClose={() => setIsFormOpen(false)}
      />

      <DeleteWorkflowDialog
        workflow={deletingWorkflow}
        onClose={() => setDeletingWorkflow(null)}
        onDeleted={() => router.push(ROUTES.approvalWorkflows)}
      />
    </div>
  );
}

function WorkflowMetric({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="mt-2 text-lg font-semibold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}

function WorkflowField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-foreground">
        {value || "Not available"}
      </p>
    </div>
  );
}

function BlockedDetailState({
  message,
  title,
}: {
  message: string;
  title: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Procurement" title={title}>
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
                Workflow unavailable
              </p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {message}
              </p>
              <div className="mt-4 flex justify-center">
                <Link
                  className={getButtonClassName({ variant: "outline" })}
                  href={ROUTES.approvalWorkflows}
                >
                  Back to workflows
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function WorkflowDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 max-w-xl rounded-lg bg-muted" />
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 rounded-lg bg-muted" />
        ))}
      </div>
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="h-28 rounded-lg bg-muted" />
          <div className="h-48 rounded-lg bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}
