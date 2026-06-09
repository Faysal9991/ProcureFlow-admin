"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Search, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/store/auth-store";
import {
  useAssignableUsers,
  useAssignUserRole,
} from "../hooks";
import { assignRoleSchema, type AssignRoleValues } from "../schemas";
import type { CompanyRole } from "../types";
import {
  ASSIGNABLE_USER_LIMIT,
  getRoleMutationError,
} from "../utils";

type AssignRoleDialogProps = {
  defaultRoleId?: string;
  isOpen: boolean;
  roles: CompanyRole[];
  onClose: () => void;
};

export function AssignRoleDialog({
  defaultRoleId = "",
  isOpen,
  roles,
  onClose,
}: AssignRoleDialogProps) {
  const currentUser = useAuthStore((state) => state.user);
  const [search, setSearch] = useState("");
  const [apiError, setApiError] = useState("");
  const usersQuery = useAssignableUsers(
    {
      limit: ASSIGNABLE_USER_LIMIT,
      page: 1,
      search: search.trim() || undefined,
    },
    isOpen,
  );
  const mutation = useAssignUserRole();
  const activeRoles = useMemo(
    () => roles.filter((role) => role.isActive),
    [roles],
  );
  const users = useMemo(
    () =>
      (usersQuery.data?.items ?? []).filter(
        (user) => user.uuid !== currentUser?.uuid,
      ),
    [currentUser?.uuid, usersQuery.data?.items],
  );
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<AssignRoleValues>({
    defaultValues: {
      roleId: defaultRoleId,
      userId: "",
    },
    resolver: zodResolver(assignRoleSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset({ roleId: defaultRoleId, userId: "" });
    }
  }, [defaultRoleId, isOpen, reset]);

  if (!isOpen) {
    return null;
  }

  function handleClose() {
    if (!mutation.isPending) {
      setApiError("");
      setSearch("");
      onClose();
    }
  }

  function onSubmit(values: AssignRoleValues) {
    setApiError("");

    mutation.mutate(values, {
      onError: (error) => {
        setApiError(getRoleMutationError(getApiErrorMessage(error)));
      },
      onSuccess: () => {
        setApiError("");
        setSearch("");
        onClose();
      },
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close assign role dialog"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <form
        className="relative w-full max-w-lg rounded-lg border border-border bg-surface p-5 shadow-2xl"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <UserPlus className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Assign Company Role
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              One user can have one active company role. Assigning a new role
              replaces the current assignment.
            </p>
          </div>
        </div>

        {apiError ? (
          <div className="mt-4 rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
            {apiError}
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assign-user-search">Search Users</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="assign-user-search"
                className="pl-9"
                disabled={usersQuery.isLoading}
                placeholder="Search name, email, phone"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assign-user">User</Label>
            <select
              id="assign-user"
              className={selectClassName}
              disabled={usersQuery.isLoading}
              {...register("userId")}
            >
              <option value="">
                {usersQuery.isLoading ? "Loading users..." : "Select user"}
              </option>
              {users.map((user) => (
                <option key={user.uuid} value={user.uuid}>
                  {user.name} - {user.email}
                  {user.companyRole?.name ? ` (${user.companyRole.name})` : ""}
                </option>
              ))}
            </select>
            {errors.userId ? (
              <p className="text-sm text-error">{errors.userId.message}</p>
            ) : null}
            {usersQuery.isError ? (
              <p className="text-sm text-error">
                {getApiErrorMessage(usersQuery.error)}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="assign-role">Company Role</Label>
            <select
              id="assign-role"
              className={selectClassName}
              {...register("roleId")}
            >
              <option value="">Select company role</option>
              {activeRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
            {errors.roleId ? (
              <p className="text-sm text-error">{errors.roleId.message}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            disabled={mutation.isPending}
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button isLoading={mutation.isPending} type="submit">
            Assign role
          </Button>
        </div>
      </form>
    </div>
  );
}

const selectClassName = cn(
  "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors",
  "focus:border-primary focus:ring-4 focus:ring-ring",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
);
