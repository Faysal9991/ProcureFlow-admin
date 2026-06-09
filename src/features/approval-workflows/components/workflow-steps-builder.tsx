"use client";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Edit3,
  Inbox,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Department } from "@/features/departments/types";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  useDeleteApprovalWorkflowStep,
  useUpdateApprovalWorkflowStep,
} from "../hooks";
import type {
  ApprovalWorkflow,
  ApprovalWorkflowStep,
  WorkflowApproverRole,
} from "../types";
import {
  getApproverRoleLabel,
  getDepartmentName,
  getWorkflowMutationError,
  sortWorkflowSteps,
} from "../utils";
import { WorkflowStepFormDrawer } from "./workflow-step-form-drawer";

type WorkflowStepsBuilderProps = {
  canManage: boolean;
  departments: Department[];
  workflow: ApprovalWorkflow;
};

export function WorkflowStepsBuilder({
  canManage,
  departments,
  workflow,
}: WorkflowStepsBuilderProps) {
  const steps = useMemo(() => sortWorkflowSteps(workflow.steps), [workflow.steps]);
  const canEditSteps = canManage && !workflow.isActive;
  const [editingStep, setEditingStep] = useState<ApprovalWorkflowStep | null>(
    null,
  );
  const [deletingStep, setDeletingStep] = useState<ApprovalWorkflowStep | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [reorderError, setReorderError] = useState("");
  const updateStepMutation = useUpdateApprovalWorkflowStep();
  const deleteStepMutation = useDeleteApprovalWorkflowStep();
  const isReordering = updateStepMutation.isPending;

  function handleAddStep() {
    setEditingStep(null);
    setIsFormOpen(true);
  }

  function handleEditStep(step: ApprovalWorkflowStep) {
    setEditingStep(step);
    setIsFormOpen(true);
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const current = steps[index];
    const target = steps[targetIndex];

    if (!current || !target || !canEditSteps) {
      return;
    }

    setReorderError("");

    try {
      await updateStepMutation.mutateAsync({
        payload: {
          departmentId: current.departmentId || null,
          isRequired: true,
          role: current.role as WorkflowApproverRole,
          stepOrder: target.stepOrder,
        },
        stepId: current.id,
        workflowId: workflow.id,
      });
      await updateStepMutation.mutateAsync({
        payload: {
          departmentId: target.departmentId || null,
          isRequired: true,
          role: target.role as WorkflowApproverRole,
          stepOrder: current.stepOrder,
        },
        stepId: target.id,
        workflowId: workflow.id,
      });
    } catch (error) {
      setReorderError(getWorkflowMutationError(getApiErrorMessage(error)));
    }
  }

  function handleDeleteStep() {
    if (!deletingStep) {
      return;
    }

    deleteStepMutation.mutate(
      {
        stepId: deletingStep.id,
        workflowId: workflow.id,
      },
      {
        onError: (error) => {
          setReorderError(getWorkflowMutationError(getApiErrorMessage(error)));
        },
        onSuccess: () => {
          setDeletingStep(null);
          setReorderError("");
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Approval Steps</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Steps run in ascending order when a matching workflow is selected.
          </p>
        </div>
        {canEditSteps ? (
          <Button onClick={handleAddStep}>
            <Plus className="size-4" />
            Add Step
          </Button>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {workflow.isActive ? (
          <div className="rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-warning">
            Deactivate this workflow before editing approval steps.
          </div>
        ) : null}

        {!canManage ? (
          <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
            Procurement users can inspect steps in read-only mode.
          </div>
        ) : null}

        {reorderError ? (
          <div className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
            {reorderError}
          </div>
        ) : null}

        {steps.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Inbox className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                No approval steps
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add at least one required step before activating this workflow.
              </p>
            </div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Approver Role</TableHead>
                <TableHead>Department Scope</TableHead>
                <TableHead>Required</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {steps.map((step, index) => (
                <TableRow key={step.id}>
                  <TableCell className="font-medium">
                    Step {step.stepOrder}
                  </TableCell>
                  <TableCell>{getApproverRoleLabel(step.role)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {getDepartmentName(departments, step.departmentId)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={step.isRequired ? "success" : "warning"}>
                      {step.isRequired ? "Required" : "Optional"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        disabled={!canEditSteps || index === 0 || isReordering}
                        size="sm"
                        variant="outline"
                        onClick={() => handleMove(index, "up")}
                      >
                        <ArrowUp className="size-4" />
                        Up
                      </Button>
                      <Button
                        disabled={
                          !canEditSteps ||
                          index === steps.length - 1 ||
                          isReordering
                        }
                        size="sm"
                        variant="outline"
                        onClick={() => handleMove(index, "down")}
                      >
                        <ArrowDown className="size-4" />
                        Down
                      </Button>
                      <Button
                        disabled={!canEditSteps}
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditStep(step)}
                      >
                        <Edit3 className="size-4" />
                        Edit
                      </Button>
                      <Button
                        disabled={!canEditSteps}
                        size="sm"
                        variant="danger"
                        onClick={() => setDeletingStep(step)}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <WorkflowStepFormDrawer
          departments={departments}
          isOpen={isFormOpen}
          nextStepOrder={steps.length + 1}
          step={editingStep}
          workflowId={workflow.id}
          onClose={() => {
            setIsFormOpen(false);
            setEditingStep(null);
          }}
        />

        <DeleteStepDialog
          isPending={deleteStepMutation.isPending}
          step={deletingStep}
          onClose={() => {
            if (!deleteStepMutation.isPending) {
              setDeletingStep(null);
            }
          }}
          onDelete={handleDeleteStep}
        />
      </CardContent>
    </Card>
  );
}

function DeleteStepDialog({
  isPending,
  onClose,
  onDelete,
  step,
}: {
  isPending: boolean;
  onClose: () => void;
  onDelete: () => void;
  step: ApprovalWorkflowStep | null;
}) {
  if (!step) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close delete step confirmation"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-2xl">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-error/10 text-error">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Delete step
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              This removes Step {step.stepOrder}. Reorder remaining inactive
              steps before activating the workflow.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            disabled={isPending}
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            isLoading={isPending}
            type="button"
            variant="danger"
            onClick={onDelete}
          >
            Delete step
          </Button>
        </div>
      </div>
    </div>
  );
}
