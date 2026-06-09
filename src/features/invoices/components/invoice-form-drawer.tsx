"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { invoiceFormSchema, type InvoiceFormValues } from "../schemas";
import type { Invoice, InvoiceEligiblePurchaseOrder } from "../types";
import {
  formatCurrency,
  getInvoiceMutationError,
  normalizeOptionalString,
} from "../utils";
import { useCreateInvoice, useUpdateInvoice } from "../hooks";

type InvoiceFormDrawerProps = {
  eligibleOrders: InvoiceEligiblePurchaseOrder[];
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
};

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function dueDateInputValue() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 10);
}

const emptyValues: InvoiceFormValues = {
  dueDate: dueDateInputValue(),
  invoiceAmount: 0,
  invoiceDate: todayInputValue(),
  invoiceNumber: "",
  notes: "",
  purchaseOrderId: "",
};

export function InvoiceFormDrawer({
  eligibleOrders,
  invoice,
  isOpen,
  onClose,
}: InvoiceFormDrawerProps) {
  const [apiError, setApiError] = useState("");
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();
  const isEditing = !!invoice;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const title = isEditing ? "Edit Invoice" : "Create Invoice";
  const description = isEditing
    ? "Update a pending invoice before payments are recorded."
    : "Create an invoice from a received purchase order.";
  const defaultValues = useMemo<InvoiceFormValues>(
    () =>
      invoice
        ? {
            dueDate: invoice.dueDate,
            invoiceAmount: invoice.invoiceAmount,
            invoiceDate: invoice.invoiceDate,
            invoiceNumber: invoice.invoiceNumber,
            notes: invoice.notes ?? "",
            purchaseOrderId: invoice.purchaseOrder.id,
          }
        : emptyValues,
    [invoice],
  );
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<InvoiceFormValues>({
    defaultValues,
    resolver: zodResolver(invoiceFormSchema),
  });
  const selectedOrderId = useWatch({ control, name: "purchaseOrderId" });
  const selectedOrder = eligibleOrders.find(
    (order) => order.id === selectedOrderId,
  );

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
  }, [defaultValues, isOpen, reset]);

  if (!isOpen) {
    return null;
  }

  function handleClose() {
    if (!isPending) {
      setApiError("");
      onClose();
    }
  }

  function normalizePayload(values: InvoiceFormValues) {
    return {
      dueDate: values.dueDate,
      invoiceAmount: Number(values.invoiceAmount),
      invoiceDate: values.invoiceDate,
      invoiceNumber: values.invoiceNumber.trim(),
      notes: normalizeOptionalString(values.notes),
      purchaseOrderId: values.purchaseOrderId,
    };
  }

  function onSubmit(values: InvoiceFormValues) {
    setApiError("");
    const payload = normalizePayload(values);

    if (invoice) {
      updateMutation.mutate(
        {
          id: invoice.id,
          payload: {
            dueDate: payload.dueDate,
            invoiceAmount: payload.invoiceAmount,
            invoiceDate: payload.invoiceDate,
            invoiceNumber: payload.invoiceNumber,
            notes: payload.notes,
          },
        },
        {
          onError: (error) => {
            setApiError(getInvoiceMutationError(getApiErrorMessage(error)));
          },
          onSuccess: () => {
            setApiError("");
            onClose();
          },
        },
      );
      return;
    }

    createMutation.mutate(payload, {
      onError: (error) => {
        setApiError(getInvoiceMutationError(getApiErrorMessage(error)));
      },
      onSuccess: () => {
        setApiError("");
        onClose();
      },
    });
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close invoice form"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <Button
            aria-label="Close"
            disabled={isPending}
            size="icon"
            variant="ghost"
            onClick={handleClose}
          >
            <X className="size-5" />
          </Button>
        </div>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            {apiError ? (
              <div className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
                {apiError}
              </div>
            ) : null}

            {!isEditing && eligibleOrders.length === 0 ? (
              <div className="rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-warning">
                No received, uninvoiced purchase orders are available.
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="invoice-po">Received Purchase Order</Label>
              <select
                id="invoice-po"
                className={selectClassName}
                disabled={isEditing || isPending}
                {...register("purchaseOrderId")}
              >
                <option value="">Select received PO</option>
                {eligibleOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.poNumber} - {order.vendor.name} -{" "}
                    {formatCurrency(order.totalAmount)}
                  </option>
                ))}
              </select>
              {errors.purchaseOrderId ? (
                <p className="text-sm text-error">
                  {errors.purchaseOrderId.message}
                </p>
              ) : null}
              {selectedOrder ? (
                <p className="text-sm text-muted-foreground">
                  Vendor: {selectedOrder.vendor.name}. PO total:{" "}
                  {formatCurrency(selectedOrder.totalAmount)}.
                </p>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invoice-number">Invoice No</Label>
                <Input
                  id="invoice-number"
                  aria-invalid={!!errors.invoiceNumber}
                  placeholder="INV-2026-0001"
                  {...register("invoiceNumber")}
                />
                {errors.invoiceNumber ? (
                  <p className="text-sm text-error">
                    {errors.invoiceNumber.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice-amount">Amount</Label>
                <Input
                  id="invoice-amount"
                  aria-invalid={!!errors.invoiceAmount}
                  min="0"
                  step="0.01"
                  type="number"
                  {...register("invoiceAmount", { valueAsNumber: true })}
                />
                {errors.invoiceAmount ? (
                  <p className="text-sm text-error">
                    {errors.invoiceAmount.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="invoice-date">Invoice Date</Label>
                <Input
                  id="invoice-date"
                  aria-invalid={!!errors.invoiceDate}
                  type="date"
                  {...register("invoiceDate")}
                />
                {errors.invoiceDate ? (
                  <p className="text-sm text-error">
                    {errors.invoiceDate.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoice-due-date">Due Date</Label>
                <Input
                  id="invoice-due-date"
                  aria-invalid={!!errors.dueDate}
                  type="date"
                  {...register("dueDate")}
                />
                {errors.dueDate ? (
                  <p className="text-sm text-error">{errors.dueDate.message}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-notes">Notes</Label>
              <textarea
                id="invoice-notes"
                className={textareaClassName}
                placeholder="Payment terms or finance notes"
                rows={5}
                {...register("notes")}
              />
              {errors.notes ? (
                <p className="text-sm text-error">{errors.notes.message}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border p-5 sm:flex-row sm:justify-end">
            <Button
              disabled={isPending}
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              disabled={!isEditing && eligibleOrders.length === 0}
              isLoading={isPending}
              type="submit"
            >
              {isEditing ? "Save changes" : "Create invoice"}
            </Button>
          </div>
        </form>
      </aside>
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
