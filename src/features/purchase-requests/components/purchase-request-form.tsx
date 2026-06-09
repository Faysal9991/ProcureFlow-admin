"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Send, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PageHeader } from "@/components/shared";
import { Button, getButtonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ROUTES } from "@/lib/constants/routes";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/store/auth-store";
import {
  useCreatePurchaseRequest,
  usePurchaseRequest,
  useSubmitPurchaseRequest,
  useUpdatePurchaseRequest,
} from "../hooks";
import {
  purchaseRequestFormSchema,
  type PurchaseRequestFormValues,
} from "../schemas";
import type { CreatePurchaseRequestRequest, PurchaseRequest } from "../types";
import {
  canAccessPurchaseRequests,
  canEditRequest,
  getPurchaseRequestMutationError,
  normalizeOptionalString,
  requestPriorities,
} from "../utils";
import { PurchaseRequestItemsForm } from "./purchase-request-items-form";

type PurchaseRequestFormPageProps = {
  mode: "create" | "edit";
  requestId?: string;
};

const emptyValues: PurchaseRequestFormValues = {
  description: "",
  items: [
    {
      description: "",
      estimatedUnitPrice: 0,
      itemName: "",
      quantity: 1,
      unit: "pcs",
    },
  ],
  neededDate: "",
  priority: "NORMAL",
  title: "",
};

export function PurchaseRequestFormPage({
  mode,
  requestId = "",
}: PurchaseRequestFormPageProps) {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const canAccess = canAccessPurchaseRequests(currentUser?.role);
  const requestQuery = usePurchaseRequest(requestId, mode === "edit" && canAccess);
  const createMutation = useCreatePurchaseRequest();
  const updateMutation = useUpdatePurchaseRequest();
  const submitMutation = useSubmitPurchaseRequest();
  const [apiError, setApiError] = useState("");
  const [submitIntent, setSubmitIntent] = useState<"draft" | "submit">("draft");
  const request = requestQuery.data;
  const isEditing = mode === "edit";
  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    submitMutation.isPending;
  const defaultValues = useMemo(
    () => buildDefaultValues(request),
    [request],
  );
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<PurchaseRequestFormValues>({
    defaultValues: isEditing ? defaultValues : emptyValues,
    resolver: zodResolver(purchaseRequestFormSchema),
  });
  const watchedItems = useWatch({ control, name: "items" }) ?? [];

  useEffect(() => {
    if (isEditing && request) {
      reset(defaultValues);
    }
  }, [defaultValues, isEditing, request, reset]);

  if (!canAccess) {
    return (
      <BlockedFormState
        title="Purchase requests unavailable"
        message="Tenant purchase requests are not available to this account."
      />
    );
  }

  if (isEditing && requestQuery.isLoading) {
    return <FormSkeleton />;
  }

  if (isEditing && requestQuery.isError) {
    return (
      <BlockedFormState
        title="Purchase request unavailable"
        message={getApiErrorMessage(requestQuery.error)}
      />
    );
  }

  if (isEditing && request && !canEditRequest(request, currentUser)) {
    return (
      <BlockedFormState
        title="Draft editing unavailable"
        message="Only the requester can edit their own draft purchase request."
        requestId={request.id}
      />
    );
  }

  async function persist(values: PurchaseRequestFormValues) {
    setApiError("");

    try {
      const payload = normalizePayload(values);
      const savedRequest =
        isEditing && requestId
          ? await updateMutation.mutateAsync({ id: requestId, payload })
          : await createMutation.mutateAsync(payload);
      const finalRequest =
        submitIntent === "submit"
          ? await submitMutation.mutateAsync(savedRequest.id)
          : savedRequest;

      router.push(`/purchase-requests/${finalRequest.id}`);
    } catch (error) {
      setApiError(getPurchaseRequestMutationError(getApiErrorMessage(error)));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Link
            className={getButtonClassName({ variant: "outline" })}
            href={
              isEditing && requestId
                ? `/purchase-requests/${requestId}`
                : ROUTES.purchaseRequests
            }
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
        }
        eyebrow="Procurement"
        title={isEditing ? "Edit Purchase Request" : "Create Purchase Request"}
      >
        Save a request as draft or submit it into the approval workflow.
      </PageHeader>

      <form className="space-y-6" onSubmit={handleSubmit(persist)}>
        <Card>
          <CardContent className="space-y-5 p-5">
            {apiError ? (
              <div className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
                {apiError}
              </div>
            ) : null}

            <div className="grid gap-5 lg:grid-cols-[1.5fr_220px_220px]">
              <div className="space-y-2">
                <Label htmlFor="purchase-request-title">Title</Label>
                <Input
                  id="purchase-request-title"
                  aria-invalid={!!errors.title}
                  disabled={isPending}
                  placeholder="Laptop purchase for operations team"
                  {...register("title")}
                />
                {errors.title ? (
                  <p className="text-sm text-error">{errors.title.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase-request-priority">Priority</Label>
                <select
                  id="purchase-request-priority"
                  className={selectClassName}
                  disabled={isPending}
                  {...register("priority")}
                >
                  {requestPriorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
                {errors.priority ? (
                  <p className="text-sm text-error">
                    {errors.priority.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchase-request-needed-date">
                  Needed Date
                </Label>
                <Input
                  id="purchase-request-needed-date"
                  aria-invalid={!!errors.neededDate}
                  disabled={isPending}
                  type="date"
                  {...register("neededDate")}
                />
                {errors.neededDate ? (
                  <p className="text-sm text-error">
                    {errors.neededDate.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase-request-description">Description</Label>
              <textarea
                id="purchase-request-description"
                className={textareaClassName}
                disabled={isPending}
                placeholder="Business need, expected use, or supporting context"
                rows={4}
                {...register("description")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <PurchaseRequestItemsForm
              control={control}
              errors={errors}
              isDisabled={isPending}
              register={register}
              watchedItems={watchedItems}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-2 rounded-lg border border-border bg-surface p-4 shadow-card sm:flex-row sm:justify-end">
          <Link
            className={getButtonClassName({ variant: "outline" })}
            href={
              isEditing && requestId
                ? `/purchase-requests/${requestId}`
                : ROUTES.purchaseRequests
            }
          >
            Cancel
          </Link>
          <Button
            disabled={isPending}
            isLoading={isPending && submitIntent === "draft"}
            type="submit"
            variant="secondary"
            onClick={() => setSubmitIntent("draft")}
          >
            <Save className="size-4" />
            Save Draft
          </Button>
          <Button
            disabled={isPending}
            isLoading={isPending && submitIntent === "submit"}
            type="submit"
            onClick={() => setSubmitIntent("submit")}
          >
            <Send className="size-4" />
            Save and Submit
          </Button>
        </div>
      </form>
    </div>
  );
}

function buildDefaultValues(
  request?: PurchaseRequest,
): PurchaseRequestFormValues {
  if (!request) {
    return emptyValues;
  }

  return {
    description: request.description ?? "",
    items:
      request.items?.map((item) => ({
        description: item.description ?? "",
        estimatedUnitPrice: item.estimatedUnitPrice,
        itemName: item.itemName,
        quantity: item.quantity,
        unit: item.unit,
      })) ?? emptyValues.items,
    neededDate: request.neededDate ?? "",
    priority:
      request.priority === "LOW" ||
      request.priority === "HIGH" ||
      request.priority === "URGENT"
        ? request.priority
        : "NORMAL",
    title: request.title,
  };
}

function normalizePayload(
  values: PurchaseRequestFormValues,
): CreatePurchaseRequestRequest {
  return {
    description: normalizeOptionalString(values.description),
    items: values.items.map((item) => ({
      description: normalizeOptionalString(item.description),
      estimatedUnitPrice: Number(item.estimatedUnitPrice),
      itemName: item.itemName.trim(),
      quantity: Number(item.quantity),
      unit: item.unit.trim(),
    })),
    neededDate: normalizeOptionalString(values.neededDate),
    priority: values.priority,
    title: values.title.trim(),
  };
}

function BlockedFormState({
  message,
  requestId,
  title,
}: {
  message: string;
  requestId?: string;
  title: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Procurement" title={title}>
        {message}
      </PageHeader>
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                <ShieldAlert className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Action unavailable
              </p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {message}
              </p>
              <div className="mt-4 flex justify-center">
                <Link
                  className={getButtonClassName({ variant: "outline" })}
                  href={
                    requestId
                      ? `/purchase-requests/${requestId}`
                      : ROUTES.purchaseRequests
                  }
                >
                  Go back
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-16 max-w-xl rounded-lg bg-muted" />
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="h-10 rounded-lg bg-muted" />
          <div className="h-24 rounded-lg bg-muted" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="h-28 rounded-lg bg-muted" />
          <div className="h-28 rounded-lg bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}

const textareaClassName = cn(
  "flex w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors",
  "placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
);

const selectClassName = cn(
  "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors",
  "focus:border-primary focus:ring-4 focus:ring-ring",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
);
