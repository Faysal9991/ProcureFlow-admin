"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { useCreateDepartment, useUpdateDepartment } from "../hooks";
import {
  departmentFormSchema,
  type DepartmentFormValues,
} from "../schemas";
import type { Department } from "../types";
import { getDepartmentMutationError, getDepartmentStatus } from "../utils";

type DepartmentFormDrawerProps = {
  department: Department | null;
  isOpen: boolean;
  onClose: () => void;
};

const emptyValues: DepartmentFormValues = {
  description: "",
  name: "",
  status: "ACTIVE",
};

export function DepartmentFormDrawer({
  department,
  isOpen,
  onClose,
}: DepartmentFormDrawerProps) {
  const [apiError, setApiError] = useState("");
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();
  const isEditing = !!department;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const title = isEditing ? "Edit Department" : "Create Department";
  const description = isEditing
    ? "Update department profile and status."
    : "Create a department for this company.";
  const defaultValues = useMemo<DepartmentFormValues>(
    () =>
      department
        ? {
            description: department.description ?? "",
            name: department.name,
            status: getDepartmentStatus(department.status),
          }
        : emptyValues,
    [department],
  );

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<DepartmentFormValues>({
    defaultValues,
    resolver: zodResolver(departmentFormSchema),
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

  function onSubmit(values: DepartmentFormValues) {
    setApiError("");

    if (department) {
      updateMutation.mutate(
        {
          id: department.uuid,
          payload: values,
        },
        {
          onError: (error) => {
            setApiError(getDepartmentMutationError(getApiErrorMessage(error)));
          },
          onSuccess: () => {
            setApiError("");
            onClose();
          },
        },
      );
      return;
    }

    createMutation.mutate(values, {
      onError: (error) => {
        setApiError(getDepartmentMutationError(getApiErrorMessage(error)));
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
        aria-label="Close department form"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
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
              <Label htmlFor="department-name">Name</Label>
              <Input
                id="department-name"
                aria-invalid={!!errors.name}
                placeholder="Operations"
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-sm text-error">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department-description">Description</Label>
              <textarea
                id="department-description"
                className={textareaClassName}
                placeholder="Department purpose and ownership"
                rows={5}
                {...register("description")}
              />
              {errors.description ? (
                <p className="text-sm text-error">
                  {errors.description.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="department-form-status">Status</Label>
              <select
                id="department-form-status"
                className={selectClassName}
                {...register("status")}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              {errors.status ? (
                <p className="text-sm text-error">{errors.status.message}</p>
              ) : null}
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
              {isEditing ? "Save changes" : "Create department"}
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}

const textareaClassName = cn(
  "flex w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors",
  "placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
);

const selectClassName = cn(
  "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors",
  "focus:border-primary focus:ring-4 focus:ring-ring",
);
