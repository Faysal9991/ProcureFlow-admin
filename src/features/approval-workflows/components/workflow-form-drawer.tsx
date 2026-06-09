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
  useCreateApprovalWorkflow,
  useUpdateApprovalWorkflow,
} from "../hooks";
import { workflowFormSchema, type WorkflowFormValues } from "../schemas";
import type { ApprovalWorkflow, WorkflowRequest } from "../types";
import {
  getWorkflowMutationError,
  parseOptionalAmount,
} from "../utils";

type WorkflowFormDrawerProps = {
  departments: Department[];
  isOpen: boolean;
  onClose: () => void;
  workflow: ApprovalWorkflow | null;
};

const emptyValues: WorkflowFormValues = {
  departmentId: "",
  isActive: false,
  isDefault: false,
  maxAmount: "",
  minAmount: "",
  name: "",
  priority: 100,
};

export function WorkflowFormDrawer({
  departments,
  isOpen,
  onClose,
  workflow,
}: WorkflowFormDrawerProps) {
  const [apiError, setApiError] = useState("");
  const createMutation = useCreateApprovalWorkflow();
  const updateMutation = useUpdateApprovalWorkflow();
  const isEditing = !!workflow;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const defaultValues = useMemo<WorkflowFormValues>(
    () =>
      workflow
        ? {
            departmentId: workflow.departmentId ?? "",
            isActive: workflow.isActive,
            isDefault: workflow.isDefault,
            maxAmount: amountToInput(workflow.maxAmount),
            minAmount: amountToInput(workflow.minAmount),
            name: workflow.name,
            priority: workflow.priority,
          }
        : emptyValues,
    [workflow],
  );

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<WorkflowFormValues>({
    defaultValues,
    resolver: zodResolver(workflowFormSchema),
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

  function normalizePayload(values: WorkflowFormValues): WorkflowRequest {
    return {
      departmentId: values.departmentId || null,
      isActive: values.isActive,
      isDefault: values.isDefault,
      maxAmount: parseOptionalAmount(values.maxAmount),
      minAmount: parseOptionalAmount(values.minAmount),
      name: values.name.trim(),
      priority: Number(values.priority),
    };
  }

  function onSubmit(values: WorkflowFormValues) {
    setApiError("");

    if (workflow) {
      updateMutation.mutate(
        {
          id: workflow.id,
          payload: normalizePayload(values),
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

    createMutation.mutate(normalizePayload(values), {
      onError: (error) => {
        setApiError(getWorkflowMutationError(getApiErrorMessage(error)));
      },
      onSuccess: () => {
        setApiError("");
        onClose();
      },
    });
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close workflow form"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isEditing ? "Edit Workflow" : "Create Workflow"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure department and amount rules before adding approval steps.
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
              <Label htmlFor="workflow-name">Name</Label>
              <Input
                id="workflow-name"
                aria-invalid={!!errors.name}
                disabled={isPending}
                placeholder="High value finance approval"
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-sm text-error">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                <input
                  className="size-4 accent-primary"
                  disabled={isPending}
                  type="checkbox"
                  {...register("isActive")}
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">
                    Active
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Available for new submitted requests.
                  </span>
                </span>
              </label>

              <label className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                <input
                  className="size-4 accent-primary"
                  disabled={isPending}
                  type="checkbox"
                  {...register("isDefault")}
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">
                    Default
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Fallback when no rule matches.
                  </span>
                </span>
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="workflow-priority">Priority</Label>
                <Input
                  id="workflow-priority"
                  aria-invalid={!!errors.priority}
                  disabled={isPending}
                  min="0"
                  step="1"
                  type="number"
                  {...register("priority", { valueAsNumber: true })}
                />
                {errors.priority ? (
                  <p className="text-sm text-error">
                    {errors.priority.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="workflow-department">Department</Label>
                <select
                  id="workflow-department"
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
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="workflow-min-amount">Min Amount</Label>
                <Input
                  id="workflow-min-amount"
                  aria-invalid={!!errors.minAmount}
                  disabled={isPending}
                  min="0"
                  placeholder="0"
                  step="0.01"
                  type="number"
                  {...register("minAmount")}
                />
                {errors.minAmount ? (
                  <p className="text-sm text-error">
                    {errors.minAmount.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="workflow-max-amount">Max Amount</Label>
                <Input
                  id="workflow-max-amount"
                  aria-invalid={!!errors.maxAmount}
                  disabled={isPending}
                  min="0"
                  placeholder="No max"
                  step="0.01"
                  type="number"
                  {...register("maxAmount")}
                />
                {errors.maxAmount ? (
                  <p className="text-sm text-error">
                    {errors.maxAmount.message}
                  </p>
                ) : null}
              </div>
            </div>
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
              {isEditing ? "Save changes" : "Create workflow"}
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}

function amountToInput(value?: number | null) {
  return value == null ? "" : String(value);
}

const selectClassName = cn(
  "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors",
  "focus:border-primary focus:ring-4 focus:ring-ring",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
);
