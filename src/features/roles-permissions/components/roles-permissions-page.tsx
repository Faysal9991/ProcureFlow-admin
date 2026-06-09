"use client";

import { Plus, ShieldAlert, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";
import { useCompanyRoles, usePermissions } from "../hooks";
import type { CompanyRole } from "../types";
import { canManageRoles } from "../utils";
import { AssignRoleDialog } from "./assign-role-dialog";
import { CompanyRolesTable } from "./company-roles-table";
import { RoleFormDrawer } from "./role-form-drawer";

export function RolesPermissionsPage() {
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManageRoles(currentUser?.role);
  const rolesQuery = useCompanyRoles(canManage);
  const permissionsQuery = usePermissions(canManage);
  const roles = useMemo(() => rolesQuery.data ?? [], [rolesQuery.data]);
  const permissions = useMemo(
    () => permissionsQuery.data ?? [],
    [permissionsQuery.data],
  );
  const [editingRole, setEditingRole] = useState<CompanyRole | null>(null);
  const [assigningRole, setAssigningRole] = useState<CompanyRole | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  function handleCreate() {
    setEditingRole(null);
    setIsFormOpen(true);
  }

  function handleEdit(role: CompanyRole) {
    setEditingRole(role);
    setIsFormOpen(true);
  }

  function handleAssign(role?: CompanyRole) {
    setAssigningRole(role ?? null);
    setIsAssignOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingRole(null);
  }

  if (!canManage) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Organization" title="Roles & Permissions">
          Manage company roles, permission matrices, and user role assignments.
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
                  Role and permission management is available to company admins
                  only. Super admins manage platform access separately.
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
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => handleAssign()}>
              <UserPlus className="size-4" />
              Assign Role
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="size-4" />
              Create Role
            </Button>
          </div>
        }
        eyebrow="Organization"
        title="Roles & Permissions"
      >
        Manage company roles, permission matrices, and user role assignments.
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Company Roles" value={roles.length} />
        <Metric
          label="System Templates"
          value={roles.filter((role) => role.isSystemTemplate).length}
        />
        <Metric label="Permission Keys" value={permissions.length} />
      </div>

      <CompanyRolesTable
        error={rolesQuery.error}
        isError={rolesQuery.isError}
        isLoading={rolesQuery.isLoading}
        roles={roles}
        onAssign={handleAssign}
        onEdit={handleEdit}
      />

      <RoleFormDrawer
        isOpen={isFormOpen}
        permissions={permissions}
        role={editingRole}
        onClose={handleCloseForm}
      />

      <AssignRoleDialog
        defaultRoleId={assigningRole?.id}
        isOpen={isAssignOpen}
        roles={roles}
        onClose={() => {
          setIsAssignOpen(false);
          setAssigningRole(null);
        }}
      />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
