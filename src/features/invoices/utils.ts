import type { AdminRole } from "@/types/auth";
import type { Invoice, InvoiceStatus } from "./types";

export const INVOICE_PAGE_SIZE = 10;
export const PAYMENT_PAGE_SIZE = 10;

export const invoiceStatuses: {
  label: string;
  value: InvoiceStatus;
}[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Partially Paid", value: "PARTIALLY_PAID" },
  { label: "Paid", value: "PAID" },
  { label: "Cancelled", value: "CANCELLED" },
];

export const paymentMethods = [
  "BANK_TRANSFER",
  "CASH",
  "CHEQUE",
  "CARD",
  "MOBILE_BANKING",
];

const invoiceReadableRoles: AdminRole[] = [
  "COMPANY_ADMIN",
  "FINANCE",
  "PROCUREMENT",
];
const invoiceCreateRoles: AdminRole[] = ["COMPANY_ADMIN", "PROCUREMENT"];
const invoiceFullAccessRoles: AdminRole[] = ["COMPANY_ADMIN"];
const paymentManageRoles: AdminRole[] = ["COMPANY_ADMIN", "FINANCE"];

export function canReadInvoices(role?: string) {
  return invoiceReadableRoles.includes(role as AdminRole);
}

export function canCreateInvoices(role?: string) {
  return invoiceCreateRoles.includes(role as AdminRole);
}

export function canManageInvoiceDetails(role?: string) {
  return invoiceFullAccessRoles.includes(role as AdminRole);
}

export function canReadPayments(role?: string) {
  return paymentManageRoles.includes(role as AdminRole);
}

export function canAddInvoicePayment(role?: string) {
  return paymentManageRoles.includes(role as AdminRole);
}

export function canEditInvoice(invoice?: Invoice | null) {
  return invoice?.status === "PENDING" && Number(invoice.paidAmount ?? 0) === 0;
}

export function canCancelInvoice(invoice?: Invoice | null) {
  return canEditInvoice(invoice);
}

export function canPayInvoice(invoice?: Invoice | null) {
  return (
    !!invoice &&
    invoice.status !== "CANCELLED" &&
    invoice.status !== "PAID" &&
    Number(invoice.remainingAmount ?? 0) > 0
  );
}

export function getInvoiceStatusLabel(status?: string) {
  return (
    invoiceStatuses.find((item) => item.value === status)?.label ??
    status ??
    "Unknown"
  );
}

export function getInvoiceStatusVariant(status?: string) {
  switch (status as InvoiceStatus) {
    case "PAID":
      return "success";
    case "PARTIALLY_PAID":
      return "info";
    case "CANCELLED":
      return "warning";
    case "PENDING":
    default:
      return "default";
  }
}

export function formatCurrency(value?: number) {
  return new Intl.NumberFormat("en", {
    currency: "BDT",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(Number(value ?? 0));
}

export function formatInvoiceDate(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function normalizeOptionalString(value?: string) {
  const trimmed = value?.trim() ?? "";

  return trimmed || undefined;
}

export function getInvoiceMutationError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("received purchase orders")) {
    return "Only received purchase orders can be invoiced.";
  }

  if (normalized.includes("already exists")) {
    return "This purchase order or invoice number has already been invoiced.";
  }

  if (normalized.includes("after payment") || normalized.includes("locked")) {
    return "Only pending invoices with no payments can be edited or cancelled.";
  }

  if (normalized.includes("exceeds remaining")) {
    return "Payment amount cannot exceed the remaining invoice balance.";
  }

  if (normalized.includes("reference number")) {
    return "Payment reference number already exists for this company.";
  }

  if (normalized.includes("forbidden")) {
    return "You do not have permission to perform this finance action.";
  }

  return message;
}
