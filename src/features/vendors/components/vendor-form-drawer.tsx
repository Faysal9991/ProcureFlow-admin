"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { useCreateVendor, useUpdateVendor } from "../hooks";
import { vendorFormSchema, type VendorFormValues } from "../schemas";
import type { Vendor } from "../types";
import {
  getVendorMutationError,
  getVendorStatus,
} from "../utils";

type VendorFormDrawerProps = {
  isOpen: boolean;
  vendor: Vendor | null;
  onClose: () => void;
};

const emptyValues: VendorFormValues = {
  address: "",
  contactPerson: "",
  email: "",
  name: "",
  phone: "",
  status: "ACTIVE",
};

export function VendorFormDrawer({
  isOpen,
  vendor,
  onClose,
}: VendorFormDrawerProps) {
  const [apiError, setApiError] = useState("");
  const createMutation = useCreateVendor();
  const updateMutation = useUpdateVendor();
  const isEditing = !!vendor;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const title = isEditing ? "Edit Vendor" : "Create Vendor";
  const description = isEditing
    ? "Update vendor contact details and status."
    : "Create a vendor for purchase orders, RFQs, and invoices.";
  const defaultValues = useMemo<VendorFormValues>(
    () =>
      vendor
        ? {
            address: vendor.address ?? "",
            contactPerson: vendor.contactPerson ?? "",
            email: vendor.email ?? "",
            name: vendor.name,
            phone: vendor.phone ?? "",
            status: getVendorStatus(vendor.status),
          }
        : emptyValues,
    [vendor],
  );

  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<VendorFormValues>({
    defaultValues,
    resolver: zodResolver(vendorFormSchema),
  });

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

  function normalizePayload(values: VendorFormValues) {
    return {
      address: values.address.trim(),
      contactPerson: values.contactPerson.trim(),
      email: values.email.trim(),
      name: values.name.trim(),
      phone: values.phone.trim(),
      status: values.status,
    };
  }

  function onSubmit(values: VendorFormValues) {
    setApiError("");

    if (vendor) {
      updateMutation.mutate(
        {
          id: vendor.id,
          payload: normalizePayload(values),
        },
        {
          onError: (error) => {
            setApiError(getVendorMutationError(getApiErrorMessage(error)));
          },
          onSuccess: () => {
            setApiError("");
            onClose();
          },
        },
      );
      return;
    }

    createMutation.mutate(normalizePayload(values), {
      onError: (error) => {
        setApiError(getVendorMutationError(getApiErrorMessage(error)));
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
        aria-label="Close vendor form"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col bg-surface shadow-2xl">
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

            <div className="space-y-2">
              <Label htmlFor="vendor-name">Name</Label>
              <Input
                id="vendor-name"
                aria-invalid={!!errors.name}
                placeholder="Rahman Traders"
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-sm text-error">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor-contact-person">Contact Person</Label>
              <Input
                id="vendor-contact-person"
                aria-invalid={!!errors.contactPerson}
                placeholder="Hasan Rahman"
                {...register("contactPerson")}
              />
              {errors.contactPerson ? (
                <p className="text-sm text-error">
                  {errors.contactPerson.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="vendor-phone">Phone</Label>
                <Input
                  id="vendor-phone"
                  aria-invalid={!!errors.phone}
                  placeholder="01700000000"
                  {...register("phone")}
                />
                {errors.phone ? (
                  <p className="text-sm text-error">{errors.phone.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor-email">Email</Label>
                <Input
                  id="vendor-email"
                  aria-invalid={!!errors.email}
                  placeholder="sales@vendor.com"
                  type="email"
                  {...register("email")}
                />
                {errors.email ? (
                  <p className="text-sm text-error">{errors.email.message}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor-address">Address</Label>
              <textarea
                id="vendor-address"
                className={textareaClassName}
                placeholder="House, road, city"
                rows={5}
                {...register("address")}
              />
              {errors.address ? (
                <p className="text-sm text-error">{errors.address.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor-status">Status</Label>
              <select
                id="vendor-status"
                className={selectClassName}
                {...register("status")}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              {errors.status ? (
                <p className="text-sm text-error">{errors.status.message}</p>
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
            <Button isLoading={isPending} type="submit">
              {isEditing ? "Save changes" : "Create vendor"}
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
);
