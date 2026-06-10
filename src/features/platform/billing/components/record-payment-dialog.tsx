"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { useRecordPlatformBillingPayment } from "../hooks";
import {
  recordPlatformBillingPaymentSchema,
  type RecordPlatformBillingPaymentValues,
} from "../schemas";
import type { PlatformBillingInvoice } from "../types";
import {
  formatBillingMoney,
  getBillingMutationError,
  getTodayInputDate,
  normalizeOptional,
} from "../utils";

type RecordPaymentDialogProps = {
  invoice: PlatformBillingInvoice | null;
  onClose: () => void;
};

export function RecordPaymentDialog({
  invoice,
  onClose,
}: RecordPaymentDialogProps) {
  const [apiError, setApiError] = useState("");
  const mutation = useRecordPlatformBillingPayment();
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<RecordPlatformBillingPaymentValues>({
    defaultValues: {
      amount: 0,
      notes: "",
      paymentDate: getTodayInputDate(),
      paymentMethod: "BANK_TRANSFER",
      referenceNumber: "",
    },
    resolver: zodResolver(recordPlatformBillingPaymentSchema),
  });

  useEffect(() => {
    if (invoice) {
      reset({
        amount: Number(invoice.remainingAmount ?? 0),
        notes: "",
        paymentDate: getTodayInputDate(),
        paymentMethod: "BANK_TRANSFER",
        referenceNumber: "",
      });
    }
  }, [invoice, reset]);

  if (!invoice) {
    return null;
  }

  function handleClose() {
    if (!mutation.isPending) {
      setApiError("");
      onClose();
    }
  }

  function onSubmit(values: RecordPlatformBillingPaymentValues) {
    if (!invoice) {
      return;
    }
    setApiError("");
    mutation.mutate(
      {
        invoiceId: invoice.id,
        payload: {
          amount: values.amount,
          notes: normalizeOptional(values.notes),
          paymentDate: normalizeOptional(values.paymentDate),
          paymentMethod: values.paymentMethod.trim(),
          referenceNumber: normalizeOptional(values.referenceNumber),
        },
      },
      {
        onError: (error) => {
          setApiError(
            getBillingMutationError(getApiErrorMessage(error)),
          );
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
        aria-label="Close payment dialog"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <form
        className="relative w-full max-w-md rounded-lg border border-border bg-surface p-5 shadow-2xl"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CreditCard className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Record Payment
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {invoice.invoiceNumber} has{" "}
              {formatBillingMoney(invoice.remainingAmount)} remaining due.
            </p>
          </div>
        </div>

        {apiError ? (
          <div className="mt-4 rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
            {apiError}
          </div>
        ) : null}

        <div className="mt-5 space-y-4">
          <Field error={errors.amount?.message} id="payment-amount" label="Amount">
            <Input
              id="payment-amount"
              aria-invalid={!!errors.amount}
              min={0}
              step="0.01"
              type="number"
              {...register("amount", { valueAsNumber: true })}
            />
          </Field>
          <Field
            error={errors.paymentMethod?.message}
            id="payment-method"
            label="Payment Method"
          >
            <select
              id="payment-method"
              className={selectClassName}
              {...register("paymentMethod")}
            >
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="MOBILE_BANKING">Mobile Banking</option>
              <option value="OTHER">Other</option>
            </select>
          </Field>
          <Field
            error={errors.paymentDate?.message}
            id="payment-date"
            label="Payment Date"
          >
            <Input id="payment-date" type="date" {...register("paymentDate")} />
          </Field>
          <Field
            error={errors.referenceNumber?.message}
            id="payment-reference"
            label="Reference Number"
          >
            <Input
              id="payment-reference"
              placeholder="Optional reference"
              {...register("referenceNumber")}
            />
          </Field>
          <Field error={errors.notes?.message} id="payment-notes" label="Notes">
            <textarea
              id="payment-notes"
              className={textareaClassName}
              rows={3}
              {...register("notes")}
            />
          </Field>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            disabled={mutation.isPending}
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button isLoading={mutation.isPending} type="submit">
            Record Payment
          </Button>
        </div>
      </form>
    </div>
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
);

const textareaClassName = cn(
  "flex w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground",
  "focus:border-primary focus:ring-4 focus:ring-ring",
);
