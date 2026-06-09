"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { PageHeader } from "@/components/shared";
import { Button, getButtonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePurchaseRequest, usePurchaseRequests } from "@/features/purchase-requests/hooks";
import { getApiErrorMessage } from "@/lib/api/client";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/store/auth-store";
import { useState } from "react";
import { useCreateRFQ } from "../hooks";
import { rfqFormSchema, type RFQFormValues } from "../schemas";
import {
  canManageRFQs,
  formatCurrency,
  getRFQMutationError,
  normalizeOptionalString,
} from "../utils";

const defaultValues: RFQFormValues = {
  dueDate: "",
  notes: "",
  purchaseRequestId: "",
};

export function RFQFormPage() {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const canManage = canManageRFQs(currentUser?.role);
  const [apiError, setApiError] = useState("");
  const createMutation = useCreateRFQ();
  const {
    formState: { errors },
    handleSubmit,
    register,
    control,
  } = useForm<RFQFormValues>({
    defaultValues,
    resolver: zodResolver(rfqFormSchema),
  });
  const purchaseRequestId = useWatch({ control, name: "purchaseRequestId" });
  const requestsQuery = usePurchaseRequests(
    { limit: 50, page: 1, status: "APPROVED" },
    "company",
    canManage,
  );
  const selectedRequestQuery = usePurchaseRequest(
    purchaseRequestId ?? "",
    canManage && !!purchaseRequestId,
  );
  const requests = requestsQuery.data?.items ?? [];
  const selectedRequest = selectedRequestQuery.data;

  if (!canManage) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Procurement" title="Create RFQ">
          Create RFQs from approved purchase requests.
        </PageHeader>
        <Card>
          <CardContent className="p-8">
            <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
              <div>
                <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                  <ShieldAlert className="size-5" />
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  RFQ creation unavailable
                </p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Only company admins and procurement users can create RFQs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function submit(values: RFQFormValues) {
    setApiError("");

    try {
      const created = await createMutation.mutateAsync({
        dueDate: values.dueDate,
        notes: normalizeOptionalString(values.notes),
        purchaseRequestId: values.purchaseRequestId,
      });
      router.push(`/rfqs/${created.id}`);
    } catch (error) {
      setApiError(getRFQMutationError(getApiErrorMessage(error)));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <Link
            className={getButtonClassName({ variant: "outline" })}
            href={ROUTES.rfqs}
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
        }
        eyebrow="Procurement"
        title="Create RFQ"
      >
        Start an RFQ from an approved purchase request.
      </PageHeader>

      <form className="space-y-6" onSubmit={handleSubmit(submit)}>
        <Card>
          <CardContent className="space-y-5 p-5">
            {apiError ? (
              <div className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
                {apiError}
              </div>
            ) : null}

            <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
              <div className="space-y-2">
                <Label htmlFor="rfq-purchase-request">
                  Approved Purchase Request
                </Label>
                <select
                  id="rfq-purchase-request"
                  className={selectClassName}
                  disabled={createMutation.isPending}
                  {...register("purchaseRequestId")}
                >
                  <option value="">Select approved request</option>
                  {requests.map((request) => (
                    <option key={request.id} value={request.id}>
                      {request.title}
                    </option>
                  ))}
                </select>
                {errors.purchaseRequestId ? (
                  <p className="text-sm text-error">
                    {errors.purchaseRequestId.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rfq-due-date">Due Date</Label>
                <Input
                  id="rfq-due-date"
                  disabled={createMutation.isPending}
                  type="date"
                  {...register("dueDate")}
                />
                {errors.dueDate ? (
                  <p className="text-sm text-error">{errors.dueDate.message}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rfq-notes">Notes</Label>
              <textarea
                id="rfq-notes"
                className={textareaClassName}
                disabled={createMutation.isPending}
                placeholder="Optional vendor instructions"
                rows={4}
                {...register("notes")}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedRequestQuery.isLoading ? (
              <div className="h-24 rounded-lg bg-muted" />
            ) : null}
            {selectedRequest?.items?.length ? (
              selectedRequest.items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-[1fr_120px_160px]"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.itemName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.description || "No description"}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} {item.unit}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {formatCurrency(item.estimatedTotalPrice)}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
                Select an approved request to preview RFQ items.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button isLoading={createMutation.isPending} type="submit">
            <Save className="size-4" />
            Create RFQ
          </Button>
        </div>
      </form>
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
