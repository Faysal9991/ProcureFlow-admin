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
import {
  useCreateCompanyRole,
  useUpdateCompanyRole,
} from "../hooks";
import { roleFormSchema, type RoleFormValues } from "../schemas";
import type { CompanyRole, Permission } from "../types";
import {
  getRoleMutationError,
  groupPermissions,
  isCompanyAdminTemplate,
  normalizeOptionalString,
  rolePermissionIds,
} from "../utils";

type RoleFormDrawerProps = {
  isOpen: boolean;
  permissions: Permission[];
  role: CompanyRole | null;
  onClose: () => void;
};

const emptyValues: RoleFormValues = {
  description: "",
  isActive: true,
  name: "",
  permissionIds: [],
};

export function RoleFormDrawer({
  isOpen,
  permissions,
  role,
  onClose,
}: RoleFormDrawerProps) {
  const [apiError, setApiError] = useState("");
  const createMutation = useCreateCompanyRole();
  const updateMutation = useUpdateCompanyRole();
  const isEditing = !!role;
  const isProtectedCompanyAdmin = isCompanyAdminTemplate(role ?? undefined);
  const isPending = createMutation.isPending || updateMutation.isPending;
  const permissionGroups = useMemo(
    () => groupPermissions(permissions),
    [permissions],
  );
  const defaultValues = useMemo<RoleFormValues>(
    () =>
      role
        ? {
            description: role.description ?? "",
            isActive: role.isActive,
            name: role.name,
            permissionIds: rolePermissionIds(role),
          }
        : emptyValues,
    [role],
  );
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<RoleFormValues>({
    defaultValues,
    resolver: zodResolver(roleFormSchema),
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

  function onSubmit(values: RoleFormValues) {
    setApiError("");

    if (role) {
      updateMutation.mutate(
        {
          id: role.id,
          payload: {
            description: normalizeOptionalString(values.description) ?? "",
            isActive: isProtectedCompanyAdmin ? true : values.isActive,
            name: values.name.trim(),
          },
        },
        {
          onError: (error) => {
            setApiError(getRoleMutationError(getApiErrorMessage(error)));
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
        description: normalizeOptionalString(values.description),
        isActive: values.isActive,
        name: values.name.trim(),
        permissionIds: values.permissionIds ?? [],
      },
      {
        onError: (error) => {
          setApiError(getRoleMutationError(getApiErrorMessage(error)));
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
        aria-label="Close role form"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {isEditing ? "Edit Role" : "Create Role"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEditing
                ? "Update role metadata and active status."
                : "Create a custom role and choose its starting permissions."}
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

            {isProtectedCompanyAdmin ? (
              <div className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-primary">
                Company Admin must remain active. Its permission matrix is
                protected on the detail page.
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                aria-invalid={!!errors.name}
                placeholder="Procurement Lead"
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-sm text-error">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <textarea
                id="role-description"
                className={textareaClassName}
                placeholder="Describe what this role is responsible for"
                rows={4}
                {...register("description")}
              />
              {errors.description ? (
                <p className="text-sm text-error">
                  {errors.description.message}
                </p>
              ) : null}
            </div>

            <label className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 text-sm font-medium text-foreground">
              <input
                className="size-4 accent-primary"
                disabled={isProtectedCompanyAdmin}
                type="checkbox"
                {...register("isActive")}
              />
              Active role
            </label>

            {!isEditing ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Initial Permissions
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You can adjust these later from the role detail page.
                  </p>
                </div>
                <div className="space-y-4">
                  {permissionGroups.map((group) => (
                    <div
                      key={group.group}
                      className="rounded-lg border border-border bg-background p-3"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {group.group}
                      </p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {group.permissions.map((permission) => (
                          <label
                            key={permission.id}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <input
                              className="mt-0.5 size-4 accent-primary"
                              type="checkbox"
                              value={permission.id}
                              {...register("permissionIds")}
                            />
                            <span>{permission.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
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
              {isEditing ? "Save changes" : "Create role"}
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
  "placeholder:text-muted-foreground",
  "focus:border-primary focus:ring-4 focus:ring-ring",
);
