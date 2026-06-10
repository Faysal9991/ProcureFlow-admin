"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Building2, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { PageHeader } from "@/components/shared";
import { Button, getButtonClassName } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TemporaryPasswordDialog } from "@/features/users/components";
import { getApiErrorMessage } from "@/lib/api/client";
import { ROUTES, platformCompanyDetailPath } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/store/auth-store";
import { useCreatePlatformCompany, usePlatformPlans } from "../hooks";
import {
  platformCompanyCreateSchema,
  type PlatformCompanyCreateValues,
} from "../schemas";
import {
  canManagePlatformCompanies,
  formatLimit,
  formatPlatformCurrency,
  getPlatformMutationError,
} from "../utils";

const emptyValues: PlatformCompanyCreateValues = {
  adminEmail: "",
  adminName: "",
  adminPhone: "",
  companyAddress: "",
  companyEmail: "",
  companyName: "",
  companyPhone: "",
  planId: "",
  subscriptionEndDate: "",
  subscriptionStartDate: "",
};

type TemporaryPasswordState = {
  companyId: string;
  password: string;
};

export function PlatformCompanyCreateForm() {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManagePlatformCompanies(currentUser?.role);
  const plansQuery = usePlatformPlans(canManage);
  const createMutation = useCreatePlatformCompany();
  const [apiError, setApiError] = useState("");
  const [temporaryPassword, setTemporaryPassword] =
    useState<TemporaryPasswordState | null>(null);
  const activePlans = useMemo(
    () => (plansQuery.data ?? []).filter((plan) => plan.isActive),
    [plansQuery.data],
  );
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<PlatformCompanyCreateValues>({
    defaultValues: emptyValues,
    resolver: zodResolver(platformCompanyCreateSchema),
  });

  if (!canManage) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Platform" title="Create Company">
          Create a tenant company and first company admin.
        </PageHeader>
        <PermissionState />
      </div>
    );
  }

  function normalizeOptional(value?: string) {
    const trimmed = value?.trim() ?? "";
    return trimmed || undefined;
  }

  function onSubmit(values: PlatformCompanyCreateValues) {
    setApiError("");
    createMutation.mutate(
      {
        adminEmail: values.adminEmail.trim().toLowerCase(),
        adminName: values.adminName.trim(),
        adminPhone: normalizeOptional(values.adminPhone),
        companyAddress: normalizeOptional(values.companyAddress),
        companyEmail: values.companyEmail.trim().toLowerCase(),
        companyName: values.companyName.trim(),
        companyPhone: normalizeOptional(values.companyPhone),
        planId: values.planId,
        subscriptionEndDate: normalizeOptional(values.subscriptionEndDate),
        subscriptionStartDate: normalizeOptional(values.subscriptionStartDate),
      },
      {
        onError: (error) => {
          setApiError(getPlatformMutationError(getApiErrorMessage(error)));
        },
        onSuccess: (data) => {
          setApiError("");
          setTemporaryPassword({
            companyId: data.companyId,
            password: data.temporaryPassword,
          });
        },
      },
    );
  }

  function handleCloseTemporaryPassword() {
    const companyId = temporaryPassword?.companyId;
    setTemporaryPassword(null);
    if (companyId) {
      router.push(platformCompanyDetailPath(companyId));
    }
  }

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
        title="Create Company"
      >
        Create a tenant company, first company admin, and initial subscription.
      </PageHeader>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {apiError ? (
          <div className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
            {apiError}
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    error={errors.companyName?.message}
                    id="company-name"
                    label="Company Name"
                  >
                    <Input
                      id="company-name"
                      aria-invalid={!!errors.companyName}
                      placeholder="ProcureFlow Demo Ltd."
                      {...register("companyName")}
                    />
                  </Field>
                  <Field
                    error={errors.companyEmail?.message}
                    id="company-email"
                    label="Company Email"
                  >
                    <Input
                      id="company-email"
                      aria-invalid={!!errors.companyEmail}
                      placeholder="admin@company.com"
                      type="email"
                      {...register("companyEmail")}
                    />
                  </Field>
                </div>

                <Field
                  error={errors.companyPhone?.message}
                  id="company-phone"
                  label="Company Phone"
                >
                  <Input
                    id="company-phone"
                    aria-invalid={!!errors.companyPhone}
                    placeholder="01700000000"
                    {...register("companyPhone")}
                  />
                </Field>

                <Field
                  error={errors.companyAddress?.message}
                  id="company-address"
                  label="Company Address"
                >
                  <textarea
                    id="company-address"
                    className={textareaClassName}
                    placeholder="House, road, city"
                    rows={4}
                    {...register("companyAddress")}
                  />
                </Field>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>First Company Admin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    error={errors.adminName?.message}
                    id="admin-name"
                    label="Admin Name"
                  >
                    <Input
                      id="admin-name"
                      aria-invalid={!!errors.adminName}
                      placeholder="Amina Rahman"
                      {...register("adminName")}
                    />
                  </Field>
                  <Field
                    error={errors.adminEmail?.message}
                    id="admin-email"
                    label="Admin Email"
                  >
                    <Input
                      id="admin-email"
                      aria-invalid={!!errors.adminEmail}
                      placeholder="amina@company.com"
                      type="email"
                      {...register("adminEmail")}
                    />
                  </Field>
                </div>

                <Field
                  error={errors.adminPhone?.message}
                  id="admin-phone"
                  label="Admin Phone"
                >
                  <Input
                    id="admin-phone"
                    aria-invalid={!!errors.adminPhone}
                    placeholder="01700000000"
                    {...register("adminPhone")}
                  />
                </Field>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <Field
                  error={errors.planId?.message}
                  id="company-plan"
                  label="Plan"
                >
                  <select
                    id="company-plan"
                    className={selectClassName}
                    disabled={plansQuery.isLoading}
                    {...register("planId")}
                  >
                    <option value="">Select plan</option>
                    {activePlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                  <Field
                    error={errors.subscriptionStartDate?.message}
                    id="subscription-start-date"
                    label="Start Date"
                  >
                    <Input
                      id="subscription-start-date"
                      aria-invalid={!!errors.subscriptionStartDate}
                      type="date"
                      {...register("subscriptionStartDate")}
                    />
                  </Field>
                  <Field
                    error={errors.subscriptionEndDate?.message}
                    id="subscription-end-date"
                    label="End Date"
                  >
                    <Input
                      id="subscription-end-date"
                      aria-invalid={!!errors.subscriptionEndDate}
                      type="date"
                      {...register("subscriptionEndDate")}
                    />
                  </Field>
                </div>

                {plansQuery.isError ? (
                  <div className="rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-warning">
                    Plans could not be loaded. Retry after checking platform
                    API access.
                  </div>
                ) : null}

                {!plansQuery.isLoading && activePlans.length === 0 ? (
                  <div className="rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-warning">
                    No active plans are available for company creation.
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Plan Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activePlans.slice(0, 3).map((plan) => (
                  <div
                    key={plan.id}
                    className="rounded-lg border border-border bg-background p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-foreground">{plan.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPlatformCurrency(plan.price)}
                      </p>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatLimit(plan.maxUsers)} users ·{" "}
                      {formatLimit(plan.maxDepartments)} departments ·{" "}
                      {formatLimit(plan.maxRequestsPerMonth)} requests/month
                    </p>
                  </div>
                ))}
                {plansQuery.isLoading ? (
                  <div className="h-24 animate-pulse rounded-lg bg-muted" />
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 rounded-lg border border-border bg-surface p-4 shadow-card sm:flex-row sm:justify-end">
          <Link
            className={getButtonClassName({ variant: "outline" })}
            href={ROUTES.platformCompanies}
          >
            Cancel
          </Link>
          <Button
            disabled={activePlans.length === 0}
            isLoading={createMutation.isPending}
            type="submit"
          >
            <Building2 className="size-4" />
            Create Company
          </Button>
        </div>
      </form>

      <TemporaryPasswordDialog
        description="Share this password with the first company admin through a secure channel."
        password={temporaryPassword?.password ?? null}
        title="Company admin password generated"
        onClose={handleCloseTemporaryPassword}
      />
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
              Only super admins can create tenant companies.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  children,
  error,
  id,
  label,
}: {
  children: React.ReactNode;
  error?: string;
  id: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  );
}

const selectClassName = cn(
  "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors",
  "focus:border-primary focus:ring-4 focus:ring-ring",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
);

const textareaClassName = cn(
  "flex w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground",
  "focus:border-primary focus:ring-4 focus:ring-ring",
);
