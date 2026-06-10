"use client";

import Link from "next/link";
import { Plus, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button, getButtonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";
import { usePlatformCompanies, usePlatformPlans } from "../hooks";
import type {
  PlatformCompanyListFilters,
  PlatformCompanyStatus,
} from "../types";
import {
  canManagePlatformCompanies,
  PLATFORM_COMPANY_PAGE_SIZE,
} from "../utils";
import { PlatformCompaniesTable } from "./platform-companies-table";
import { PlatformCompanyFilters } from "./platform-company-filters";

export function PlatformCompaniesPage() {
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManagePlatformCompanies(currentUser?.role);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | PlatformCompanyStatus>("ALL");
  const [planId, setPlanId] = useState("");
  const [page, setPage] = useState(1);
  const queryFilters = useMemo<PlatformCompanyListFilters>(
    () => ({
      limit: PLATFORM_COMPANY_PAGE_SIZE,
      page,
      planId: planId || undefined,
      search: search.trim() || undefined,
      status: status === "ALL" ? undefined : status,
    }),
    [page, planId, search, status],
  );
  const companiesQuery = usePlatformCompanies(queryFilters, canManage);
  const plansQuery = usePlatformPlans(canManage);
  const companyList = companiesQuery.data ?? {
    items: [],
    limit: PLATFORM_COMPANY_PAGE_SIZE,
    page,
    total: 0,
  };
  const totalPages = Math.max(
    1,
    Math.ceil(companyList.total / companyList.limit),
  );
  const currentPage = companyList.page || page;

  function resetToFirstPage() {
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    resetToFirstPage();
  }

  function handleStatusChange(value: "ALL" | PlatformCompanyStatus) {
    setStatus(value);
    resetToFirstPage();
  }

  function handlePlanChange(value: string) {
    setPlanId(value);
    resetToFirstPage();
  }

  if (!canManage) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Platform" title="Companies">
          Manage tenant companies, first admins, usage, and lifecycle status.
        </PageHeader>
        <PermissionState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Link
            className={getButtonClassName()}
            href={ROUTES.platformCompanyNew}
          >
            <Plus className="size-4" />
            Create Company
          </Link>
        }
        eyebrow="Platform"
        title="Companies"
      >
        Manage tenant companies, first admins, usage, and lifecycle status.
      </PageHeader>

      <PlatformCompanyFilters
        isDisabled={companiesQuery.isLoading}
        planId={planId}
        plans={plansQuery.data ?? []}
        resultCount={companyList.items.length}
        search={search}
        status={status}
        totalCount={companyList.total}
        onPlanChange={handlePlanChange}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
      />

      <PlatformCompaniesTable
        companies={companyList.items}
        error={companiesQuery.error}
        isError={companiesQuery.isError}
        isLoading={companiesQuery.isLoading}
      />

      {!companiesQuery.isLoading &&
      !companiesQuery.isError &&
      companyList.total > 0 ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              disabled={currentPage <= 1}
              size="sm"
              variant="outline"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </Button>
            <Button
              disabled={currentPage >= totalPages}
              size="sm"
              variant="outline"
              onClick={() =>
                setPage((value) => Math.min(totalPages, value + 1))
              }
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PermissionState() {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
          <div>
            <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
              <ShieldAlert className="size-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              Super admin access required
            </p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Platform company management is available only to super admins.
              Tenant users manage their own company from tenant settings.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
