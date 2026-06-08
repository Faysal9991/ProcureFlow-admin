"use client";

import { Edit3, Inbox, ShieldAlert, Trash2 } from "lucide-react";
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
import type { Department } from "../types";
import { getDepartmentStatus, getDepartmentStatusLabel } from "../utils";

type DepartmentsTableProps = {
  canWrite: boolean;
  departments: Department[];
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  onDelete: (department: Department) => void;
  onEdit: (department: Department) => void;
};

export function DepartmentsTable({
  canWrite,
  departments,
  error,
  isError,
  isLoading,
  onDelete,
  onEdit,
}: DepartmentsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[1.2fr_1.6fr_120px_120px]"
              >
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
                Departments unavailable
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

  if (departments.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Inbox className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                No departments found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a department or adjust your filters.
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
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((department) => {
              const status = getDepartmentStatus(department.status);

              return (
                <TableRow key={department.uuid}>
                  <TableCell className="font-medium">
                    {department.name}
                  </TableCell>
                  <TableCell className="max-w-[360px] text-muted-foreground">
                    <span className="line-clamp-2">
                      {department.description || "No description"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status === "ACTIVE" ? "success" : "warning"}>
                      {getDepartmentStatusLabel(status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        disabled={!canWrite}
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(department)}
                      >
                        <Edit3 className="size-4" />
                        Edit
                      </Button>
                      <Button
                        disabled={!canWrite}
                        size="sm"
                        variant="danger"
                        onClick={() => onDelete(department)}
                      >
                        <Trash2 className="size-4" />
                        Delete
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
