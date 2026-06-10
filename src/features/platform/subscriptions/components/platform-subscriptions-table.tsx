"use client";

import { Inbox, Plus, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  usePlatformCompanySubscription,
} from "@/features/platform/companies/hooks";
import type {
  PlatformCompany,
  PlatformSubscription,
} from "@/features/platform/companies/types";
import {
  formatLimit,
  formatPlatformDate,
} from "@/features/platform/companies/utils";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatPlatformMoney } from "@/features/platform/plans/utils";
import { getSubscriptionStatusVariant } from "../utils";

type PlatformSubscriptionsTableProps = {
  companies: PlatformCompany[];
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  onAssignPlan: (companyId: string) => void;
};

export function PlatformSubscriptionsTable({
  companies,
  error,
  isError,
  isLoading,
  onAssignPlan,
}: PlatformSubscriptionsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[1.2fr_1fr_120px_1fr_1fr_120px]"
              >
                {Array.from({ length: 6 }).map((__, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="h-4 rounded-md bg-muted"
                  />
                ))}
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
                Adjust filters or create a company first.
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
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Limits</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.map((company) => (
              <SubscriptionRow
                key={company.id}
                company={company}
                onAssignPlan={onAssignPlan}
              />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SubscriptionRow({
  company,
  onAssignPlan,
}: {
  company: PlatformCompany;
  onAssignPlan: (companyId: string) => void;
}) {
  const subscriptionQuery = usePlatformCompanySubscription(company.id, true);
  const subscription = subscriptionQuery.data;

  return (
    <TableRow>
      <TableCell className="min-w-56">
        <div>
          <p className="font-medium text-foreground">{company.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{company.email}</p>
        </div>
      </TableCell>
      <TableCell className="min-w-44">
        {subscriptionQuery.isLoading ? (
          <span className="text-sm text-muted-foreground">Loading...</span>
        ) : null}
        {subscriptionQuery.isError ? <NoSubscriptionState /> : null}
        {subscription ? <PlanSummary subscription={subscription} /> : null}
      </TableCell>
      <TableCell>
        {subscription ? (
          <Badge variant={getSubscriptionStatusVariant(subscription.status)}>
            {subscription.status}
          </Badge>
        ) : (
          <Badge variant="warning">None</Badge>
        )}
      </TableCell>
      <TableCell className="min-w-44 text-sm text-muted-foreground">
        {subscription ? (
          <span>
            {formatPlatformDate(subscription.startDate)} to{" "}
            {formatPlatformDate(subscription.endDate)}
          </span>
        ) : (
          "Not assigned"
        )}
      </TableCell>
      <TableCell className="min-w-64 text-sm text-muted-foreground">
        {subscription ? (
          <span>
            {formatLimit(subscription.plan.maxUsers)} users ·{" "}
            {formatLimit(subscription.plan.maxDepartments)} departments ·{" "}
            {formatLimit(subscription.plan.maxRequestsPerMonth)} requests/month
          </span>
        ) : (
          "No limits"
        )}
      </TableCell>
      <TableCell>
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAssignPlan(company.id)}
          >
            <Plus className="size-4" />
            Assign
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function PlanSummary({
  subscription,
}: {
  subscription: PlatformSubscription;
}) {
  return (
    <div>
      <p className="font-medium text-foreground">{subscription.plan.name}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {formatPlatformMoney(subscription.plan.price)}
      </p>
    </div>
  );
}

function NoSubscriptionState() {
  return (
    <div>
      <p className="font-medium text-foreground">No active subscription</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Assign a plan to create one.
      </p>
    </div>
  );
}
