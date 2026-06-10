"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Edit3,
  ExternalLink,
  Power,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button, getButtonClassName } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  ROUTES,
  platformCompanySubscriptionPath,
} from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";
import {
  usePlatformCompany,
  usePlatformCompanySubscription,
} from "../hooks";
import type { PlatformCompanyAction } from "../types";
import {
  canManagePlatformCompanies,
  formatLimit,
  formatPlatformCurrency,
  formatPlatformDate,
  getCompanyStatus,
  getCompanyStatusLabel,
  getCompanyStatusVariant,
} from "../utils";
import { PlatformCompanyEditDrawer } from "./platform-company-edit-drawer";
import { PlatformCompanyStatusDialog } from "./platform-company-status-dialog";

type PlatformCompanyDetailPageProps = {
  companyId: string;
};

export function PlatformCompanyDetailPage({
  companyId,
}: PlatformCompanyDetailPageProps) {
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManagePlatformCompanies(currentUser?.role);
  const companyQuery = usePlatformCompany(companyId, canManage);
  const subscriptionQuery = usePlatformCompanySubscription(companyId, canManage);
  const company = companyQuery.data;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAction, setSelectedAction] =
    useState<PlatformCompanyAction | null>(null);

  if (!canManage) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Platform" title="Company Detail">
          Review tenant company profile, subscription, and usage.
        </PageHeader>
        <PermissionState />
      </div>
    );
  }

  if (companyQuery.isLoading) {
    return <DetailSkeleton />;
  }

  if (companyQuery.isError || !company) {
    return (
      <div className="space-y-6">
        <PageHeader
          actions={
            <Link
              className={getButtonClassName({ variant: "outline" })}
              href={ROUTES.platformCompanies}
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
          }
          eyebrow="Platform"
          title="Company unavailable"
        >
          {getApiErrorMessage(companyQuery.error)}
        </PageHeader>
        <ErrorState message={getApiErrorMessage(companyQuery.error)} />
      </div>
    );
  }

  const companyStatus = getCompanyStatus(company.status);
  const nextAction: PlatformCompanyAction =
    companyStatus === "ACTIVE" ? "suspend" : "activate";

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Link
              className={getButtonClassName({ variant: "outline" })}
              href={ROUTES.platformCompanies}
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
            <Button variant="outline" onClick={() => setIsEditOpen(true)}>
              <Edit3 className="size-4" />
              Edit Profile
            </Button>
            <Button
              variant={nextAction === "suspend" ? "danger" : "primary"}
              onClick={() => setSelectedAction(nextAction)}
            >
              <Power className="size-4" />
              {nextAction === "suspend" ? "Suspend" : "Activate"}
            </Button>
          </>
        }
        eyebrow="Platform Company"
        title={company.name}
      >
        {company.email}
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-4">
        <SummaryTile label="Status">
          <Badge variant={getCompanyStatusVariant(company.status)}>
            {getCompanyStatusLabel(company.status)}
          </Badge>
        </SummaryTile>
        <SummaryTile label="Users">
          {company.usage?.userCount.toLocaleString() ?? "Not available"}
        </SummaryTile>
        <SummaryTile label="Departments">
          {company.usage?.departmentCount.toLocaleString() ?? "Not available"}
        </SummaryTile>
        <SummaryTile label="Monthly Requests">
          {company.usage?.requestCountMonth.toLocaleString() ?? "Not available"}
        </SummaryTile>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Company Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetadataRow label="Name">{company.name}</MetadataRow>
            <MetadataRow label="Email">{company.email}</MetadataRow>
            <MetadataRow label="Phone">
              {company.phone || "Not set"}
            </MetadataRow>
            <MetadataRow label="Address">
              {company.address || "Not set"}
            </MetadataRow>
            <MetadataRow label="RFQ before PO">
              {company.requireRfqBeforePo ? "Required" : "Not required"}
            </MetadataRow>
            <MetadataRow label="Created">
              {formatPlatformDate(company.createdAt)}
            </MetadataRow>
            <MetadataRow label="Updated">
              {formatPlatformDate(company.updatedAt)}
            </MetadataRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscriptionQuery.isLoading ? (
              <div className="space-y-3">
                <div className="h-4 animate-pulse rounded-md bg-muted" />
                <div className="h-4 animate-pulse rounded-md bg-muted" />
                <div className="h-4 animate-pulse rounded-md bg-muted" />
              </div>
            ) : null}

            {subscriptionQuery.isError ? (
              <div className="rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-warning">
                Subscription summary is not available for this company.
              </div>
            ) : null}

            {subscriptionQuery.data ? (
              <>
                <MetadataRow label="Plan">
                  {subscriptionQuery.data.plan.name}
                </MetadataRow>
                <MetadataRow label="Status">
                  {subscriptionQuery.data.status}
                </MetadataRow>
                <MetadataRow label="Price">
                  {formatPlatformCurrency(subscriptionQuery.data.plan.price)}
                </MetadataRow>
                <MetadataRow label="Start Date">
                  {formatPlatformDate(subscriptionQuery.data.startDate)}
                </MetadataRow>
                <MetadataRow label="End Date">
                  {formatPlatformDate(subscriptionQuery.data.endDate)}
                </MetadataRow>
                <MetadataRow label="Limits">
                  {formatLimit(subscriptionQuery.data.plan.maxUsers)} users ·{" "}
                  {formatLimit(
                    subscriptionQuery.data.plan.maxRequestsPerMonth,
                  )}{" "}
                  requests/month
                </MetadataRow>
              </>
            ) : null}

            <div className="rounded-lg border border-border bg-background p-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    View Subscription
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Open this company in platform subscription management.
                  </p>
                </div>
                <Link
                  className={getButtonClassName({ variant: "outline" })}
                  href={platformCompanySubscriptionPath(company.id)}
                >
                  <ExternalLink className="size-4" />
                  View Subscription
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <UsageTile
              label="Users"
              value={company.usage?.userCount.toLocaleString() ?? "0"}
            />
            <UsageTile
              label="Departments"
              value={company.usage?.departmentCount.toLocaleString() ?? "0"}
            />
            <UsageTile
              label="Storage Used"
              value={`${Number(company.usage?.storageUsedMb ?? 0).toLocaleString()} MB`}
            />
            <UsageTile
              label="Usage Updated"
              value={formatPlatformDate(company.usage?.updatedAt)}
            />
          </div>
        </CardContent>
      </Card>

      <PlatformCompanyEditDrawer
        company={company}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />

      <PlatformCompanyStatusDialog
        action={selectedAction}
        company={company}
        onClose={() => setSelectedAction(null)}
      />
    </div>
  );
}

function SummaryTile({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-2 text-base font-semibold text-foreground">
        {children}
      </div>
    </div>
  );
}

function UsageTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function MetadataRow({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="max-w-80 text-right text-sm font-medium text-foreground">
        {children}
      </span>
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
              Platform company details are available only to super admins.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
          <div>
            <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
              <ShieldAlert className="size-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              Company could not be loaded
            </p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {message}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-20 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-lg bg-muted" />
        <div className="h-80 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
