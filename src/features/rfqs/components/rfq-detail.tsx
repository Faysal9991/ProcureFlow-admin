"use client";

import Link from "next/link";
import { ArrowLeft, FilePlus2, PlayCircle, Plus, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button, getButtonClassName } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCreatePurchaseOrder } from "@/features/purchase-orders/hooks";
import { useVendors } from "@/features/vendors/hooks";
import { getApiErrorMessage } from "@/lib/api/client";
import { ROUTES } from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";
import { useRFQ, useRFQComparison } from "../hooks";
import type { ComparisonQuotation, RFQAction } from "../types";
import {
  canAddQuotation,
  canAddVendors,
  canCancelRFQ,
  canCompareRFQs,
  canCreatePOFromRFQ,
  canManageRFQs,
  canOpenRFQ,
  canReadRFQs,
  canSelectQuotation,
  formatCurrency,
  formatRFQDate,
  getRFQMutationError,
  getRFQStatusLabel,
  getRFQStatusVariant,
} from "../utils";
import { QuotationComparisonTable } from "./quotation-comparison-table";
import { QuotationForm } from "./quotation-form";
import { RFQActionDialog } from "./rfq-action-dialog";
import { RFQVendorsSection } from "./rfq-vendors-section";

type RFQDetailPageProps = {
  rfqId: string;
};

export function RFQDetailPage({ rfqId }: RFQDetailPageProps) {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const role = currentUser?.role;
  const canRead = canReadRFQs(role);
  const canManage = canManageRFQs(role);
  const rfqQuery = useRFQ(rfqId, canRead);
  const rfq = rfqQuery.data;
  const comparisonQuery = useRFQComparison(
    rfqId,
    canRead && canCompareRFQs(role) && !!rfq && rfq.status !== "DRAFT",
  );
  const vendorsQuery = useVendors({ limit: 100, page: 1, status: "ACTIVE" }, canManage);
  const createPOMutation = useCreatePurchaseOrder();
  const [action, setAction] = useState<RFQAction | null>(null);
  const [selectedQuotation, setSelectedQuotation] =
    useState<ComparisonQuotation | null>(null);
  const [isQuotationFormOpen, setIsQuotationFormOpen] = useState(false);
  const [poError, setPOError] = useState("");
  const vendors = vendorsQuery.data?.items ?? [];

  if (!canRead) {
    return (
      <BlockedState message="RFQ details are available to company admins, procurement, finance, and managers." />
    );
  }

  if (rfqQuery.isLoading) {
    return <DetailSkeleton />;
  }

  if (rfqQuery.isError || !rfq) {
    return (
      <BlockedState
        message={getApiErrorMessage(rfqQuery.error)}
        title="RFQ unavailable"
      />
    );
  }

  function openAction(nextAction: RFQAction, quotation?: ComparisonQuotation) {
    setAction(nextAction);
    setSelectedQuotation(quotation ?? null);
  }

  function closeAction() {
    setAction(null);
    setSelectedQuotation(null);
  }

  async function createPOFromSelectedQuotation() {
    if (!rfq?.selectedQuotationId) {
      return;
    }
    setPOError("");
    try {
      const order = await createPOMutation.mutateAsync({
        quotationId: rfq.selectedQuotationId,
      });
      router.push(`/purchase-orders/${order.id}`);
    } catch (error) {
      setPOError(getRFQMutationError(getApiErrorMessage(error)));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        actions={
          <>
            <Link
              className={getButtonClassName({ variant: "outline" })}
              href={ROUTES.rfqs}
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
            {canOpenRFQ(rfq, role) ? (
              <Button onClick={() => openAction("open")}>
                <PlayCircle className="size-4" />
                Open RFQ
              </Button>
            ) : null}
            {canAddQuotation(rfq, role) ? (
              <Button onClick={() => setIsQuotationFormOpen(true)}>
                <Plus className="size-4" />
                Add Quotation
              </Button>
            ) : null}
            {canCancelRFQ(rfq, role) ? (
              <Button variant="danger" onClick={() => openAction("cancel")}>
                Cancel RFQ
              </Button>
            ) : null}
            {canCreatePOFromRFQ(rfq, role) ? (
              <Button
                isLoading={createPOMutation.isPending}
                onClick={createPOFromSelectedQuotation}
              >
                <FilePlus2 className="size-4" />
                Create PO
              </Button>
            ) : null}
          </>
        }
        eyebrow="RFQ"
        title={rfq.rfqNumber}
      >
        {rfq.purchaseRequest.title}
      </PageHeader>

      {poError ? (
        <div className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
          {poError}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-4">
        <SummaryTile label="Status">
          <Badge variant={getRFQStatusVariant(rfq.status)}>
            {getRFQStatusLabel(rfq.status)}
          </Badge>
        </SummaryTile>
        <SummaryTile label="Department">
          {rfq.purchaseRequest.department.name}
        </SummaryTile>
        <SummaryTile label="Due Date">{formatRFQDate(rfq.dueDate)}</SummaryTile>
        <SummaryTile label="Quotations">
          {(rfq.quotations ?? []).length}
        </SummaryTile>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>RFQ Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Estimated Unit</TableHead>
                  <TableHead>Estimated Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(rfq.items ?? []).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="min-w-56">
                      <p className="font-medium">{item.itemName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.description || "No description"}
                      </p>
                    </TableCell>
                    <TableCell>
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(item.estimatedUnitPrice)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(item.estimatedTotalPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>RFQ Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetadataRow label="Request">
              {rfq.purchaseRequest.title}
            </MetadataRow>
            <MetadataRow label="Created By">
              {rfq.createdBy.name} ({rfq.createdBy.role})
            </MetadataRow>
            <MetadataRow label="Created">
              {formatRFQDate(rfq.createdAt)}
            </MetadataRow>
            <MetadataRow label="Opened">
              {formatRFQDate(rfq.openedAt)}
            </MetadataRow>
            <MetadataRow label="Selected">
              {formatRFQDate(rfq.selectedAt)}
            </MetadataRow>
            <MetadataRow label="Cancelled">
              {formatRFQDate(rfq.cancelledAt)}
            </MetadataRow>
            <MetadataRow label="Selected Quotation">
              {rfq.selectedQuotationId ?? "Not selected"}
            </MetadataRow>
            <div>
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                {rfq.notes || "No notes added."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <RFQVendorsSection
        canManage={canAddVendors(rfq, role)}
        rfq={rfq}
        vendors={vendors}
      />

      <QuotationComparisonTable
        canSelect={canSelectQuotation(rfq, role)}
        comparison={comparisonQuery.data}
        error={comparisonQuery.error}
        isError={comparisonQuery.isError}
        isLoading={comparisonQuery.isLoading}
        onSelect={(quotation) => openAction("select", quotation)}
      />

      <QuotationForm
        isOpen={isQuotationFormOpen}
        rfq={rfq}
        onClose={() => setIsQuotationFormOpen(false)}
      />

      <RFQActionDialog
        action={action}
        quotation={selectedQuotation}
        rfq={rfq}
        onClose={closeAction}
      />
    </div>
  );
}

function SummaryTile({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-card">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-2 text-base font-semibold text-foreground">
        {children}
      </div>
    </div>
  );
}

function MetadataRow({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="max-w-64 text-right text-sm font-medium text-foreground">
        {children}
      </span>
    </div>
  );
}

function BlockedState({
  message,
  title = "RFQ access unavailable",
}: {
  message: string;
  title?: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Procurement" title="RFQ">
        Manage vendor invitations and quotation comparison.
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-20 rounded-lg bg-muted" />
      <div className="grid gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 rounded-lg bg-muted" />
        ))}
      </div>
      <div className="h-96 rounded-lg bg-muted" />
    </div>
  );
}
