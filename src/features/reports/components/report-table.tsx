"use client";

import { FileWarning } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { formatEnumLabel } from "../config";
import type { ReportConfig, ReportRow } from "../types";
import {
  formatReportCurrency,
  formatReportDate,
  getReportStatusVariant,
} from "../utils";

type ReportTableProps = {
  config: ReportConfig;
  error: unknown;
  isError: boolean;
  isLoading: boolean;
  rows: ReportRow[];
};

export function ReportTable({
  config,
  error,
  isError,
  isLoading,
  rows,
}: ReportTableProps) {
  if (isLoading) {
    return <ReportTableSkeleton config={config} />;
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
                Report unavailable
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

  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <p className="text-sm font-medium text-foreground">
                No report rows found
              </p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Adjust the filters or try a wider date range.
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
              {config.columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(column.align === "right" && "text-right")}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={config.rowId(row)}>
                {config.columns.map((column) => (
                  <TableCell
                    key={column.id}
                    className={cn(column.align === "right" && "text-right")}
                  >
                    {formatCellValue(column.kind, column.value(row))}
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

function ReportTableSkeleton({ config }: { config: ReportConfig }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {config.columns.map((column) => (
                <TableHead key={column.id}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {config.columns.map((column) => (
                  <TableCell key={column.id}>
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

function formatCellValue(
  kind: ReportConfig["columns"][number]["kind"],
  value: number | string | null | undefined,
) {
  if (kind === "currency") {
    return formatReportCurrency(value);
  }

  if (kind === "date") {
    return formatReportDate(value);
  }

  if (kind === "status") {
    const label = formatEnumLabel(String(value ?? ""));

    return (
      <Badge variant={getReportStatusVariant(String(value ?? ""))}>
        {label || "Unknown"}
      </Badge>
    );
  }

  return String(value || "Not set");
}
