"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Department } from "@/features/departments/types";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import {
  useCreateApprovalWorkflowStep,
  useUpdateApprovalWorkflowStep,
} from "../hooks";
import {
  workflowStepFormSchema,
  type WorkflowStepFormValues,
} from "../schemas";
import type { ApprovalWorkflowStep, StepRequest } from "../types";
import {
  getWorkflowMutationError,
  workflowApproverRoles,
} from "../utils";

type WorkflowStepFormDrawerProps = {
  departments: Department[];
  isOpen: boolean;
  nextStepOrder: number;
  onClose: () => void;
  step: ApprovalWorkflowStep | null;
  workflowId: string;
};

export function WorkflowStepFormDrawer({
  departments,
  isOpen,
  nextStepOrder,
  onClose,
  step,
  workflowId,
}: WorkflowStepFormDrawerProps) {
  const [apiError, setApiError] = useState("");
  const createMutation = useCreateApprovalWorkflowStep();
  const updateMutation = useUpdateApprovalWorkflowStep();
  const isEditing = !!step;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const defaultValues = useMemo<WorkflowStepFormValues>(
    () =>
      step
        ? {
            departmentId: step.departmentId ?? "",
            isRequired: true,
            role:
              step.role === "PROCUREMENT" ||
              step.role === "FINANCE" ||
              step.role === "COMPANY_ADMIN"
                ? step.role
                : "MANAGER",
            stepOrder: step.stepOrder,
          }
        : {
            departmentId: "",
            isRequired: true,
            role: "MANAGER",
            stepOrder: nextStepOrder,
          },
    [nextStepOrder, step],
  );

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<WorkflowStepFormValues>({
    defaultValues,
    resolver: zodResolver(workflowStepFormSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
  }, [defaultValues, isOpen, reset]);

  if (!isOpen) {
    return null;
  }

  function handleClose() {
    if (!isPending) {
      setApiError("");
      onClose();
    }
  }

  function normalizePayload(values: WorkflowStepFormValues): StepRequest {
    return {
      departmentId: values.departmentId || null,
      isRequired: true,
      role: values.role,
      stepOrder: Number(values.stepOrder),
    };
  }

  function onSubmit(values: WorkflowStepFormValues) {
    setApiError("");

    if (step) {
      updateMutation.mutate(
        {
          payload: normalizePayload(values),
          stepId: step.id,
          workflowId,
        },
        {
          onError: (error) => {
            setApiError(
              getWorkflowMutationError(getApiErrorMessage(error)),
            );
          },
          onSuccess: () => {
            setApiError("");
            onClose();
          },
        },
      );
      return;
    }

    createMutation.mutate(
      {
        payload: normalizePayload(values),
        workflowId,
      },
      {
        onError: (error) => {
          setApiError(getWorkflowMutationError(getApiErrorMessage(error)));
        },
        onSuccess: () => {
          setApiError("");
          onClose();
        },
      },
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close step form"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-lg flex-col bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isEditing ? "Edit Step" : "Add Step"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Define the approver role and optional department scope.
            </p>
          </div>
          <Button
            aria-label="Close"
            disabled={isPending}
            size="icon"
            variant="ghost"
            onClick={handleClose}
          >
            <X className="size-5" />
          </Button>
        </div>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            {apiError ? (
              <div className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
                {apiError}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="workflow-step-order">Step Order</Label>
              <Input
                id="workflow-step-order"
                aria-invalid={!!errors.stepOrder}
                disabled={isPending}
                min="1"
                step="1"
                type="number"
                {...register("stepOrder", { valueAsNumber: true })}
              />
              {errors.stepOrder ? (
                <p className="text-sm text-error">
                  {errors.stepOrder.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="workflow-step-role">Approver Role</Label>
              <select
                id="workflow-step-role"
                className={selectClassName}
                disabled={isPending}
                {...register("role")}
              >
                {workflowApproverRoles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {errors.role ? (
                <p className="text-sm text-error">{errors.role.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="workflow-step-department">Department</Label>
              <select
                id="workflow-step-department"
                className={selectClassName}
                disabled={isPending}
                {...register("departmentId")}
              >
                <option value="">All departments</option>
                {departments.map((department) => (
                  <option key={department.uuid} value={department.uuid}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
              <input
                checked
                className="size-4 accent-primary"
                disabled
                type="checkbox"
                {...register("isRequired")}
              />
              <span>
                <span className="block text-sm font-medium text-foreground">
                  Required
                </span>
                <span className="block text-xs text-muted-foreground">
                  Current backend requires every step.
                </span>
              </span>
            </label>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border p-5 sm:flex-row sm:justify-end">
            <Button
              disabled={isPending}
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button isLoading={isPending} type="submit">
              {isEditing ? "Save step" : "Add step"}
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}

const selectClassName = cn(
  "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors",
  "focus:border-primary focus:ring-4 focus:ring-ring",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
);
