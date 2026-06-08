import type { ComponentType } from "react";
import {
  AlertTriangle,
  BadgeDollarSign,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  FileClock,
  FileText,
  ReceiptText,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import type { DashboardSummary } from "../types";
import { formatCurrency, formatNumber, getSummaryRole } from "../utils";
import { getSectionErrorMessage, SectionState } from "./section-state";

type SummaryCardItem = {
  formatter?: "currency" | "number";
  icon: ComponentType<{ className?: string }>;
  label: string;
  tone: string;
  value: number;
};

type SummaryCardsProps = {
  error?: unknown;
  fallbackRole?: string;
  isError?: boolean;
  isLoading: boolean;
  summary?: DashboardSummary;
};

export function SummaryCards({
  error,
  fallbackRole,
  isError = false,
  isLoading,
  summary,
}: SummaryCardsProps) {
  const cards = getSummaryCards(summary, fallbackRole);

  if (isLoading) {
    return (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="h-4 w-28 rounded-md bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 rounded-md bg-muted" />
              <div className="mt-2 h-4 w-32 rounded-md bg-muted" />
            </CardContent>
          </Card>
        ))}
      </section>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-5">
          <SectionState
            message={getSectionErrorMessage(error)}
            title="Summary metrics unavailable"
            type="error"
          />
        </CardContent>
      </Card>
    );
  }

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground">
          Summary metrics are not available for this role.
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const value =
          card.formatter === "currency"
            ? formatCurrency(card.value)
            : formatNumber(card.value);

        return (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
              <CardDescription>{card.label}</CardDescription>
              <Icon className={`size-5 ${card.tone}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-foreground">
                {value}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Current filter range
              </p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}

function getSummaryCards(
  summary?: DashboardSummary,
  fallbackRole?: string,
): SummaryCardItem[] {
  const role = getSummaryRole(summary, fallbackRole);

  if (role === "COMPANY_ADMIN" && summary?.admin) {
    return [
      card("Total Requests", summary.admin.totalRequests, FileText, "text-info"),
      card(
        "Pending Approvals",
        summary.admin.pendingApprovals,
        Clock3,
        "text-warning",
      ),
      card(
        "Total PO Amount",
        summary.admin.totalPOAmount,
        ShoppingCart,
        "text-primary",
        "currency",
      ),
      card(
        "Total Invoice Amount",
        summary.admin.totalInvoiceAmount,
        ReceiptText,
        "text-info",
        "currency",
      ),
      card(
        "Total Paid Amount",
        summary.admin.totalPaidAmount,
        BadgeDollarSign,
        "text-success",
        "currency",
      ),
      card(
        "Remaining Due",
        summary.admin.remainingDue,
        CircleDollarSign,
        "text-warning",
        "currency",
      ),
      card(
        "Overdue Invoices",
        summary.admin.overdueInvoices,
        AlertTriangle,
        "text-error",
      ),
      card("Vendor Count", summary.admin.totalVendors, Building2, "text-primary"),
    ];
  }

  if (role === "PROCUREMENT" && summary?.procurement) {
    return [
      card(
        "Approved Requests",
        summary.procurement.approvedRequests,
        CheckCircle2,
        "text-success",
      ),
      card("PO Created", summary.procurement.poCreated, FileCheck2, "text-info"),
      card(
        "PO Issued",
        summary.procurement.poIssued,
        ShoppingCart,
        "text-primary",
      ),
      card(
        "PO Received",
        summary.procurement.poReceived,
        CheckCircle2,
        "text-success",
      ),
      card(
        "Vendor Count",
        summary.procurement.vendorCount,
        Building2,
        "text-primary",
      ),
      card(
        "Total PO Amount",
        summary.procurement.totalPOAmount,
        CircleDollarSign,
        "text-warning",
        "currency",
      ),
    ];
  }

  if (role === "FINANCE" && summary?.finance) {
    return [
      card("Invoices", summary.finance.totalInvoices, ReceiptText, "text-info"),
      card(
        "Pending Invoices",
        summary.finance.pendingInvoices,
        Clock3,
        "text-warning",
      ),
      card("Paid Invoices", summary.finance.paidInvoices, CheckCircle2, "text-success"),
      card(
        "Invoice Amount",
        summary.finance.totalInvoiceAmount,
        ReceiptText,
        "text-info",
        "currency",
      ),
      card(
        "Paid Amount",
        summary.finance.totalPaidAmount,
        BadgeDollarSign,
        "text-success",
        "currency",
      ),
      card(
        "Remaining Due",
        summary.finance.remainingDue,
        CircleDollarSign,
        "text-warning",
        "currency",
      ),
      card(
        "Overdue Invoices",
        summary.finance.overdueInvoices,
        AlertTriangle,
        "text-error",
      ),
    ];
  }

  if (role === "MANAGER" && summary?.manager) {
    return [
      card("Pending Approvals", summary.manager.pendingApprovals, Clock3, "text-warning"),
      card("Approved By Me", summary.manager.approvedByMe, CheckCircle2, "text-success"),
      card("Rejected By Me", summary.manager.rejectedByMe, XCircle, "text-error"),
      card(
        "Department Requests",
        summary.manager.departmentRequests,
        FileText,
        "text-info",
      ),
    ];
  }

  if (role === "EMPLOYEE" && summary?.employee) {
    return [
      card("My Total Requests", summary.employee.myTotalRequests, FileText, "text-info"),
      card("Draft", summary.employee.myDraftRequests, FileClock, "text-muted-foreground"),
      card("Submitted", summary.employee.mySubmittedRequests, Clock3, "text-warning"),
      card("Approved", summary.employee.myApprovedRequests, CheckCircle2, "text-success"),
      card("Rejected", summary.employee.myRejectedRequests, XCircle, "text-error"),
      card("PO Created", summary.employee.myPOCreatedRequests, ShoppingCart, "text-primary"),
      card("Cancelled", summary.employee.myCancelledRequests, AlertTriangle, "text-warning"),
    ];
  }

  return [];
}

function card(
  label: string,
  value: number,
  icon: ComponentType<{ className?: string }>,
  tone: string,
  formatter: "currency" | "number" = "number",
): SummaryCardItem {
  return { formatter, icon, label, tone, value };
}
