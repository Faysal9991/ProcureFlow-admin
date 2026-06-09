"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { useAddInvoicePayment } from "../hooks";
import { paymentFormSchema, type PaymentFormValues } from "../schemas";
import type { Invoice } from "../types";
import {
  formatCurrency,
  getInvoiceMutationError,
  normalizeOptionalString,
  paymentMethods,
} from "../utils";

type AddPaymentDialogProps = {
  invoice: Invoice | null;
  onClose: () => void;
};

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function AddPaymentDialog({ invoice, onClose }: AddPaymentDialogProps) {
  const [apiError, setApiError] = useState("");
  const mutation = useAddInvoicePayment();
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<PaymentFormValues>({
    defaultValues: {
      amount: invoice?.remainingAmount ?? 0,
      notes: "",
      paymentDate: todayInputValue(),
      paymentMethod: "BANK_TRANSFER",
      referenceNumber: "",
    },
    resolver: zodResolver(paymentFormSchema),
  });

  useEffect(() => {
    if (invoice) {
      reset({
        amount: invoice.remainingAmount,
        notes: "",
        paymentDate: todayInputValue(),
        paymentMethod: "BANK_TRANSFER",
        referenceNumber: "",
      });
    }
  }, [invoice, reset]);

  if (!invoice) {
    return null;
  }

  const selectedInvoice = invoice;

  function handleClose() {
    if (!mutation.isPending) {
      setApiError("");
      onClose();
    }
  }

  function onSubmit(values: PaymentFormValues) {
    setApiError("");
    mutation.mutate(
      {
        id: selectedInvoice.id,
        payload: {
          amount: Number(values.amount),
          notes: normalizeOptionalString(values.notes),
          paymentDate: normalizeOptionalString(values.paymentDate),
          paymentMethod: normalizeOptionalString(values.paymentMethod),
          referenceNumber: normalizeOptionalString(values.referenceNumber),
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
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close payment form"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-xl rounded-lg border border-border bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Add payment
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedInvoice.invoiceNumber} has{" "}
                {formatCurrency(selectedInvoice.remainingAmount)} remaining.
              </p>
            </div>
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5 p-5">
            {apiError ? (
              <div className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
                {apiError}
              </div>
            ) : null}

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="payment-amount">Amount</Label>
                <Input
                  id="payment-amount"
                  aria-invalid={!!errors.amount}
                  min="0"
                  step="0.01"
                  type="number"
                  {...register("amount", { valueAsNumber: true })}
                />
                {errors.amount ? (
                  <p className="text-sm text-error">{errors.amount.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-date">Payment Date</Label>
                <Input
                  id="payment-date"
                  aria-invalid={!!errors.paymentDate}
                  type="date"
                  {...register("paymentDate")}
                />
                {errors.paymentDate ? (
                  <p className="text-sm text-error">
                    {errors.paymentDate.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="payment-method">Method</Label>
                <select
                  id="payment-method"
                  className={selectClassName}
                  {...register("paymentMethod")}
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
                {errors.paymentMethod ? (
                  <p className="text-sm text-error">
                    {errors.paymentMethod.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-reference">Reference No</Label>
                <Input
                  id="payment-reference"
                  aria-invalid={!!errors.referenceNumber}
                  placeholder="Bank or receipt reference"
                  {...register("referenceNumber")}
                />
                {errors.referenceNumber ? (
                  <p className="text-sm text-error">
                    {errors.referenceNumber.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-notes">Notes</Label>
              <textarea
                id="payment-notes"
                className={textareaClassName}
                placeholder="Payment notes"
                rows={4}
                {...register("notes")}
              />
              {errors.notes ? (
                <p className="text-sm text-error">{errors.notes.message}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border p-5 sm:flex-row sm:justify-end">
            <Button
              disabled={mutation.isPending}
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button isLoading={mutation.isPending} type="submit">
              Add payment
            </Button>
          </div>
        </form>
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

const selectClassName = cn(
  "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors",
  "focus:border-primary focus:ring-4 focus:ring-ring",
);
