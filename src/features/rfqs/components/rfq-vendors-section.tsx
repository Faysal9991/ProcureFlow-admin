"use client";

import { Plus, Store } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api/client";
import { useAddRFQVendors } from "../hooks";
import type { RFQ, RFQVendor } from "../types";
import { getRFQMutationError } from "../utils";

type RFQVendorsSectionProps = {
  canManage: boolean;
  rfq: RFQ;
  vendors: { id: string; name: string; status: string }[];
};

export function RFQVendorsSection({
  canManage,
  rfq,
  vendors,
}: RFQVendorsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const availableVendors = useMemo(
    () => {
      const existingVendorIds = new Set(
        (rfq.vendors ?? []).map((entry) => entry.vendor.id),
      );
      return vendors.filter((vendor) => !existingVendorIds.has(vendor.id));
    },
    [rfq.vendors, vendors],
  );

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Invited Vendors</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Vendors must be invited before quotations can be entered.
            </p>
          </div>
          {canManage && rfq.status === "DRAFT" ? (
            <Button onClick={() => setIsOpen(true)}>
              <Plus className="size-4" />
              Add Vendors
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {(rfq.vendors ?? []).length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
              No vendors invited yet.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {(rfq.vendors ?? []).map((entry) => (
                <VendorCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {isOpen ? (
        <AddVendorsDialog
          availableVendors={availableVendors}
          rfq={rfq}
          onClose={() => setIsOpen(false)}
        />
      ) : null}
    </>
  );
}

function VendorCard({ entry }: { entry: RFQVendor }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Store className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {entry.vendor.name}
          </p>
          <Badge
            className="mt-2"
            variant={entry.vendor.status === "ACTIVE" ? "success" : "warning"}
          >
            {entry.vendor.status}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function AddVendorsDialog({
  availableVendors,
  rfq,
  onClose,
}: {
  availableVendors: { id: string; name: string }[];
  rfq: RFQ;
  onClose: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [apiError, setApiError] = useState("");
  const mutation = useAddRFQVendors();

  function toggleVendor(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selected) => selected !== id)
        : [...current, id],
    );
  }

  function submit() {
    setApiError("");
    mutation.mutate(
      { id: rfq.id, payload: { vendorIds: selectedIds } },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close add vendors"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-lg border border-border bg-surface p-5 shadow-2xl">
        <h2 className="text-base font-semibold text-foreground">
          Add vendors
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Select active vendors to invite to {rfq.rfqNumber}.
        </p>

        {apiError ? (
          <div className="mt-4 rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
            {apiError}
          </div>
        ) : null}

        <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
          {availableVendors.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
              No more active vendors are available to add.
            </div>
          ) : (
            availableVendors.map((vendor) => (
              <label
                key={vendor.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3"
              >
                <input
                  checked={selectedIds.includes(vendor.id)}
                  type="checkbox"
                  onChange={() => toggleVendor(vendor.id)}
                />
                <span className="text-sm font-medium text-foreground">
                  {vendor.name}
                </span>
              </label>
            ))
          )}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            disabled={mutation.isPending}
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            disabled={selectedIds.length === 0}
            isLoading={mutation.isPending}
            type="button"
            onClick={submit}
          >
            Add Vendors
          </Button>
        </div>
      </div>
    </div>
  );
}
