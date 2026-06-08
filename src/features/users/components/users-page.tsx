"use client";

import { Plus, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDepartments } from "@/features/departments/hooks";
import { useAuthStore } from "@/store/auth-store";
import { useCompanyRoles, useUsers } from "../hooks";
import type {
  ManagedUser,
  UserListFilters,
  UserRole,
  UserStatus,
} from "../types";
import { USER_PAGE_SIZE } from "../utils";
import { DeactivateUserDialog } from "./deactivate-user-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import { TemporaryPasswordDialog } from "./temporary-password-dialog";
import { UserFilters } from "./user-filters";
import { UserFormDrawer } from "./user-form-drawer";
import { UsersTable } from "./users-table";

type TemporaryPasswordState = {
  description: string;
  password: string;
  title: string;
};

export function UsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const canManage = currentUser?.role === "COMPANY_ADMIN";
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"ALL" | UserRole>("ALL");
  const [status, setStatus] = useState<"ALL" | UserStatus>("ALL");
  const [departmentId, setDepartmentId] = useState("");
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [statusUser, setStatusUser] = useState<ManagedUser | null>(null);
  const [resetUser, setResetUser] = useState<ManagedUser | null>(null);
  const [temporaryPassword, setTemporaryPassword] =
    useState<TemporaryPasswordState | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryFilters = useMemo<UserListFilters>(
    () => ({
      departmentId: departmentId || undefined,
      limit: USER_PAGE_SIZE,
      page,
      role: role === "ALL" ? undefined : role,
      search: search.trim() || undefined,
      status: status === "ALL" ? undefined : status,
    }),
    [departmentId, page, role, search, status],
  );
  const usersQuery = useUsers(queryFilters, canManage);
  const departmentsQuery = useDepartments(canManage);
  const companyRolesQuery = useCompanyRoles(canManage);
  const userList = usersQuery.data ?? {
    items: [],
    limit: USER_PAGE_SIZE,
    page,
    total: 0,
  };
  const totalPages = Math.max(1, Math.ceil(userList.total / userList.limit));
  const currentPage = userList.page || page;
  const departments = useMemo(
    () => departmentsQuery.data ?? [],
    [departmentsQuery.data],
  );
  const companyRoles = useMemo(
    () => companyRolesQuery.data ?? [],
    [companyRolesQuery.data],
  );

  function resetToFirstPage() {
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    resetToFirstPage();
  }

  function handleRoleChange(value: "ALL" | UserRole) {
    setRole(value);
    resetToFirstPage();
  }

  function handleStatusChange(value: "ALL" | UserStatus) {
    setStatus(value);
    resetToFirstPage();
  }

  function handleDepartmentChange(value: string) {
    setDepartmentId(value);
    resetToFirstPage();
  }

  function handleCreate() {
    setEditingUser(null);
    setIsFormOpen(true);
  }

  function handleEdit(user: ManagedUser) {
    setEditingUser(user);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingUser(null);
  }

  function handleTemporaryPassword(
    password: string,
    title: string,
    description: string,
  ) {
    setTemporaryPassword({ description, password, title });
  }

  function handleCloseTemporaryPassword() {
    setTemporaryPassword(null);
  }

  if (!canManage) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Organization" title="Users">
          Manage company users, roles, departments, and account access.
        </PageHeader>
        <Card>
          <CardContent className="p-8">
            <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
              <div>
                <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                  <ShieldAlert className="size-5" />
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  Company admin access required
                </p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Tenant user management is available to company admins only.
                  Super admins manage companies from the Platform section.
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
          <Button onClick={handleCreate}>
            <Plus className="size-4" />
            Create User
          </Button>
        }
        eyebrow="Organization"
        title="Users"
      >
        Create users, assign departments and roles, and manage account access.
      </PageHeader>

      <UserFilters
        departmentId={departmentId}
        departments={departments}
        isDisabled={usersQuery.isLoading}
        resultCount={userList.items.length}
        role={role}
        search={search}
        status={status}
        totalCount={userList.total}
        onDepartmentChange={handleDepartmentChange}
        onRoleChange={handleRoleChange}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
      />

      <UsersTable
        canManage={canManage}
        error={usersQuery.error}
        isError={usersQuery.isError}
        isLoading={usersQuery.isLoading}
        users={userList.items}
        onEdit={handleEdit}
        onResetPassword={setResetUser}
        onToggleStatus={setStatusUser}
      />

      {!usersQuery.isLoading &&
      !usersQuery.isError &&
      userList.total > 0 ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              disabled={currentPage <= 1}
              size="sm"
              variant="outline"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </Button>
            <Button
              disabled={currentPage >= totalPages}
              size="sm"
              variant="outline"
              onClick={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <UserFormDrawer
        companyRoles={companyRoles}
        departments={departments}
        isOpen={isFormOpen}
        user={editingUser}
        onClose={handleCloseForm}
        onTemporaryPassword={handleTemporaryPassword}
      />

      <DeactivateUserDialog
        user={statusUser}
        onClose={() => setStatusUser(null)}
      />

      <ResetPasswordDialog
        user={resetUser}
        onClose={() => setResetUser(null)}
        onTemporaryPassword={handleTemporaryPassword}
      />

      <TemporaryPasswordDialog
        description={temporaryPassword?.description ?? ""}
        password={temporaryPassword?.password ?? null}
        title={temporaryPassword?.title ?? ""}
        onClose={handleCloseTemporaryPassword}
      />
    </div>
  );
}
