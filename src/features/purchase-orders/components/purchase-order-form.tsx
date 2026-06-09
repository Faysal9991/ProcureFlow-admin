"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button, getButtonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePurchaseRequest, usePurchaseRequests } from "@/features/purchase-requests/hooks";
import type { PurchaseRequestItem } from "@/features/purchase-requests/types";
import { useVendors } from "@/features/vendors/hooks";
import { getApiErrorMessage } from "@/lib/api/client";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/store/auth-store";
import {
  useCreatePurchaseOrder,
  usePurchaseOrder,
  useRFQ,
  useRFQs,
  useUpdatePurchaseOrder,
} from "../hooks";
import {
  purchaseOrderFormSchema,
  type PurchaseOrderFormValues,
} from "../schemas";
import type {
  CreatePurchaseOrderRequest,
  PurchaseOrder,
  PurchaseOrderItemInput,
  UpdatePurchaseOrderRequest,
} from "../types";
import {
  calculateLineTotal,
  calculateOrderTotal,
  canEditPurchaseOrder,
  canManagePurchaseOrders,
  formatCurrency,
  getPurchaseOrderMutationError,
  normalizeOptionalString,
} from "../utils";

type PurchaseOrderFormPageProps = {
  mode: "create" | "edit";
  orderId?: string;
};

const emptyValues: PurchaseOrderFormValues = {
  items: [],
  mode: "direct",
  notes: "",
  purchaseRequestId: "",
  quotationId: "",
  rfqId: "",
  vendorId: "",
};

export function PurchaseOrderFormPage({
  mode,
  orderId = "",
}: PurchaseOrderFormPageProps) {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManagePurchaseOrders(currentUser?.role);
  const isEditing = mode === "edit";
  const orderQuery = usePurchaseOrder(orderId, isEditing && canManage);
  const order = orderQuery.data;
  const createMutation = useCreatePurchaseOrder();
  const updateMutation = useUpdatePurchaseOrder();
  const [apiError, setApiError] = useState("");
  const isPending = createMutation.isPending || updateMutation.isPending;
  const defaultValues = useMemo(
    () => (isEditing ? buildDefaultValues(order) : emptyValues),
    [isEditing, order],
  );

  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<PurchaseOrderFormValues>({
    defaultValues,
    resolver: zodResolver(purchaseOrderFormSchema),
  });
  const watchedMode = useWatch({ control, name: "mode" });
  const watchedPurchaseRequestId = useWatch({
    control,
    name: "purchaseRequestId",
  });
  const watchedRFQId = useWatch({ control, name: "rfqId" });
  const watchedItems = useWatch({ control, name: "items" }) ?? [];
  const approvedRequestsQuery = usePurchaseRequests(
    { limit: 50, page: 1, status: "APPROVED" },
    "company",
    canManage && !isEditing && watchedMode === "direct",
  );
  const selectedRequestQuery = usePurchaseRequest(
    watchedPurchaseRequestId ?? "",
    canManage &&
      !isEditing &&
      watchedMode === "direct" &&
      !!watchedPurchaseRequestId,
  );
  const vendorsQuery = useVendors(
    { limit: 100, page: 1, status: "ACTIVE" },
    canManage,
  );
  const rfqsQuery = useRFQs(
    { limit: 50, page: 1, status: "COMPLETED" },
    canManage && !isEditing && watchedMode === "quotation",
  );
  const selectedRFQQuery = useRFQ(
    watchedRFQId ?? "",
    canManage && !isEditing && watchedMode === "quotation" && !!watchedRFQId,
  );
  const approvedRequests = approvedRequestsQuery.data?.items ?? [];
  const vendors = vendorsQuery.data?.items ?? [];
  const rfqs = rfqsQuery.data?.items ?? [];
  const selectedRFQ = selectedRFQQuery.data;
  const selectedQuotation = selectedRFQ?.quotations?.find(
    (quotation) => quotation.id === selectedRFQ.selectedQuotationId,
  );
  const orderTotal = calculateOrderTotal(watchedItems);

  useEffect(() => {
    if (isEditing && order) {
      reset(defaultValues);
    }
  }, [defaultValues, isEditing, order, reset]);

  useEffect(() => {
    if (isEditing || watchedMode !== "direct") {
      return;
    }

    const requestItems = selectedRequestQuery.data?.items;
    if (!requestItems) {
      return;
    }

    setValue("items", requestItems.map(toFormItem), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [isEditing, selectedRequestQuery.data, setValue, watchedMode]);

  useEffect(() => {
    if (isEditing || watchedMode !== "quotation") {
      return;
    }

    setValue("quotationId", selectedRFQ?.selectedQuotationId ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [isEditing, selectedRFQ?.selectedQuotationId, setValue, watchedMode]);

  if (!canManage) {
    return (
      <BlockedFormState
        message="Purchase order management is available to company admins and procurement users."
        title="Purchase order management unavailable"
      />
    );
  }

  if (isEditing && orderQuery.isLoading) {
    return <FormSkeleton />;
  }

  if (isEditing && orderQuery.isError) {
    return (
      <BlockedFormState
        message={getApiErrorMessage(orderQuery.error)}
        title="Purchase order unavailable"
      />
    );
  }

  if (isEditing && order && !canEditPurchaseOrder(order)) {
    return (
      <BlockedFormState
        actionHref={`/purchase-orders/${order.id}`}
        actionLabel="View PO"
        message="Only draft purchase orders can be edited."
        title="Draft editing unavailable"
      />
    );
  }

  async function persist(values: PurchaseOrderFormValues) {
    setApiError("");

    try {
      const savedOrder =
        isEditing && orderId
          ? await updateMutation.mutateAsync({
              id: orderId,
              payload: normalizeUpdatePayload(values),
            })
          : await createMutation.mutateAsync(normalizeCreatePayload(values));

      router.push(`/purchase-orders/${savedOrder.id}`);
    } catch (error) {
      setApiError(
        getPurchaseOrderMutationError(getApiErrorMessage(error)),
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Link
            className={getButtonClassName({ variant: "outline" })}
            href={
              isEditing && orderId
                ? `/purchase-orders/${orderId}`
                : ROUTES.purchaseOrders
            }
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
        }
        eyebrow="Procurement"
        title={isEditing ? "Edit Purchase Order" : "Create Purchase Order"}
      >
        {isEditing
          ? "Update draft purchase order details before issue."
          : "Create a draft PO from an approved request or selected quotation."}
      </PageHeader>

      <form className="space-y-6" onSubmit={handleSubmit(persist)}>
        <Card>
          <CardContent className="space-y-5 p-5">
            {apiError ? (
              <div className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
                {apiError}
              </div>
            ) : null}

            {!isEditing ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={modeOptionClassName(watchedMode === "direct")}>
                  <input
                    className="sr-only"
                    type="radio"
                    value="direct"
                    {...register("mode")}
                  />
                  <span className="text-sm font-medium text-foreground">
                    Approved Request
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Select request, vendor, and pricing
                  </span>
                </label>
                <label
                  className={modeOptionClassName(watchedMode === "quotation")}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    value="quotation"
                    {...register("mode")}
                  />
                  <span className="text-sm font-medium text-foreground">
                    Selected Quotation
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Use completed RFQ supplier pricing
                  </span>
                </label>
              </div>
            ) : null}

            {watchedMode === "quotation" && !isEditing ? (
              <QuotationFields
                error={errors.rfqId?.message ?? errors.quotationId?.message}
                isLoading={selectedRFQQuery.isLoading}
                rfqId={watchedRFQId ?? ""}
                rfqs={rfqs}
                selectedQuotation={selectedQuotation}
                onRFQChange={(value) => {
                  setValue("rfqId", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue("quotationId", "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
              />
            ) : (
              <DirectFields
                errors={errors}
                isEditing={isEditing}
                isLoadingRequest={selectedRequestQuery.isLoading}
                order={order}
                purchaseRequestId={watchedPurchaseRequestId ?? ""}
                requests={approvedRequests}
                vendors={vendors}
                onPurchaseRequestChange={(value) => {
                  setValue("purchaseRequestId", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue("items", [], {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                register={register}
              />
            )}

            <div className="space-y-2">
              <Label htmlFor="po-notes">Notes</Label>
              <textarea
                id="po-notes"
                className={textareaClassName}
                disabled={isPending}
                placeholder="Optional purchasing notes"
                rows={4}
                {...register("notes")}
              />
            </div>
          </CardContent>
        </Card>

        {watchedMode === "direct" || isEditing ? (
          <ItemsEditor
            errors={errors}
            isPending={isPending}
            items={watchedItems}
            register={register}
          />
        ) : null}

        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Estimated PO total</p>
            <p className="text-2xl font-semibold text-foreground">
              {watchedMode === "quotation" && selectedQuotation
                ? formatCurrency(selectedQuotation.totalAmount)
                : formatCurrency(orderTotal)}
            </p>
          </div>
          <Button isLoading={isPending} type="submit">
            <Save className="size-4" />
            {isEditing ? "Save Changes" : "Create Draft PO"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function DirectFields({
  errors,
  isEditing,
  isLoadingRequest,
  order,
  purchaseRequestId,
  register,
  requests,
  vendors,
  onPurchaseRequestChange,
}: {
  errors: ReturnType<typeof useForm<PurchaseOrderFormValues>>["formState"]["errors"];
  isEditing: boolean;
  isLoadingRequest: boolean;
  order?: PurchaseOrder;
  purchaseRequestId: string;
  register: ReturnType<typeof useForm<PurchaseOrderFormValues>>["register"];
  requests: { id: string; title: string }[];
  vendors: { id: string; name: string }[];
  onPurchaseRequestChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="po-request">Approved Request</Label>
        {isEditing ? (
          <Input
            id="po-request"
            disabled
            value={order?.purchaseRequest.title ?? ""}
            readOnly
          />
        ) : (
          <select
            id="po-request"
            className={selectClassName}
            value={purchaseRequestId}
            onChange={(event) => onPurchaseRequestChange(event.target.value)}
          >
            <option value="">Select approved request</option>
            {requests.map((request) => (
              <option key={request.id} value={request.id}>
                {request.title}
              </option>
            ))}
          </select>
        )}
        {errors.purchaseRequestId ? (
          <p className="text-sm text-error">
            {errors.purchaseRequestId.message}
          </p>
        ) : null}
        {isLoadingRequest ? (
          <p className="text-sm text-muted-foreground">Loading request items...</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="po-vendor">Vendor</Label>
        <select
          id="po-vendor"
          className={selectClassName}
          {...register("vendorId")}
        >
          <option value="">Select vendor</option>
          {vendors.map((vendor) => (
            <option key={vendor.id} value={vendor.id}>
              {vendor.name}
            </option>
          ))}
        </select>
        {errors.vendorId ? (
          <p className="text-sm text-error">{errors.vendorId.message}</p>
        ) : null}
      </div>
    </div>
  );
}

function QuotationFields({
  error,
  isLoading,
  rfqId,
  rfqs,
  selectedQuotation,
  onRFQChange,
}: {
  error?: string;
  isLoading: boolean;
  rfqId: string;
  rfqs: { id: string; purchaseRequest: { title: string }; rfqNumber: string }[];
  selectedQuotation?: {
    quotationNumber: string;
    totalAmount: number;
    vendor: { name: string };
  };
  onRFQChange: (value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="po-rfq">Completed RFQ</Label>
        <select
          id="po-rfq"
          className={selectClassName}
          value={rfqId}
          onChange={(event) => onRFQChange(event.target.value)}
        >
          <option value="">Select completed RFQ</option>
          {rfqs.map((rfq) => (
            <option key={rfq.id} value={rfq.id}>
              {rfq.rfqNumber} - {rfq.purchaseRequest.title}
            </option>
          ))}
        </select>
        {error ? <p className="text-sm text-error">{error}</p> : null}
      </div>

      {isLoading ? (
        <div className="h-20 rounded-lg border border-border bg-muted" />
      ) : null}

      {selectedQuotation ? (
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {selectedQuotation.quotationNumber}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedQuotation.vendor.name}
              </p>
            </div>
            <Badge variant="success">
              {formatCurrency(selectedQuotation.totalAmount)}
            </Badge>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ItemsEditor({
  errors,
  isPending,
  items,
  register,
}: {
  errors: ReturnType<typeof useForm<PurchaseOrderFormValues>>["formState"]["errors"];
  isPending: boolean;
  items: PurchaseOrderFormValues["items"];
  register: ReturnType<typeof useForm<PurchaseOrderFormValues>>["register"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>PO Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {typeof errors.items?.message === "string" ? (
          <div className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
            {errors.items.message}
          </div>
        ) : null}

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
            Select an approved request to load PO items.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.purchaseRequestItemId || index}
                className="grid gap-3 rounded-lg border border-border p-4 lg:grid-cols-[1.4fr_120px_160px_160px]"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.itemName}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.description || "No description"} · {item.unit}
                  </p>
                  <input
                    type="hidden"
                    {...register(`items.${index}.purchaseRequestItemId`)}
                  />
                  <input type="hidden" {...register(`items.${index}.itemName`)} />
                  <input
                    type="hidden"
                    {...register(`items.${index}.description`)}
                  />
                  <input type="hidden" {...register(`items.${index}.unit`)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`po-item-quantity-${index}`}>Quantity</Label>
                  <Input
                    id={`po-item-quantity-${index}`}
                    disabled={isPending}
                    min="0.01"
                    step="0.01"
                    type="number"
                    {...register(`items.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.items?.[index]?.quantity ? (
                    <p className="text-sm text-error">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`po-item-unit-price-${index}`}>
                    Unit Price
                  </Label>
                  <Input
                    id={`po-item-unit-price-${index}`}
                    disabled={isPending}
                    min="0"
                    step="0.01"
                    type="number"
                    {...register(`items.${index}.unitPrice`, {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.items?.[index]?.unitPrice ? (
                    <p className="text-sm text-error">
                      {errors.items[index]?.unitPrice?.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Item total</p>
                  <p className="mt-2 text-base font-semibold text-foreground">
                    {formatCurrency(
                      calculateLineTotal(item.quantity, item.unitPrice),
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BlockedFormState({
  actionHref,
  actionLabel,
  message,
  title,
}: {
  actionHref?: string;
  actionLabel?: string;
  message: string;
  title: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Procurement" title="Purchase Orders">
        Create and manage purchase orders.
      </PageHeader>
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                <ShieldAlert className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {message}
              </p>
              {actionHref && actionLabel ? (
                <Link
                  className={getButtonClassName({
                    className: "mt-4",
                    variant: "outline",
                  })}
                  href={actionHref}
                >
                  {actionLabel}
                </Link>
              ) : null}
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
      <div className="h-20 rounded-lg bg-muted" />
      <div className="h-72 rounded-lg bg-muted" />
      <div className="h-64 rounded-lg bg-muted" />
    </div>
  );
}

function buildDefaultValues(order?: PurchaseOrder): PurchaseOrderFormValues {
  if (!order) {
    return emptyValues;
  }

  return {
    items: (order.items ?? []).map((item) => ({
      description: item.description ?? "",
      itemName: item.itemName,
      purchaseRequestItemId: item.purchaseRequestItemId,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
    })),
    mode: "direct",
    notes: order.notes ?? "",
    purchaseRequestId: order.purchaseRequest.id,
    quotationId: order.quotationId ?? "",
    rfqId: "",
    vendorId: order.vendor.id,
  };
}

function toFormItem(item: PurchaseRequestItem) {
  return {
    description: item.description ?? "",
    itemName: item.itemName,
    purchaseRequestItemId: item.id,
    quantity: item.quantity,
    unit: item.unit,
    unitPrice: item.estimatedUnitPrice,
  };
}

function toServiceItems(
  items: PurchaseOrderFormValues["items"],
): PurchaseOrderItemInput[] {
  return items.map((item) => ({
    purchaseRequestItemId: item.purchaseRequestItemId,
    quantity: Number(item.quantity),
    unitPrice: Number(item.unitPrice),
  }));
}

function normalizeCreatePayload(
  values: PurchaseOrderFormValues,
): CreatePurchaseOrderRequest {
  if (values.mode === "quotation") {
    return {
      notes: normalizeOptionalString(values.notes),
      quotationId: values.quotationId,
    };
  }

  return {
    items: toServiceItems(values.items),
    notes: normalizeOptionalString(values.notes),
    purchaseRequestId: values.purchaseRequestId,
    vendorId: values.vendorId,
  };
}

function normalizeUpdatePayload(
  values: PurchaseOrderFormValues,
): UpdatePurchaseOrderRequest {
  return {
    items: toServiceItems(values.items),
    notes: normalizeOptionalString(values.notes),
    vendorId: values.vendorId,
  };
}

function modeOptionClassName(isActive: boolean) {
  return cn(
    "flex cursor-pointer flex-col rounded-lg border p-4 transition-colors",
    isActive
      ? "border-primary bg-primary/5"
      : "border-border bg-background hover:border-primary/40",
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
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
);
