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
import { useCreateQuotation } from "../hooks";
import {
  quotationFormSchema,
  type QuotationFormValues,
} from "../schemas";
import type { RFQ } from "../types";
import {
  calculateQuotationTotal,
  formatCurrency,
  getRFQMutationError,
  normalizeOptionalString,
} from "../utils";

type QuotationFormProps = {
  isOpen: boolean;
  rfq: RFQ;
  onClose: () => void;
};

export function QuotationForm({ isOpen, rfq, onClose }: QuotationFormProps) {
  const [apiError, setApiError] = useState("");
  const mutation = useCreateQuotation();
  const quotedVendorIds = new Set(
    (rfq.quotations ?? []).map((quotation) => quotation.vendor.id),
  );
  const availableVendors = (rfq.vendors ?? []).filter(
    (entry) => !quotedVendorIds.has(entry.vendor.id),
  );
  const defaultValues = useMemo<QuotationFormValues>(
    () => ({
      items: (rfq.items ?? []).map((item) => ({
        itemName: item.itemName,
        quantity: item.quantity,
        rfqItemId: item.id,
        unit: item.unit,
        unitPrice: item.estimatedUnitPrice,
      })),
      notes: "",
      quotationDate: new Date().toISOString().slice(0, 10),
      quotationNumber: "",
      validUntil: "",
      vendorId: "",
    }),
    [rfq.items],
  );
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    control,
  } = useForm<QuotationFormValues>({
    defaultValues,
    resolver: zodResolver(quotationFormSchema),
  });
  const watchedItems = useWatch({ control, name: "items" }) ?? [];
  const total = calculateQuotationTotal(watchedItems);

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
  }, [defaultValues, isOpen, reset]);

  if (!isOpen) {
    return null;
  }

  function handleClose() {
    if (!mutation.isPending) {
      setApiError("");
      onClose();
    }
  }

  function submit(values: QuotationFormValues) {
    setApiError("");
    mutation.mutate(
      {
        id: rfq.id,
        payload: {
          items: values.items.map((item) => ({
            rfqItemId: item.rfqItemId,
            unitPrice: Number(item.unitPrice),
          })),
          notes: normalizeOptionalString(values.notes),
          quotationDate: normalizeOptionalString(values.quotationDate),
          quotationNumber: normalizeOptionalString(values.quotationNumber),
          validUntil: normalizeOptionalString(values.validUntil),
          vendorId: values.vendorId,
        },
      },
      {
        onError: (error) => {
          setApiError(getRFQMutationError(getApiErrorMessage(error)));
        },
        onSuccess: () => {
          setApiError("");
          onClose();
        },
      },
    );
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close quotation form"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-3xl flex-col bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Add Quotation
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter vendor pricing for {rfq.rfqNumber}.
            </p>
          </div>
          <Button
            aria-label="Close"
            disabled={mutation.isPending}
            size="icon"
            variant="ghost"
            onClick={handleClose}
          >
            <X className="size-5" />
          </Button>
        </div>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit(submit)}
        >
          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            {apiError ? (
              <div className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
                {apiError}
              </div>
            ) : null}

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quotation-vendor">Vendor</Label>
                <select
                  id="quotation-vendor"
                  className={selectClassName}
                  {...register("vendorId")}
                >
                  <option value="">Select invited vendor</option>
                  {availableVendors.map((entry) => (
                    <option key={entry.vendor.id} value={entry.vendor.id}>
                      {entry.vendor.name}
                    </option>
                  ))}
                </select>
                {errors.vendorId ? (
                  <p className="text-sm text-error">
                    {errors.vendorId.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quotation-number">Quotation Number</Label>
                <Input
                  id="quotation-number"
                  placeholder="Q-2026-001"
                  {...register("quotationNumber")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quotation-date">Quotation Date</Label>
                <Input
                  id="quotation-date"
                  type="date"
                  {...register("quotationDate")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quotation-valid-until">Valid Until</Label>
                <Input
                  id="quotation-valid-until"
                  type="date"
                  {...register("validUntil")}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Quotation Items
                </h3>
                <p className="text-sm font-medium text-foreground">
                  Total {formatCurrency(total)}
                </p>
              </div>

              {watchedItems.map((item, index) => (
                <div
                  key={item.rfqItemId}
                  className="grid gap-3 rounded-lg border border-border p-4 lg:grid-cols-[1fr_160px_160px]"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.itemName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} {item.unit}
                    </p>
                    <input type="hidden" {...register(`items.${index}.rfqItemId`)} />
                    <input type="hidden" {...register(`items.${index}.itemName`)} />
                    <input type="hidden" {...register(`items.${index}.quantity`)} />
                    <input type="hidden" {...register(`items.${index}.unit`)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`quotation-unit-price-${index}`}>
                      Unit Price
                    </Label>
                    <Input
                      id={`quotation-unit-price-${index}`}
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
                    <p className="text-sm text-muted-foreground">Line Total</p>
                    <p className="mt-2 text-base font-semibold text-foreground">
                      {formatCurrency(Number(item.quantity) * Number(item.unitPrice))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quotation-notes">Notes</Label>
              <textarea
                id="quotation-notes"
                className={textareaClassName}
                placeholder="Optional quotation notes"
                rows={4}
                {...register("notes")}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-foreground">
              Total {formatCurrency(total)}
            </p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                disabled={mutation.isPending}
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button isLoading={mutation.isPending} type="submit">
                Save Quotation
              </Button>
            </div>
          </div>
        </form>
      </aside>
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
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
);
