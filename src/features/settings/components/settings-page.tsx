"use client";

import { RefreshCw, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApprovalWorkflows } from "@/features/approval-workflows/hooks";
import { useAuthStore } from "@/store/auth-store";
import { useCompanySettings } from "../hooks";
import { canManageSettings, canViewSettings } from "../utils";
import { CompanyProfileForm } from "./company-profile-form";
import { ProcurementSettingsForm } from "./procurement-settings-form";
import { SecuritySettingsForm } from "./security-settings-form";
import { SettingsTabs, type SettingsTab } from "./settings-tabs";

export function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const canView = canViewSettings(user?.role);
  const canManage = canManageSettings(user?.role);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const settingsQuery = useCompanySettings(canView);
  const workflowsQuery = useApprovalWorkflows(canView);
  const workflows = useMemo(
    () => workflowsQuery.data ?? [],
    [workflowsQuery.data],
  );

  if (!canView) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Management" title="Company Settings">
          Configure tenant profile, procurement defaults, workflow fallback, and
          security policy.
        </PageHeader>
        <PermissionState />
      </div>
    );
  }

  if (settingsQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Management" title="Company Settings">
          Loading company configuration.
        </PageHeader>
        <SettingsSkeleton />
      </div>
    );
  }

  if (settingsQuery.isError || !settingsQuery.data) {
    return (
      <div className="space-y-6">
        <PageHeader
          actions={
            <Button
              icon={<RefreshCw className="size-4" />}
              variant="outline"
              onClick={() => settingsQuery.refetch()}
            >
              Retry
            </Button>
          }
          eyebrow="Management"
          title="Company Settings"
        >
          Configure tenant profile, procurement defaults, workflow fallback, and
          security policy.
        </PageHeader>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm font-medium text-foreground">
              Settings could not be loaded
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Check backend availability or your account permissions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const settings = settingsQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Management" title="Company Settings">
        Configure tenant profile, procurement defaults, workflow fallback, and
        security policy.
      </PageHeader>

      {!canManage ? (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Settings are read-only for your role. Company admins can update
            tenant configuration.
          </CardContent>
        </Card>
      ) : null}

      <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "profile" ? (
        <CompanyProfileForm isReadOnly={!canManage} settings={settings} />
      ) : null}

      {activeTab === "procurement" ? (
        <ProcurementSettingsForm
          isReadOnly={!canManage}
          settings={settings}
          workflows={workflows}
        />
      ) : null}

      {activeTab === "security" ? (
        <SecuritySettingsForm isReadOnly={!canManage} settings={settings} />
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
              Company settings unavailable
            </p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Tenant company settings are available to company admins,
              procurement, and finance users. Super admins use platform
              company management.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-20 animate-pulse rounded-lg border border-border bg-muted"
          />
        ))}
      </div>
      <Card>
        <CardContent className="grid gap-4 p-5 lg:grid-cols-2">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-10 animate-pulse rounded-lg bg-muted" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
