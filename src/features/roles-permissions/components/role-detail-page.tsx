"use client";

import Link from "next/link";
import { ArrowLeft, Edit3, ShieldAlert, UserPlus } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button, getButtonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api/client";
import { ROUTES } from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";
import {
  useCompanyRole,
  useCompanyRoles,
  usePermissions,
} from "../hooks";
import {
  canManageRoles,
  getRoleStatusLabel,
  getRoleTypeLabel,
} from "../utils";
import { AssignRoleDialog } from "./assign-role-dialog";
import { PermissionMatrix } from "./permission-matrix";
import { RoleFormDrawer } from "./role-form-drawer";

type RoleDetailPageProps = {
  roleId: string;
};

export function RoleDetailPage({ roleId }: RoleDetailPageProps) {
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManageRoles(currentUser?.role);
  const roleQuery = useCompanyRole(roleId, canManage);
  const rolesQuery = useCompanyRoles(canManage);
  const permissionsQuery = usePermissions(canManage);
  const roles = useMemo(() => rolesQuery.data ?? [], [rolesQuery.data]);
  const permissions = useMemo(
    () => permissionsQuery.data ?? [],
    [permissionsQuery.data],
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const role = roleQuery.data;

  if (!canManage) {
    return (
      <BlockedState message="Role and permission management is available to company admins only." />
    );
  }

  if (roleQuery.isLoading || permissionsQuery.isLoading) {
    return <RoleDetailSkeleton />;
  }

  if (roleQuery.isError || !role) {
    return (
      <BlockedState
        message={getApiErrorMessage(roleQuery.error)}
        title="Role unavailable"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              className={getButtonClassName({ variant: "outline" })}
              href={ROUTES.rolesPermissions}
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
            <Button variant="outline" onClick={() => setIsAssignOpen(true)}>
              <UserPlus className="size-4" />
              Assign
            </Button>
            <Button variant="outline" onClick={() => setIsFormOpen(true)}>
              <Edit3 className="size-4" />
              Edit
            </Button>
          </div>
        }
        eyebrow="Company Role"
        title={role.name}
      >
        {role.description || "No description provided."}
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <RoleMetric
          label="Status"
          value={
            <Badge variant={role.isActive ? "success" : "warning"}>
              {getRoleStatusLabel(role)}
            </Badge>
          }
        />
        <RoleMetric
          label="Type"
          value={
            <Badge variant={role.isSystemTemplate ? "primary" : "default"}>
              {getRoleTypeLabel(role)}
            </Badge>
          }
        />
        <RoleMetric label="Template Key" value={role.templateKey || "Custom"} />
        <RoleMetric label="Permissions" value={role.permissions.length} />
      </div>

      <PermissionMatrix
        canManage={canManage}
        permissions={permissions}
        role={role}
      />

      <RoleFormDrawer
        isOpen={isFormOpen}
        permissions={permissions}
        role={role}
        onClose={() => setIsFormOpen(false)}
      />

      <AssignRoleDialog
        defaultRoleId={role.id}
        isOpen={isAssignOpen}
        roles={roles}
        onClose={() => setIsAssignOpen(false)}
      />
    </div>
  );
}

function RoleMetric({
  label,
  value,
}: {
  label: string;
  value: number | string | ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className="mt-2 text-lg font-semibold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}

function BlockedState({
  message,
  title = "Roles & Permissions unavailable",
}: {
  message: string;
  title?: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Organization" title={title}>
        {message}
      </PageHeader>
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                <ShieldAlert className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Access unavailable
              </p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {message}
              </p>
              <div className="mt-4 flex justify-center">
                <Link
                  className={getButtonClassName({ variant: "outline" })}
                  href={ROUTES.rolesPermissions}
                >
                  Back to roles
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RoleDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-4 w-32 rounded-md bg-muted" />
        <div className="h-8 w-72 rounded-md bg-muted" />
        <div className="h-4 w-full max-w-xl rounded-md bg-muted" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="h-4 w-24 rounded-md bg-muted" />
              <div className="mt-3 h-6 w-20 rounded-md bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="space-y-3 p-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-16 rounded-lg bg-muted" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
