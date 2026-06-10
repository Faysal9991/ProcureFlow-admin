"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { cn } from "@/lib/utils/cn";
import { useUpdateCompanySettings } from "../hooks";
import {
  securitySettingsSchema,
  type SecuritySettingsValues,
} from "../schemas";
import type { CompanySettings } from "../types";
import { getSettingsErrorMessage } from "../utils";

type SecuritySettingsFormProps = {
  isReadOnly: boolean;
  settings: CompanySettings;
};

export function SecuritySettingsForm({
  isReadOnly,
  settings,
}: SecuritySettingsFormProps) {
  const [apiError, setApiError] = useState("");
  const updateMutation = useUpdateCompanySettings();
  const defaultValues = useMemo<SecuritySettingsValues>(
    () => ({
      passwordMaxAgeDays: settings.passwordMaxAgeDays ?? 90,
      passwordRotationEnabled: settings.passwordRotationEnabled,
      sessionExpiryHours: settings.sessionExpiryHours ?? 24,
    }),
    [settings],
  );
  const {
    control,
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
  } = useForm<SecuritySettingsValues>({
    defaultValues,
    resolver: zodResolver(securitySettingsSchema),
  });
  const passwordRotationEnabled = useWatch({
    control,
    name: "passwordRotationEnabled",
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  function onSubmit(values: SecuritySettingsValues) {
    if (isReadOnly) {
      return;
    }

    setApiError("");
    updateMutation.mutate(
      {
        passwordMaxAgeDays: Number(values.passwordMaxAgeDays ?? 90),
        passwordRotationEnabled: values.passwordRotationEnabled,
        sessionExpiryHours: Number(values.sessionExpiryHours),
      },
      {
        onError: (error) => {
          setApiError(getSettingsErrorMessage(getApiErrorMessage(error)));
        },
        onSuccess: (updated) => {
          setApiError("");
          reset({
            passwordMaxAgeDays: updated.passwordMaxAgeDays ?? 90,
            passwordRotationEnabled: updated.passwordRotationEnabled,
            sessionExpiryHours: updated.sessionExpiryHours ?? 24,
          });
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Control password expiry policy and newly issued admin session length.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {apiError ? (
            <div className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
              {apiError}
            </div>
          ) : null}

          <Field
            description="When enabled, users whose password age exceeds the max age are routed to change password after login."
            label="Password Rotation"
          >
            <Checkbox
              disabled={isReadOnly}
              label="Require periodic password rotation"
              {...register("passwordRotationEnabled")}
            />
          </Field>

          <div className="grid gap-5 lg:grid-cols-2">
            <Field
              label="Password Expiry Days"
              error={errors.passwordMaxAgeDays?.message}
            >
              <Input
                aria-invalid={!!errors.passwordMaxAgeDays}
                disabled={isReadOnly || !passwordRotationEnabled}
                min={1}
                type="number"
                {...register("passwordMaxAgeDays", { valueAsNumber: true })}
              />
            </Field>

            <Field
              description="Changes apply to newly issued tokens only. Existing JWTs keep their original expiry."
              label="Session Expiry Hours"
              error={errors.sessionExpiryHours?.message}
            >
              <Input
                aria-invalid={!!errors.sessionExpiryHours}
                disabled={isReadOnly}
                min={1}
                type="number"
                {...register("sessionExpiryHours", { valueAsNumber: true })}
              />
            </Field>
          </div>

          {isReadOnly ? (
            <p className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
              Security settings are read-only for your role.
            </p>
          ) : (
            <div className="flex justify-end">
              <Button
                disabled={!isDirty}
                icon={<Save className="size-4" />}
                isLoading={updateMutation.isPending}
                type="submit"
              >
                Save Security
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
  description,
  error,
  label,
}: {
  children: ReactNode;
  description?: string;
  error?: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {description ? (
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      ) : null}
      {children}
      {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  );
}

function Checkbox({
  className,
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground">
      <input
        className={cn("size-4 rounded border-border accent-primary", className)}
        type="checkbox"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
