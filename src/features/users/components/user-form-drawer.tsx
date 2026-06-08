"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Department } from "@/features/departments/types";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { useCreateUser, useUpdateUser } from "../hooks";
import {
  createUserFormSchema,
  type CreateUserFormValues,
} from "../schemas";
import type {
  CompanyRole,
  CreateUserRequest,
  ManagedUser,
  UpdateUserRequest,
  UserRole,
} from "../types";
import {
  getUserCompanyRoleId,
  getUserMutationError,
  getUserRole,
  getUserStatus,
  normalizeOptionalString,
  tenantRoles,
} from "../utils";

type UserFormDrawerProps = {
  companyRoles: CompanyRole[];
  departments: Department[];
  isOpen: boolean;
  user: ManagedUser | null;
  onClose: () => void;
  onTemporaryPassword: (password: string, title: string, description: string) => void;
};

const emptyValues: CreateUserFormValues = {
  companyRoleId: "",
  departmentId: "",
  email: "",
  name: "",
  phone: "",
  role: "EMPLOYEE",
  status: "ACTIVE",
};

export function UserFormDrawer({
  companyRoles,
  departments,
  isOpen,
  user,
  onClose,
  onTemporaryPassword,
}: UserFormDrawerProps) {
  const [apiError, setApiError] = useState("");
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const isEditing = !!user;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const title = isEditing ? "Edit User" : "Create User";
  const description = isEditing
    ? "Update identity, role, department, and account status."
    : "Create a tenant user. A temporary password will be generated automatically.";
  const activeDepartments = useMemo(
    () =>
      departments.filter(
        (department) => department.status !== "INACTIVE",
      ),
    [departments],
  );
  const activeCompanyRoles = useMemo(
    () => companyRoles.filter((role) => role.isActive !== false),
    [companyRoles],
  );
  const defaultValues = useMemo<CreateUserFormValues>(() => {
    if (user) {
      const role = getUserRole(user.role);

      return {
        companyRoleId: getUserCompanyRoleId(user),
        departmentId: user.departmentId ?? "",
        email: user.email,
        name: user.name,
        phone: user.phone ?? "",
        role,
        status: getUserStatus(user.status),
      };
    }

    return emptyValues;
  }, [user]);

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<CreateUserFormValues>({
    defaultValues,
    resolver: zodResolver(createUserFormSchema),
  });
  const selectedRole = useWatch({ control, name: "role" });
  const isDepartmentRequired = selectedRole !== "COMPANY_ADMIN";

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

  function buildSharedPayload(
    values: CreateUserFormValues,
  ): Omit<CreateUserRequest, "email"> | UpdateUserRequest {
    const role = values.role;
    const departmentId = getDepartmentPayloadValue(
      role,
      values.departmentId,
      isEditing,
    );

    return {
      companyRoleId: normalizeOptionalString(values.companyRoleId),
      departmentId,
      name: values.name.trim(),
      phone: normalizeOptionalString(values.phone),
      role,
      status: values.status,
    };
  }

  function onSubmit(values: CreateUserFormValues) {
    setApiError("");

    if (user) {
      updateMutation.mutate(
        {
          id: user.uuid,
          payload: buildSharedPayload(values) as UpdateUserRequest,
        },
        {
          onError: (error) => {
            setApiError(getUserMutationError(getApiErrorMessage(error)));
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
        ...(buildSharedPayload(values) as Omit<CreateUserRequest, "email">),
        email: values.email.trim().toLowerCase(),
      },
      {
        onError: (error) => {
          setApiError(getUserMutationError(getApiErrorMessage(error)));
        },
        onSuccess: (data) => {
          setApiError("");
          onClose();
          onTemporaryPassword(
            data.temporaryPassword,
            "Temporary password generated",
            "Share this password with the new user through a secure channel.",
          );
        },
      },
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close user form"
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
              <Label htmlFor="user-name">Name</Label>
              <Input
                id="user-name"
                aria-invalid={!!errors.name}
                placeholder="Amina Rahman"
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-sm text-error">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input
                id="user-email"
                aria-invalid={!!errors.email}
                disabled={isEditing}
                placeholder="amina@company.com"
                type="email"
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-sm text-error">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-phone">Phone</Label>
              <Input
                id="user-phone"
                aria-invalid={!!errors.phone}
                placeholder="01700000000"
                {...register("phone")}
              />
              {errors.phone ? (
                <p className="text-sm text-error">{errors.phone.message}</p>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="user-role">System Role</Label>
                <select
                  id="user-role"
                  className={selectClassName}
                  {...register("role", {
                    onChange: () => {
                      setValue("companyRoleId", "");
                    },
                  })}
                >
                  {tenantRoles.map((role) => (
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
                <Label htmlFor="user-status">Status</Label>
                <select
                  id="user-status"
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

            <div className="space-y-2">
              <Label htmlFor="user-company-role">Company Role</Label>
              <select
                id="user-company-role"
                className={selectClassName}
                {...register("companyRoleId")}
              >
                <option value="">Use system default</option>
                {activeCompanyRoles.map((companyRole) => (
                  <option key={companyRole.id} value={companyRole.id}>
                    {companyRole.name}
                  </option>
                ))}
              </select>
              {errors.companyRoleId ? (
                <p className="text-sm text-error">
                  {errors.companyRoleId.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-department">
                Department
                {!isDepartmentRequired ? (
                  <span className="ml-1 font-normal text-muted-foreground">
                    optional
                  </span>
                ) : null}
              </Label>
              <select
                id="user-department"
                className={selectClassName}
                {...register("departmentId")}
              >
                <option value="">
                  {isDepartmentRequired
                    ? "Select department"
                    : "No department"}
                </option>
                {activeDepartments.map((department) => (
                  <option key={department.uuid} value={department.uuid}>
                    {department.name}
                  </option>
                ))}
              </select>
              {errors.departmentId ? (
                <p className="text-sm text-error">
                  {errors.departmentId.message}
                </p>
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
              {isEditing ? "Save changes" : "Create user"}
            </Button>
          </div>
        </form>
      </aside>
    </div>
  );
}

function getDepartmentPayloadValue(
  role: UserRole,
  departmentId: string | undefined,
  isEditing: boolean,
) {
  const normalizedDepartmentId = normalizeOptionalString(departmentId);

  if (normalizedDepartmentId) {
    return normalizedDepartmentId;
  }

  if (role === "COMPANY_ADMIN" && isEditing) {
    return "";
  }

  return undefined;
}

const selectClassName = cn(
  "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors",
  "focus:border-primary focus:ring-4 focus:ring-ring",
);
