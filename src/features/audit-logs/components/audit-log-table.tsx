"use client";

import { Eye, FileWarning } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import type { AuditLog } from "../types";
import {
  formatAuditDate,
  formatAuditLabel,
  getAuditActionVariant,
} from "../utils";

type AuditLogTableProps = {
  error: unknown;
  isError: boolean;
  isLoading: boolean;
  logs: AuditLog[];
  onView: (log: AuditLog) => void;
};

export function AuditLogTable({
  error,
  isError,
  isLoading,
  logs,
  onView,
}: AuditLogTableProps) {
  if (isLoading) {
    return <AuditLogTableSkeleton />;
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                <FileWarning className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Audit logs unavailable
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

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <p className="text-sm font-medium text-foreground">
                No audit logs found
              </p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Adjust filters or try a wider date range.
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
              <TableHead>Action</TableHead>
              <TableHead>Entity Type</TableHead>
              <TableHead>Entity ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <Badge variant={getAuditActionVariant(log.action)}>
                    {formatAuditLabel(log.action)}
                  </Badge>
                </TableCell>
                <TableCell>{formatAuditLabel(log.entityType)}</TableCell>
                <TableCell>
                  <span className="block max-w-44 truncate text-sm">
                    {log.entityId || "Not set"}
                  </span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">
                      {log.user?.name || log.user?.email || "System"}
                    </p>
                    {log.user?.role ? (
                      <p className="text-xs text-muted-foreground">
                        {formatAuditLabel(log.user.role)}
                      </p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>{log.ipAddress || "Not set"}</TableCell>
                <TableCell>{formatAuditDate(log.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    aria-label="View audit log"
                    size="sm"
                    variant="outline"
                    onClick={() => onView(log)}
                  >
                    <Eye className="size-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function AuditLogTableSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {[
                "Action",
                "Entity Type",
                "Entity ID",
                "User",
                "IP Address",
                "Created At",
                "Actions",
              ].map((heading) => (
                <TableHead
                  key={heading}
                  className={cn(heading === "Actions" && "text-right")}
                >
                  {heading}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: 7 }).map((__, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
