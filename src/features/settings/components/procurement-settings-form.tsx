"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";
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
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import type { ApprovalWorkflow } from "@/features/approval-workflows/types";
import { useUpdateCompanySettings } from "../hooks";
import {
  procurementSettingsSchema,
  type ProcurementSettingsValues,
} from "../schemas";
import type { CompanySettings } from "../types";
import {
  currencyOptions,
  fiscalMonthOptions,
  getSettingsErrorMessage,
  workflowRuleLabel,
} from "../utils";

type ProcurementSettingsFormProps = {
  isReadOnly: boolean;
  settings: CompanySettings;
  workflows: ApprovalWorkflow[];
};

export function ProcurementSettingsForm({
  isReadOnly,
  settings,
  workflows,
}: ProcurementSettingsFormProps) {
  const [apiError, setApiError] = useState("");
  const updateMutation = useUpdateCompanySettings();
  const workflowOptions = useMemo(
    () =>
      workflows
        .filter((workflow) => workflow.isActive)
        .sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name)),
    [workflows],
  );
  const currencyValues = useMemo(() => {
    const values = new Set(currencyOptions);
    if (settings.defaultCurrency) {
      values.add(settings.defaultCurrency);
    }
    return Array.from(values);
  }, [settings.defaultCurrency]);
  const defaultValues = useMemo<ProcurementSettingsValues>(
    () => ({
      budgetEnforcementEnabled: settings.budgetEnforcementEnabled,
      defaultCurrency: settings.defaultCurrency || "BDT",
      defaultWorkflowId: settings.defaultWorkflowId ?? "",
      fiscalYearStartMonth: settings.fiscalYearStartMonth || 1,
      requireRfqBeforePo: settings.requireRfqBeforePo,
    }),
    [settings],
  );
  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    reset,
  } = useForm<ProcurementSettingsValues>({
    defaultValues,
    resolver: zodResolver(procurementSettingsSchema),
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  function onSubmit(values: ProcurementSettingsValues) {
    if (isReadOnly) {
      return;
    }

    setApiError("");
    updateMutation.mutate(
      {
        budgetEnforcementEnabled: values.budgetEnforcementEnabled,
        defaultCurrency: values.defaultCurrency.toUpperCase(),
        defaultWorkflowId: values.defaultWorkflowId ?? "",
        fiscalYearStartMonth: Number(values.fiscalYearStartMonth),
        requireRfqBeforePo: values.requireRfqBeforePo,
      },
      {
        onError: (error) => {
          setApiError(getSettingsErrorMessage(getApiErrorMessage(error)));
        },
        onSuccess: (updated) => {
          setApiError("");
          reset({
            budgetEnforcementEnabled: updated.budgetEnforcementEnabled,
            defaultCurrency: updated.defaultCurrency || "BDT",
            defaultWorkflowId: updated.defaultWorkflowId ?? "",
            fiscalYearStartMonth: updated.fiscalYearStartMonth || 1,
            requireRfqBeforePo: updated.requireRfqBeforePo,
          });
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Procurement Settings</CardTitle>
        <CardDescription>
          Configure PO controls, fiscal defaults, and the fallback approval
          workflow.
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
            <Field
              description="When enabled, direct PO creation is blocked until the RFQ flow is completed."
              label="Require RFQ Before PO"
            >
              <Checkbox
                disabled={isReadOnly}
                label="Require RFQ before purchase order creation"
                {...register("requireRfqBeforePo")}
              />
            </Field>

            <Field
              description="When enabled, final approval blocks if no budget or insufficient budget is available. When disabled, budget status is advisory only."
              label="Budget Enforcement"
            >
              <Checkbox
                disabled={isReadOnly}
                label="Enforce budget on final approval"
                {...register("budgetEnforcementEnabled")}
              />
            </Field>

            <Field label="Default Currency" error={errors.defaultCurrency?.message}>
              <select
                className={selectClassName}
                disabled={isReadOnly}
                {...register("defaultCurrency")}
              >
                {currencyValues.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Fiscal Year Start Month"
              error={errors.fiscalYearStartMonth?.message}
            >
              <select
                className={selectClassName}
                disabled={isReadOnly}
                {...register("fiscalYearStartMonth", { valueAsNumber: true })}
              >
                {fiscalMonthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field
            description="Only active workflows can be selected. If no specific workflow rule matches a request, this company default is used before the legacy default fallback."
            label="Default Approval Workflow"
            error={errors.defaultWorkflowId?.message}
          >
            <select
              className={selectClassName}
              disabled={isReadOnly}
              {...register("defaultWorkflowId")}
            >
              <option value="">Use legacy default workflow</option>
              {workflowOptions.map((workflow) => (
                <option key={workflow.id} value={workflow.id}>
                  {workflow.name} ({workflowRuleLabel(workflow)})
                </option>
              ))}
            </select>
          </Field>

          {isReadOnly ? (
            <p className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
              Procurement settings are read-only for your role.
            </p>
          ) : (
            <div className="flex justify-end">
              <Button
                disabled={!isDirty}
                icon={<Save className="size-4" />}
                isLoading={updateMutation.isPending}
                type="submit"
              >
                Save Procurement
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

const selectClassName =
  "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-ring disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70";
