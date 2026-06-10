"use client";

import Link from "next/link";
import { Plus, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button, getButtonClassName } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  usePlatformCompanies,
  usePlatformCompany,
  usePlatformCompanySubscription,
  usePlatformPlans,
} from "@/features/platform/companies/hooks";
import type {
  PlatformCompany,
  PlatformCompanyListFilters,
  PlatformCompanyStatus,
} from "@/features/platform/companies/types";
import {
  canManagePlatformCompanies,
  formatLimit,
  formatPlatformDate,
  getCompanyStatusLabel,
  getCompanyStatusVariant,
} from "@/features/platform/companies/utils";
import {
  formatPlatformMoney,
} from "@/features/platform/plans/utils";
import { platformCompanyDetailPath } from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";
import { AssignPlanDrawer } from "./assign-plan-drawer";
import { PlatformSubscriptionFilters } from "./platform-subscription-filters";
import { PlatformSubscriptionsTable } from "./platform-subscriptions-table";
import {
  getSubscriptionStatusVariant,
  PLATFORM_SUBSCRIPTION_COMPANY_PAGE_SIZE,
} from "../utils";

type PlatformSubscriptionsPageProps = {
  focusedCompanyId?: string;
};

export function PlatformSubscriptionsPage({
  focusedCompanyId,
}: PlatformSubscriptionsPageProps) {
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManagePlatformCompanies(currentUser?.role);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | PlatformCompanyStatus>("ALL");
  const [planId, setPlanId] = useState("");
  const [page, setPage] = useState(1);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignCompanyId, setAssignCompanyId] = useState<string | undefined>(
    focusedCompanyId,
  );
  const queryFilters = useMemo<PlatformCompanyListFilters>(
    () => ({
      limit: PLATFORM_SUBSCRIPTION_COMPANY_PAGE_SIZE,
      page,
      planId: planId || undefined,
      search: search.trim() || undefined,
      status: status === "ALL" ? undefined : status,
    }),
    [page, planId, search, status],
  );
  const companiesQuery = usePlatformCompanies(queryFilters, canManage);
  const plansQuery = usePlatformPlans(canManage);
  const focusedCompanyQuery = usePlatformCompany(
    focusedCompanyId ?? "",
    canManage && !!focusedCompanyId,
  );
  const focusedSubscriptionQuery = usePlatformCompanySubscription(
    focusedCompanyId ?? "",
    canManage && !!focusedCompanyId,
  );
  const companyList = companiesQuery.data ?? {
    items: [],
    limit: PLATFORM_SUBSCRIPTION_COMPANY_PAGE_SIZE,
    page,
    total: 0,
  };
  const totalPages = Math.max(
    1,
    Math.ceil(companyList.total / companyList.limit),
  );
  const currentPage = companyList.page || page;
  const drawerCompanies = useMemo(
    () => mergeCompanies(companyList.items, focusedCompanyQuery.data),
    [companyList.items, focusedCompanyQuery.data],
  );

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

  function handleOpenAssign(companyId?: string) {
    setAssignCompanyId(companyId);
    setIsAssignOpen(true);
  }

  function handleCloseAssign() {
    setIsAssignOpen(false);
    setAssignCompanyId(focusedCompanyId);
  }

  if (!canManage) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Platform" title="Subscriptions">
          Manage tenant subscriptions and plan assignment.
        </PageHeader>
        <PermissionState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Button onClick={() => handleOpenAssign(focusedCompanyId)}>
            <Plus className="size-4" />
            Assign Plan
          </Button>
        }
        eyebrow="Platform"
        title="Subscriptions"
      >
        View company subscriptions and assign plans to tenant companies.
      </PageHeader>

      {focusedCompanyId ? (
        <FocusedCompanySummary
          company={focusedCompanyQuery.data}
          error={focusedCompanyQuery.error ?? focusedSubscriptionQuery.error}
          isError={focusedCompanyQuery.isError}
          isLoading={focusedCompanyQuery.isLoading}
          subscription={focusedSubscriptionQuery.data}
          subscriptionError={focusedSubscriptionQuery.isError}
          onAssign={() => handleOpenAssign(focusedCompanyId)}
        />
      ) : null}

      <PlatformSubscriptionFilters
        isDisabled={companiesQuery.isLoading}
        planId={planId}
        plans={plansQuery.data ?? []}
        search={search}
        status={status}
        onPlanChange={handlePlanChange}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
      />

      <PlatformSubscriptionsTable
        companies={companyList.items}
        error={companiesQuery.error}
        isError={companiesQuery.isError}
        isLoading={companiesQuery.isLoading}
        onAssignPlan={handleOpenAssign}
      />

      {!companiesQuery.isLoading &&
      !companiesQuery.isError &&
      companyList.total > 0 ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}. Subscription lookups are limited
            to {PLATFORM_SUBSCRIPTION_COMPANY_PAGE_SIZE} visible companies.
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

      <AssignPlanDrawer
        companies={drawerCompanies}
        initialCompanyId={assignCompanyId}
        isOpen={isAssignOpen}
        plans={plansQuery.data ?? []}
        onClose={handleCloseAssign}
      />
    </div>
  );
}

function FocusedCompanySummary({
  company,
  error,
  isError,
  isLoading,
  onAssign,
  subscription,
  subscriptionError,
}: {
  company?: PlatformCompany;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  onAssign: () => void;
  subscription?: ReturnType<typeof usePlatformCompanySubscription>["data"];
  subscriptionError: boolean;
}) {
  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-lg bg-muted" />;
  }

  if (isError || !company) {
    return (
      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-medium text-foreground">
            Focused company unavailable
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Company could not be loaded."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{company.name}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Focused company subscription summary
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className={getButtonClassName({ variant: "outline" })}
              href={platformCompanyDetailPath(company.id)}
            >
              Company Detail
            </Link>
            <Button onClick={onAssign}>Assign Plan</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-4">
        <SummaryItem label="Company Status">
          <Badge variant={getCompanyStatusVariant(company.status)}>
            {getCompanyStatusLabel(company.status)}
          </Badge>
        </SummaryItem>
        <SummaryItem label="Current Plan">
          {subscription ? subscription.plan.name : "No active subscription"}
        </SummaryItem>
        <SummaryItem label="Subscription Status">
          {subscription ? (
            <Badge variant={getSubscriptionStatusVariant(subscription.status)}>
              {subscription.status}
            </Badge>
          ) : subscriptionError ? (
            "Not assigned"
          ) : (
            "Loading"
          )}
        </SummaryItem>
        <SummaryItem label="Price">
          {subscription ? formatPlatformMoney(subscription.plan.price) : "Not set"}
        </SummaryItem>
        <SummaryItem label="Period">
          {subscription
            ? `${formatPlatformDate(subscription.startDate)} to ${formatPlatformDate(subscription.endDate)}`
            : "Not set"}
        </SummaryItem>
        <SummaryItem label="User Limit">
          {subscription ? formatLimit(subscription.plan.maxUsers) : "Not set"}
        </SummaryItem>
        <SummaryItem label="Department Limit">
          {subscription
            ? formatLimit(subscription.plan.maxDepartments)
            : "Not set"}
        </SummaryItem>
        <SummaryItem label="Request Limit">
          {subscription
            ? formatLimit(subscription.plan.maxRequestsPerMonth)
            : "Not set"}
        </SummaryItem>
      </CardContent>
    </Card>
  );
}

function SummaryItem({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 text-sm font-semibold text-foreground">
        {children}
      </div>
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
              Platform subscription management is available only to super
              admins.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function mergeCompanies(
  companies: PlatformCompany[],
  focusedCompany?: PlatformCompany,
) {
  const byId = new Map<string, PlatformCompany>();
  companies.forEach((company) => byId.set(company.id, company));
  if (focusedCompany) {
    byId.set(focusedCompany.id, focusedCompany);
  }
  return Array.from(byId.values());
}
