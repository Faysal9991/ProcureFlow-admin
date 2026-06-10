"use client";

import { PageHeader } from "@/components/shared";
import { useAuthStore } from "@/store/auth-store";
import { getAccessibleReportConfigs } from "../utils";
import { PermissionState } from "./permission-state";
import { ReportCard } from "./report-card";

export function ReportsLandingPage() {
  const permissions = useAuthStore((state) => state.permissions);
  const user = useAuthStore((state) => state.user);
  const accessibleReports = getAccessibleReportConfigs(
    permissions,
    user?.role,
  );

  if (accessibleReports.length === 0) {
    return <PermissionState title="Reports unavailable" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Management" title="Reports">
        Choose a report to inspect live data, apply structured filters, and
        export CSV, XLSX, or PDF files.
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {accessibleReports.map((config) => (
          <ReportCard key={config.type} config={config} />
        ))}
      </div>
    </div>
  );
}
