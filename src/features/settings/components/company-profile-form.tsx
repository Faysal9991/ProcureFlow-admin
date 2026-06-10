"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/client";
import { useUpdateCompanySettings } from "../hooks";
import {
  companyProfileSchema,
  type CompanyProfileValues,
} from "../schemas";
import type { CompanySettings } from "../types";
import { getSettingsErrorMessage } from "../utils";

type CompanyProfileFormProps = {
  isReadOnly: boolean;
  settings: CompanySettings;
};

export function CompanyProfileForm({
  isReadOnly,
  settings,
}: CompanyProfileFormProps) {
  const [apiError, setApiError] = useState("");
  const updateMutation = useUpdateCompanySettings();
  const defaultValues = useMemo<CompanyProfileValues>(
    () => ({
      address: settings.address ?? "",
      email: settings.email ?? "",
      logoUrl: settings.logoUrl ?? "",
      name: settings.name ?? "",
      phone: settings.phone ?? "",
    }),
    [settings],
  );
  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
  } = useForm<CompanyProfileValues>({
    defaultValues,
    resolver: zodResolver(companyProfileSchema),
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  function onSubmit(values: CompanyProfileValues) {
    if (isReadOnly) {
      return;
    }

    setApiError("");
    updateMutation.mutate(
      {
        address: values.address?.trim() ?? "",
        email: values.email.trim(),
        logoUrl: values.logoUrl?.trim() ?? "",
        name: values.name.trim(),
        phone: values.phone?.trim() ?? "",
      },
      {
        onError: (error) => {
          setApiError(getSettingsErrorMessage(getApiErrorMessage(error)));
        },
        onSuccess: (updated) => {
          setApiError("");
          reset({
            address: updated.address ?? "",
            email: updated.email ?? "",
            logoUrl: updated.logoUrl ?? "",
            name: updated.name ?? "",
            phone: updated.phone ?? "",
          });
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Profile</CardTitle>
        <CardDescription>
          Maintain the tenant identity shown across procurement records.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {apiError ? (
            <div className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
              {apiError}
            </div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-2">
            <Field label="Company Name" error={errors.name?.message}>
              <Input
                aria-invalid={!!errors.name}
                disabled={isReadOnly}
                placeholder="ProcureFlow Demo Company"
                {...register("name")}
              />
            </Field>

            <Field label="Email" error={errors.email?.message}>
              <Input
                aria-invalid={!!errors.email}
                disabled={isReadOnly}
                placeholder="admin@company.com"
                type="email"
                {...register("email")}
              />
            </Field>

            <Field label="Phone" error={errors.phone?.message}>
              <Input
                aria-invalid={!!errors.phone}
                disabled={isReadOnly}
                placeholder="01700000000"
                {...register("phone")}
              />
            </Field>

            <Field label="Logo URL" error={errors.logoUrl?.message}>
              <Input
                aria-invalid={!!errors.logoUrl}
                disabled={isReadOnly}
                placeholder="https://example.com/logo.png"
                {...register("logoUrl")}
              />
            </Field>
          </div>

          <Field label="Address" error={errors.address?.message}>
            <textarea
              className="min-h-24 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70"
              disabled={isReadOnly}
              placeholder="Company address"
              {...register("address")}
            />
          </Field>

          {isReadOnly ? (
            <p className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
              Company profile is read-only for your role.
            </p>
          ) : (
            <div className="flex justify-end">
              <Button
                disabled={!isDirty}
                icon={<Save className="size-4" />}
                isLoading={updateMutation.isPending}
                type="submit"
              >
                Save Profile
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  children,
  error,
  label,
}: {
  children: ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  );
}
