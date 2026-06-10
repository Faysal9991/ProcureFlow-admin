"use client";

import Link from "next/link";
import { ArrowRight, Inbox, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getButtonClassName } from "@/components/ui/button";
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
import { platformCompanyDetailPath } from "@/lib/constants/routes";
import type { PlatformCompany } from "../types";
import {
  formatPlatformDate,
  getCompanyStatusLabel,
  getCompanyStatusVariant,
} from "../utils";

type PlatformCompaniesTableProps = {
  companies: PlatformCompany[];
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
};

export function PlatformCompaniesTable({
  companies,
  error,
  isError,
  isLoading,
}: PlatformCompaniesTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[1.4fr_1.2fr_110px_1fr_120px_90px]"
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
                Companies unavailable
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

  if (companies.length === 0) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Inbox className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                No companies found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a company or adjust your filters.
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
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="min-w-56">
                  <div>
                    <p className="font-medium text-foreground">{company.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {company.phone || "No phone"}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="min-w-56 text-muted-foreground">
                  {company.email}
                </TableCell>
                <TableCell>
                  <Badge variant={getCompanyStatusVariant(company.status)}>
                    {getCompanyStatusLabel(company.status)}
                  </Badge>
                </TableCell>
                <TableCell className="min-w-52 text-sm text-muted-foreground">
                  {company.usage ? (
                    <span>
                      {company.usage.userCount} users ·{" "}
                      {company.usage.departmentCount} departments
                    </span>
                  ) : (
                    "Usage not available"
                  )}
                </TableCell>
                <TableCell className="min-w-36 text-muted-foreground">
                  {formatPlatformDate(company.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <Link
                      className={getButtonClassName({
                        size: "sm",
                        variant: "outline",
                      })}
                      href={platformCompanyDetailPath(company.id)}
                    >
                      View
                      <ArrowRight className="size-4" />
                    </Link>
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
