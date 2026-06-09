"use client";

import { Plus, Trash2 } from "lucide-react";
import type {
  Control,
  FieldErrors,
  UseFormRegister,
} from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import type { PurchaseRequestFormValues } from "../schemas";
import {
  calculateItemTotal,
  calculateRequestTotal,
  formatCurrency,
} from "../utils";

type PurchaseRequestItemsFormProps = {
  control: Control<PurchaseRequestFormValues>;
  errors: FieldErrors<PurchaseRequestFormValues>;
  isDisabled?: boolean;
  register: UseFormRegister<PurchaseRequestFormValues>;
  watchedItems: PurchaseRequestFormValues["items"];
};

const emptyItem = {
  description: "",
  estimatedUnitPrice: 0,
  itemName: "",
  quantity: 1,
  unit: "pcs",
};

export function PurchaseRequestItemsForm({
  control,
  errors,
  isDisabled = false,
  register,
  watchedItems,
}: PurchaseRequestItemsFormProps) {
  const { append, fields, remove } = useFieldArray({
    control,
    name: "items",
  });
  const requestTotal = calculateRequestTotal(watchedItems ?? []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Items</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add every requested item with estimated quantity and price.
          </p>
        </div>
        <Button
          disabled={isDisabled}
          type="button"
          variant="outline"
          onClick={() => append(emptyItem)}
        >
          <Plus className="size-4" />
          Add item
        </Button>
      </div>

      {typeof errors.items?.message === "string" ? (
        <div className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
          {errors.items.message}
        </div>
      ) : null}

      <div className="space-y-4">
        {fields.map((field, index) => {
          const item = watchedItems?.[index];
          const itemTotal = calculateItemTotal(
            item?.quantity,
            item?.estimatedUnitPrice,
          );

          return (
            <div
              key={field.id}
              className="rounded-lg border border-border bg-background p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Item {index + 1}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Item total: {formatCurrency(itemTotal)}
                  </p>
                </div>
                <Button
                  aria-label={`Remove item ${index + 1}`}
                  disabled={isDisabled || fields.length <= 1}
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_110px_120px_150px]">
                <div className="space-y-2">
                  <Label htmlFor={`item-${index}-name`}>Item Name</Label>
                  <Input
                    id={`item-${index}-name`}
                    aria-invalid={!!errors.items?.[index]?.itemName}
                    disabled={isDisabled}
                    placeholder="Laptop"
                    {...register(`items.${index}.itemName`)}
                  />
                  {errors.items?.[index]?.itemName ? (
                    <p className="text-sm text-error">
                      {errors.items[index]?.itemName?.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`item-${index}-quantity`}>Quantity</Label>
                  <Input
                    id={`item-${index}-quantity`}
                    aria-invalid={!!errors.items?.[index]?.quantity}
                    disabled={isDisabled}
                    min="0"
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
                  <Label htmlFor={`item-${index}-unit`}>Unit</Label>
                  <Input
                    id={`item-${index}-unit`}
                    aria-invalid={!!errors.items?.[index]?.unit}
                    disabled={isDisabled}
                    placeholder="pcs"
                    {...register(`items.${index}.unit`)}
                  />
                  {errors.items?.[index]?.unit ? (
                    <p className="text-sm text-error">
                      {errors.items[index]?.unit?.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`item-${index}-estimated-unit-price`}>
                    Unit Price
                  </Label>
                  <Input
                    id={`item-${index}-estimated-unit-price`}
                    aria-invalid={!!errors.items?.[index]?.estimatedUnitPrice}
                    disabled={isDisabled}
                    min="0"
                    step="0.01"
                    type="number"
                    {...register(`items.${index}.estimatedUnitPrice`, {
                      valueAsNumber: true,
                    })}
                  />
                  {errors.items?.[index]?.estimatedUnitPrice ? (
                    <p className="text-sm text-error">
                      {errors.items[index]?.estimatedUnitPrice?.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor={`item-${index}-description`}>Description</Label>
                <textarea
                  id={`item-${index}-description`}
                  className={textareaClassName}
                  disabled={isDisabled}
                  placeholder="Specification, brand, or notes"
                  rows={3}
                  {...register(`items.${index}.description`)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Request Estimated Total
          </p>
          <p className="text-xs text-muted-foreground">
            Sum of quantity multiplied by estimated unit price.
          </p>
        </div>
        <p className="text-lg font-semibold text-foreground">
          {formatCurrency(requestTotal)}
        </p>
      </div>
    </div>
  );
}

const textareaClassName = cn(
  "flex w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors",
  "placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-ring",
  "disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-70",
);
