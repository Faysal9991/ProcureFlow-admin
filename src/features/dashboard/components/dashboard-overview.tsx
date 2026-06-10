"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import {
  useDashboardSummary,
  useDepartmentSpend,
  useOverdueInvoices,
  useRequestStatusChart,
  useSpendSummary,
  useTopVendors,
} from "../hooks";
import type { DashboardFilterPreset } from "../types";
import {
  buildFilters,
  canUseOverdueInvoices,
  canUseSpendSections,
  getPresetDateRange,
} from "../utils";
import { DashboardFilters } from "./dashboard-filters";
import { DepartmentSpend } from "./department-spend";
import { OverdueInvoices } from "./overdue-invoices";
import { ProcessFlowSection } from "./process-flow-section";
import { RequestStatusChart } from "./request-status-chart";
import { SpendSummary } from "./spend-summary";
import { SummaryCards } from "./summary-card";
import { TopVendors } from "./top-vendors";
import { ROUTES } from "@/lib/constants/routes";

export function DashboardOverview() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const initialRange = useMemo(() => getPresetDateRange("thisMonth"), []);
  const [preset, setPreset] = useState<DashboardFilterPreset>("thisMonth");
  const [dateFrom, setDateFrom] = useState(initialRange.dateFrom);
  const [dateTo, setDateTo] = useState(initialRange.dateTo);
  const [departmentId, setDepartmentId] = useState("");
  const role = user?.role;
  const isSuperAdmin = role === "SUPER_ADMIN";
  const canLoadTenantDashboard = !!role && !isSuperAdmin;
  const canLoadSpendSections = canUseSpendSections(role);
  const canLoadOverdueInvoices = canUseOverdueInvoices(role);

  useEffect(() => {
    if (isSuperAdmin) {
      router.replace(ROUTES.platformCompanies);
    }
  }, [isSuperAdmin, router]);

  const filters = useMemo(
    () => buildFilters({ dateFrom, dateTo, departmentId, preset }),
    [dateFrom, dateTo, departmentId, preset],
  );

  const summaryQuery = useDashboardSummary(filters, canLoadTenantDashboard);
  const requestStatusQuery = useRequestStatusChart(
    filters,
    canLoadTenantDashboard,
  );
  const spendSummaryQuery = useSpendSummary(filters, canLoadSpendSections);
  const departmentSpendQuery = useDepartmentSpend(filters, canLoadSpendSections);
  const topVendorsQuery = useTopVendors(filters, canLoadSpendSections);
  const overdueInvoicesQuery = useOverdueInvoices(
    filters,
    canLoadOverdueInvoices,
  );

  function handlePresetChange(nextPreset: DashboardFilterPreset) {
    setPreset(nextPreset);

    if (nextPreset !== "custom") {
      const nextRange = getPresetDateRange(nextPreset);
      setDateFrom(nextRange.dateFrom);
      setDateTo(nextRange.dateTo);
    }
  }

  if (!user || isSuperAdmin) {
    return (
      <div className="flex min-h-[420px] items-center justify-center text-muted-foreground">
        <div className="flex items-center gap-3 text-sm">
          <Loader2 className="size-5 animate-spin text-primary" />
          Loading dashboard
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          Admin Dashboard
        </p>
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-foreground">
            Procurement Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Role-based procurement, spend, vendor, and invoice visibility.
          </p>
        </div>
      </div>

      <DashboardFilters
        dateFrom={dateFrom}
        dateTo={dateTo}
        departmentId={departmentId}
        preset={preset}
        role={role}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onDepartmentIdChange={setDepartmentId}
        onPresetChange={handlePresetChange}
      />

      <ProcessFlowSection />

      <SummaryCards
        error={summaryQuery.error}
        fallbackRole={role}
        isError={summaryQuery.isError}
        isLoading={summaryQuery.isLoading}
        summary={summaryQuery.data}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <RequestStatusChart
          data={requestStatusQuery.data}
          error={requestStatusQuery.error}
          isError={requestStatusQuery.isError}
          isLoading={requestStatusQuery.isLoading}
        />

        <SpendSummary
          data={spendSummaryQuery.data}
          error={spendSummaryQuery.error}
          isError={spendSummaryQuery.isError}
          isLoading={spendSummaryQuery.isLoading}
          isUnavailable={!canLoadSpendSections}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DepartmentSpend
          data={departmentSpendQuery.data}
          error={departmentSpendQuery.error}
          isError={departmentSpendQuery.isError}
          isLoading={departmentSpendQuery.isLoading}
          isUnavailable={!canLoadSpendSections}
        />

        <TopVendors
          data={topVendorsQuery.data}
          error={topVendorsQuery.error}
          isError={topVendorsQuery.isError}
          isLoading={topVendorsQuery.isLoading}
          isUnavailable={!canLoadSpendSections}
        />
      </div>

      <OverdueInvoices
        data={overdueInvoicesQuery.data}
        error={overdueInvoicesQuery.error}
        isError={overdueInvoicesQuery.isError}
        isLoading={overdueInvoicesQuery.isLoading}
        isUnavailable={!canLoadOverdueInvoices}
      />
    </div>
  );
}
