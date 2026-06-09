"use client";

import { Plus, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDepartments } from "@/features/departments/hooks";
import { useAuthStore } from "@/store/auth-store";
import { useApprovalWorkflows } from "../hooks";
import type { ApprovalWorkflow } from "../types";
import {
  canManageApprovalWorkflows,
  canReadApprovalWorkflows,
} from "../utils";
import { DeleteWorkflowDialog } from "./delete-workflow-dialog";
import { WorkflowFormDrawer } from "./workflow-form-drawer";
import { WorkflowTable } from "./workflow-table";

export function WorkflowsPage() {
  const currentUser = useAuthStore((state) => state.user);
  const canRead = canReadApprovalWorkflows(currentUser?.role);
  const canManage = canManageApprovalWorkflows(currentUser?.role);
  const workflowsQuery = useApprovalWorkflows(canRead);
  const departmentsQuery = useDepartments(canRead);
  const workflows = workflowsQuery.data ?? [];
  const departments = useMemo(
    () => departmentsQuery.data ?? [],
    [departmentsQuery.data],
  );
  const [editingWorkflow, setEditingWorkflow] =
    useState<ApprovalWorkflow | null>(null);
  const [deletingWorkflow, setDeletingWorkflow] =
    useState<ApprovalWorkflow | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  function handleCreate() {
    setEditingWorkflow(null);
    setIsFormOpen(true);
  }

  function handleEdit(workflow: ApprovalWorkflow) {
    setEditingWorkflow(workflow);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingWorkflow(null);
  }

  if (!canRead) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Procurement" title="Approval Workflows">
          Configure multi-step approval rules for purchase requests.
        </PageHeader>
        <Card>
          <CardContent className="p-8">
            <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
              <div>
                <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                  <ShieldAlert className="size-5" />
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  Workflow access unavailable
                </p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Approval workflows are available to company admins and
                  procurement users. Super admins do not manage tenant
                  workflows here.
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
              Create Workflow
            </Button>
          ) : null
        }
        eyebrow="Procurement"
        title="Approval Workflows"
      >
        Configure multi-step approval rules by department and amount range.
      </PageHeader>

      {!canManage ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Procurement users can inspect approval workflows in read-only mode.
            Company admins manage workflow rules and approval steps.
          </CardContent>
        </Card>
      ) : null}

      <WorkflowTable
        canManage={canManage}
        departments={departments}
        error={workflowsQuery.error}
        isError={workflowsQuery.isError}
        isLoading={workflowsQuery.isLoading}
        workflows={workflows}
        onDelete={setDeletingWorkflow}
        onEdit={handleEdit}
      />

      <WorkflowFormDrawer
        departments={departments}
        isOpen={isFormOpen}
        workflow={editingWorkflow}
        onClose={handleCloseForm}
      />

      <DeleteWorkflowDialog
        workflow={deletingWorkflow}
        onClose={() => setDeletingWorkflow(null)}
      />
    </div>
  );
}
