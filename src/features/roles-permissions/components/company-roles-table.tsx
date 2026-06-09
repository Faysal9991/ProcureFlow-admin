"use client";

import Link from "next/link";
import { Edit3, Eye, Inbox, ShieldAlert, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, getButtonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api/client";
import { ROUTES } from "@/lib/constants/routes";
import type { CompanyRole } from "../types";
import { getRoleStatusLabel, getRoleTypeLabel } from "../utils";

type CompanyRolesTableProps = {
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  roles: CompanyRole[];
  onAssign: (role: CompanyRole) => void;
  onEdit: (role: CompanyRole) => void;
};

export function CompanyRolesTable({
  error,
  isError,
  isLoading,
  roles,
  onAssign,
  onEdit,
}: CompanyRolesTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Company Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[1.2fr_1.5fr_120px_140px_120px_180px]"
              >
                <div className="h-4 rounded-md bg-muted" />
                <div className="h-4 rounded-md bg-muted" />
                <div className="h-4 rounded-md bg-muted" />
                <div className="h-4 rounded-md bg-muted" />
                <div className="h-4 rounded-md bg-muted" />
                <div className="h-4 rounded-md bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                <ShieldAlert className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Roles unavailable
              </p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {getApiErrorMessage(error)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (roles.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Inbox className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                No company roles found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a custom role or confirm default roles are seeded.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="min-w-52 font-medium">
                  <div>
                    <p>{role.name}</p>
                    {role.templateKey ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {role.templateKey}
                      </p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="min-w-72 text-muted-foreground">
                  {role.description || "No description"}
                </TableCell>
                <TableCell>
                  <Badge variant={role.isActive ? "success" : "warning"}>
                    {getRoleStatusLabel(role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={role.isSystemTemplate ? "primary" : "default"}>
                    {getRoleTypeLabel(role)}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {role.permissions.length}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Link
                      className={getButtonClassName({
                        size: "sm",
                        variant: "outline",
                      })}
                      href={`${ROUTES.rolesPermissions}/${role.id}`}
                    >
                      <Eye className="size-4" />
                      View
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(role)}
                    >
                      <Edit3 className="size-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAssign(role)}
                    >
                      <UserPlus className="size-4" />
                      Assign
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
