"use client";

import {
  Edit3,
  Inbox,
  KeyRound,
  Power,
  PowerOff,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api/client";
import type { ManagedUser } from "../types";
import {
  formatUserDate,
  getUserRoleLabel,
  getUserStatus,
  getUserStatusLabel,
} from "../utils";

type UsersTableProps = {
  canManage: boolean;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  onEdit: (user: ManagedUser) => void;
  onResetPassword: (user: ManagedUser) => void;
  onToggleStatus: (user: ManagedUser) => void;
  users: ManagedUser[];
};

export function UsersTable({
  canManage,
  error,
  isError,
  isLoading,
  onEdit,
  onResetPassword,
  onToggleStatus,
  users,
}: UsersTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[1.1fr_1.4fr_120px_130px_140px_100px]"
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
                Users unavailable
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

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Inbox className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                No users found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a user or adjust your filters.
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
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const status = getUserStatus(user.status);

              return (
                <TableRow key={user.uuid}>
                  <TableCell className="min-w-44 font-medium">
                    <div>
                      <p>{user.name}</p>
                      {user.mustChangePassword ? (
                        <p className="mt-1 text-xs text-warning">
                          Password change required
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="min-w-56 text-muted-foreground">
                    {user.email}
                  </TableCell>
                  <TableCell className="min-w-32 text-muted-foreground">
                    {user.phone || "Not set"}
                  </TableCell>
                  <TableCell className="min-w-36">
                    {getUserRoleLabel(user.role)}
                  </TableCell>
                  <TableCell className="min-w-40 text-muted-foreground">
                    {user.departmentName || "Not assigned"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status === "ACTIVE" ? "success" : "warning"}>
                      {getUserStatusLabel(status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="min-w-32 text-muted-foreground">
                    {formatUserDate(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        disabled={!canManage}
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(user)}
                      >
                        <Edit3 className="size-4" />
                        Edit
                      </Button>
                      <Button
                        disabled={!canManage}
                        size="sm"
                        variant={status === "ACTIVE" ? "danger" : "outline"}
                        onClick={() => onToggleStatus(user)}
                      >
                        {status === "ACTIVE" ? (
                          <PowerOff className="size-4" />
                        ) : (
                          <Power className="size-4" />
                        )}
                        {status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        disabled={!canManage}
                        size="sm"
                        variant="outline"
                        onClick={() => onResetPassword(user)}
                      >
                        <KeyRound className="size-4" />
                        Reset
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
