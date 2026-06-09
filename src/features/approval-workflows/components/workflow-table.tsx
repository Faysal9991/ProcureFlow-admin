"use client";

import Link from "next/link";
import { Edit3, Eye, Inbox, ShieldAlert, Trash2 } from "lucide-react";
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
import type { Department } from "@/features/departments/types";
import { getApiErrorMessage } from "@/lib/api/client";
import type { ApprovalWorkflow } from "../types";
import {
  formatWorkflowDate,
  getWorkflowRuleLabel,
  getWorkflowStepSummary,
} from "../utils";

type WorkflowTableProps = {
  canManage: boolean;
  departments: Department[];
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  onDelete: (workflow: ApprovalWorkflow) => void;
  onEdit: (workflow: ApprovalWorkflow) => void;
  workflows: ApprovalWorkflow[];
};

export function WorkflowTable({
  canManage,
  departments,
  error,
  isError,
  isLoading,
  onDelete,
  onEdit,
  workflows,
}: WorkflowTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approval Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[1.4fr_1fr_120px_120px_120px]"
              >
                {Array.from({ length: 5 }).map((__, childIndex) => (
                  <div key={childIndex} className="h-4 rounded-md bg-muted" />
                ))}
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
                Approval workflows unavailable
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

  if (workflows.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Inbox className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                No approval workflows found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Company admins can create inactive workflows and configure steps
                before activation.
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
              <TableHead>Workflow</TableHead>
              <TableHead>Rule</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Steps</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workflows.map((workflow) => (
              <TableRow key={workflow.id}>
                <TableCell className="min-w-64">
                  <div className="font-medium text-foreground">
                    {workflow.name}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant={workflow.isActive ? "success" : "warning"}>
                      {workflow.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {workflow.isDefault ? (
                      <Badge variant="primary">Default</Badge>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="min-w-64 text-muted-foreground">
                  {getWorkflowRuleLabel(workflow, departments)}
                </TableCell>
                <TableCell>{workflow.priority}</TableCell>
                <TableCell className="min-w-28 text-muted-foreground">
                  {getWorkflowStepSummary(workflow.steps)}
                </TableCell>
                <TableCell className="min-w-32 text-muted-foreground">
                  {formatWorkflowDate(workflow.updatedAt)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link
                      className={getButtonClassName({
                        size: "sm",
                        variant: "outline",
                      })}
                      href={`/approval-workflows/${workflow.id}`}
                    >
                      <Eye className="size-4" />
                      View
                    </Link>
                    <Button
                      disabled={!canManage}
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(workflow)}
                    >
                      <Edit3 className="size-4" />
                      Edit
                    </Button>
                    <Button
                      disabled={!canManage || workflow.isActive}
                      size="sm"
                      variant="danger"
                      onClick={() => onDelete(workflow)}
                    >
                      <Trash2 className="size-4" />
                      Delete
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
