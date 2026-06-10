import { ROUTES } from "@/lib/constants/routes";
import { invoiceStatuses, paymentMethods } from "@/features/invoices/utils";
import { purchaseOrderStatuses } from "@/features/purchase-orders/utils";
import { requestStatuses } from "@/features/purchase-requests/utils";
import type { ReportConfig, ReportRow } from "./types";

const requestStatusOptions = requestStatuses.map((status) => ({
  label: status.label,
  value: status.value,
}));

const purchaseOrderStatusOptions = purchaseOrderStatuses.map((status) => ({
  label: status.label,
  value: status.value,
}));

const invoiceStatusOptions = invoiceStatuses.map((status) => ({
  label: status.label,
  value: status.value,
}));

const paymentMethodOptions = paymentMethods.map((method) => ({
  label: formatEnumLabel(method),
  value: method,
}));

export const reportConfigs: ReportConfig[] = [
  {
    columns: [
      {
        header: "Request No",
        id: "requestNo",
        value: (row) => getString(row, "requestNo") || getString(row, "requestId"),
      },
      {
        header: "Title",
        id: "requestTitle",
        value: (row) => getString(row, "requestTitle"),
      },
      {
        header: "Department",
        id: "departmentName",
        value: (row) => getString(row, "departmentName"),
      },
      {
        header: "Requested By",
        id: "requestedBy",
        value: (row) => getString(row, "requestedBy"),
      },
      {
        header: "Status",
        id: "status",
        kind: "status",
        value: (row) => getString(row, "status"),
      },
      {
        align: "right",
        header: "Amount",
        id: "amount",
        kind: "currency",
        value: (row) => getNumber(row, "amount"),
      },
      {
        header: "Created",
        id: "createdAt",
        kind: "date",
        value: (row) => getString(row, "createdAt"),
      },
    ],
    description:
      "Track request volume, value, requester activity, and status movement.",
    endpoint: "/reports/purchase-requests",
    filters: [
      "dateFrom",
      "dateTo",
      "departmentId",
      "status",
      "requestedBy",
    ],
    route: ROUTES.reportPurchaseRequests,
    rowId: (row) => getString(row, "requestId") || getString(row, "requestNo"),
    statusOptions: requestStatusOptions,
    title: "Purchase Requests",
    type: "purchase-requests",
    viewPermission: "report.purchase_request.view",
  },
  {
    columns: [
      {
        header: "Request",
        id: "requestTitle",
        value: (row) => getString(row, "requestTitle"),
      },
      {
        header: "Department",
        id: "departmentName",
        value: (row) => getString(row, "departmentName"),
      },
      {
        header: "Requested By",
        id: "requestedBy",
        value: (row) => getString(row, "requestedBy"),
      },
      {
        header: "Action",
        id: "action",
        kind: "status",
        value: (row) => getString(row, "action"),
      },
      {
        header: "Action By",
        id: "actionBy",
        value: (row) => getString(row, "actionBy"),
      },
      {
        header: "Role",
        id: "actionByRole",
        value: (row) => formatEnumLabel(getString(row, "actionByRole")),
      },
      {
        header: "Comment",
        id: "comment",
        value: (row) => getString(row, "comment"),
      },
      {
        header: "Action At",
        id: "actionAt",
        kind: "date",
        value: (row) => getString(row, "actionAt"),
      },
    ],
    description:
      "Review approval decisions, approver activity, and decision comments.",
    endpoint: "/reports/approvals",
    filters: ["dateFrom", "dateTo", "departmentId", "action", "approverId"],
    route: ROUTES.reportApprovals,
    rowId: (row) =>
      `${getString(row, "requestId")}-${getString(row, "actionAt")}`,
    statusOptions: [
      { label: "Approved", value: "APPROVED" },
      { label: "Rejected", value: "REJECTED" },
    ],
    title: "Approvals",
    type: "approvals",
    viewPermission: "report.approval.view",
  },
  {
    columns: [
      {
        header: "PO Number",
        id: "poNumber",
        value: (row) => getString(row, "poNumber"),
      },
      {
        header: "Vendor",
        id: "vendorName",
        value: (row) => getString(row, "vendorName"),
      },
      {
        header: "Status",
        id: "status",
        kind: "status",
        value: (row) => getString(row, "status"),
      },
      {
        align: "right",
        header: "Amount",
        id: "amount",
        kind: "currency",
        value: (row) => getNumber(row, "amount"),
      },
      {
        header: "Issued Date",
        id: "issuedDate",
        kind: "date",
        value: (row) => getString(row, "issuedDate"),
      },
    ],
    description:
      "Inspect purchase order value, vendors, lifecycle status, and issue dates.",
    endpoint: "/reports/purchase-orders",
    filters: ["dateFrom", "dateTo", "departmentId", "vendorId", "status"],
    route: ROUTES.reportPurchaseOrders,
    rowId: (row) =>
      getString(row, "purchaseOrderId") || getString(row, "poNumber"),
    statusOptions: purchaseOrderStatusOptions,
    title: "Purchase Orders",
    type: "purchase-orders",
    viewPermission: "report.purchase_order.view",
  },
  {
    columns: [
      {
        header: "Invoice No",
        id: "invoiceNumber",
        value: (row) => getString(row, "invoiceNumber"),
      },
      {
        header: "Vendor",
        id: "vendorName",
        value: (row) => getString(row, "vendorName"),
      },
      {
        align: "right",
        header: "Amount",
        id: "amount",
        kind: "currency",
        value: (row) => getNumber(row, "amount"),
      },
      {
        align: "right",
        header: "Paid",
        id: "paidAmount",
        kind: "currency",
        value: (row) => getNumber(row, "paidAmount"),
      },
      {
        align: "right",
        header: "Due",
        id: "dueAmount",
        kind: "currency",
        value: (row) => getNumber(row, "dueAmount"),
      },
      {
        header: "Status",
        id: "status",
        kind: "status",
        value: (row) => getString(row, "status"),
      },
      {
        header: "Invoice Date",
        id: "invoiceDate",
        kind: "date",
        value: (row) => getString(row, "invoiceDate"),
      },
      {
        header: "Due Date",
        id: "dueDate",
        kind: "date",
        value: (row) => getString(row, "dueDate"),
      },
    ],
    description:
      "Monitor invoice status, vendor balances, paid amounts, and due exposure.",
    endpoint: "/reports/invoices",
    filters: ["dateFrom", "dateTo", "vendorId", "status"],
    route: ROUTES.reportInvoices,
    rowId: (row) =>
      getString(row, "invoiceId") || getString(row, "invoiceNumber"),
    statusOptions: invoiceStatusOptions,
    title: "Invoices",
    type: "invoices",
    viewPermission: "report.invoice.view",
  },
  {
    columns: [
      {
        header: "Invoice No",
        id: "invoiceNumber",
        value: (row) => getString(row, "invoiceNumber"),
      },
      {
        header: "Vendor",
        id: "vendorName",
        value: (row) => getString(row, "vendorName"),
      },
      {
        align: "right",
        header: "Amount",
        id: "amount",
        kind: "currency",
        value: (row) => getNumber(row, "amount"),
      },
      {
        header: "Method",
        id: "paymentMethod",
        value: (row) => formatEnumLabel(getString(row, "paymentMethod")),
      },
      {
        header: "Reference",
        id: "referenceNumber",
        value: (row) => getString(row, "referenceNumber"),
      },
      {
        header: "Payment Date",
        id: "paymentDate",
        kind: "date",
        value: (row) => getString(row, "paymentDate"),
      },
    ],
    description:
      "Review payment amounts, methods, references, vendors, and payment dates.",
    endpoint: "/reports/payments",
    filters: ["dateFrom", "dateTo", "vendorId", "paymentMethod"],
    route: ROUTES.reportPayments,
    rowId: (row) =>
      getString(row, "paymentId") || `${getString(row, "invoiceNumber")}-${getString(row, "paymentDate")}`,
    statusOptions: paymentMethodOptions,
    title: "Payments",
    type: "payments",
    viewPermission: "report.payment.view",
  },
];

export const reportConfigByType = Object.fromEntries(
  reportConfigs.map((config) => [config.type, config]),
) as Record<ReportConfig["type"], ReportConfig>;

function getString(row: ReportRow, key: string) {
  const value = (row as unknown as Record<string, unknown>)[key];

  return typeof value === "string" ? value : "";
}

function getNumber(row: ReportRow, key: string) {
  const value = (row as unknown as Record<string, unknown>)[key];

  return typeof value === "number" ? value : 0;
}

export function formatEnumLabel(value?: string) {
  if (!value) {
    return "";
  }

  return value
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
