"use client";

import { Building2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
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
import type { DepartmentSpendItem } from "../types";
import { formatCurrency } from "../utils";
import { getSectionErrorMessage, SectionState } from "./section-state";

type DepartmentSpendProps = {
  data?: DepartmentSpendItem[];
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  isUnavailable?: boolean;
};

export function DepartmentSpend({
  data,
  error,
  isError,
  isLoading,
  isUnavailable,
}: DepartmentSpendProps) {
  const max = Math.max(...(data ?? []).map((item) => item.totalAmount), 1);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Department Spend</CardTitle>
            <CardDescription>Spend grouped by department.</CardDescription>
          </div>
          <Building2 className="size-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        {isUnavailable ? (
          <SectionState
            message="Department spend is not available for this role."
            title="Not available for this role"
            type="unavailable"
          />
        ) : isLoading ? (
          <SectionState title="Loading department spend" type="loading" />
        ) : isError ? (
          <SectionState
            message={getSectionErrorMessage(error)}
            title="Department spend unavailable"
            type="error"
          />
        ) : !data?.length ? (
          <SectionState
            message="No department spend was found for this filter range."
            title="No department spend"
            type="empty"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Spend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => {
                const percent = Math.round((item.totalAmount / max) * 100);

                return (
                  <TableRow key={item.departmentId}>
                    <TableCell>
                      <div className="font-medium text-foreground">
                        {item.departmentName}
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{
                            width: `${
                              item.totalAmount > 0 ? Math.max(percent, 2) : 0
                            }%`,
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-medium">
                      {formatCurrency(item.totalAmount)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
