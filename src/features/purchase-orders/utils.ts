import type { AdminRole } from "@/types/auth";
import type {
  PurchaseOrder,
  PurchaseOrderAction,
  PurchaseOrderStatus,
} from "./types";

export const PURCHASE_ORDER_PAGE_SIZE = 10;

export const purchaseOrderStatuses: {
  label: string;
  value: PurchaseOrderStatus;
}[] = [
  { label: "Draft", value: "DRAFT" },
  { label: "Issued", value: "ISSUED" },
  { label: "Received", value: "RECEIVED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Closed", value: "CLOSED" },
];

const readableRoles: AdminRole[] = ["COMPANY_ADMIN", "FINANCE", "PROCUREMENT"];
const manageableRoles: AdminRole[] = ["COMPANY_ADMIN", "PROCUREMENT"];

export function canReadPurchaseOrders(role?: string) {
  return readableRoles.includes(role as AdminRole);
}

export function canManagePurchaseOrders(role?: string) {
  return manageableRoles.includes(role as AdminRole);
}

export function canEditPurchaseOrder(order?: PurchaseOrder | null) {
  return order?.status === "DRAFT";
}

export function getPurchaseOrderStatusLabel(status?: string) {
  return (
    purchaseOrderStatuses.find((item) => item.value === status)?.label ??
    status ??
    "Unknown"
  );
}

export function getPurchaseOrderStatusVariant(status?: string) {
  switch (status as PurchaseOrderStatus) {
    case "ISSUED":
      return "info";
    case "RECEIVED":
      return "success";
    case "CANCELLED":
      return "warning";
    case "CLOSED":
      return "primary";
    case "DRAFT":
    default:
      return "default";
  }
}

export function getAvailablePurchaseOrderActions(
  order: PurchaseOrder,
): PurchaseOrderAction[] {
  switch (order.status as PurchaseOrderStatus) {
    case "DRAFT":
      return ["issue", "cancel"];
    case "ISSUED":
      return ["receive"];
    case "RECEIVED":
      return ["close"];
    default:
      return [];
  }
}

export function getActionLabel(action: PurchaseOrderAction) {
  switch (action) {
    case "issue":
      return "Issue PO";
    case "cancel":
      return "Cancel PO";
    case "receive":
      return "Receive PO";
    case "close":
      return "Close PO";
  }
}

export function getActionDescription(action: PurchaseOrderAction) {
  switch (action) {
    case "issue":
      return "This will mark the draft purchase order as issued.";
    case "cancel":
      return "This will cancel the draft purchase order.";
    case "receive":
      return "This will mark the issued purchase order as received.";
    case "close":
      return "This will close the received purchase order.";
  }
}

export function formatCurrency(value?: number) {
  return new Intl.NumberFormat("en", {
    currency: "BDT",
    maximumFractionDigits: 2,
    style: "currency",
  }).format(Number(value ?? 0));
}

export function formatPurchaseOrderDate(value?: string | null) {
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

export function calculateLineTotal(quantity?: number, unitPrice?: number) {
  return Number(quantity || 0) * Number(unitPrice || 0);
}

export function calculateOrderTotal(
  items: { quantity?: number; unitPrice?: number }[],
) {
  return items.reduce(
    (sum, item) => sum + calculateLineTotal(item.quantity, item.unitPrice),
    0,
  );
}

export function normalizeOptionalString(value?: string) {
  const trimmed = value?.trim() ?? "";

  return trimmed || undefined;
}

export function getPurchaseOrderMutationError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("rfq")) {
    return "This company requires RFQ before PO. Create the PO from a selected quotation.";
  }

  if (normalized.includes("draft")) {
    return "Only draft purchase orders can be edited or cancelled.";
  }

  if (normalized.includes("approved")) {
    return "Only approved purchase requests can be converted into purchase orders.";
  }

  if (normalized.includes("already exists")) {
    return "A purchase order already exists for this purchase request.";
  }

  if (normalized.includes("forbidden")) {
    return "You do not have permission to perform this purchase order action.";
  }

  return message;
}
