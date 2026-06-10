export type ReportType =
  | "purchase-requests"
  | "approvals"
  | "purchase-orders"
  | "invoices"
  | "payments";

export type ReportExportFormat = "csv" | "xlsx" | "pdf";

export type ReportFilterKey =
  | "action"
  | "approverId"
  | "dateFrom"
  | "dateTo"
  | "departmentId"
  | "paymentMethod"
  | "requestedBy"
  | "status"
  | "vendorId";

export type ReportFilters = {
  action?: string;
  approverId?: string;
  dateFrom?: string;
  dateTo?: string;
  departmentId?: string;
  limit?: number;
  page?: number;
  paymentMethod?: string;
  requestedBy?: string;
  status?: string;
  vendorId?: string;
};

export type ReportListData<TItem extends ReportRow = ReportRow> = {
  items: TItem[];
  limit: number;
  page: number;
  total: number;
};

export type PurchaseRequestReportRow = {
  amount: number;
  createdAt: string;
  departmentName: string;
  requestId: string;
  requestNo: string;
  requestTitle: string;
  requestedBy: string;
  status: string;
};

export type ApprovalReportRow = {
  action: string;
  actionAt: string;
  actionBy: string;
  actionByRole: string;
  comment: string;
  departmentName: string;
  requestId: string;
  requestTitle: string;
  requestedBy: string;
};

export type PurchaseOrderReportRow = {
  amount: number;
  issuedDate: string;
  poNumber: string;
  purchaseOrderId: string;
  status: string;
  vendorName: string;
};

export type InvoiceReportRow = {
  amount: number;
  dueAmount: number;
  dueDate: string;
  invoiceDate: string;
  invoiceId: string;
  invoiceNumber: string;
  paidAmount: number;
  status: string;
  vendorName: string;
};

export type PaymentReportRow = {
  amount: number;
  invoiceNumber: string;
  paymentDate: string;
  paymentId: string;
  paymentMethod: string;
  referenceNumber: string;
  vendorName: string;
};

export type ReportRow =
  | ApprovalReportRow
  | InvoiceReportRow
  | PaymentReportRow
  | PurchaseOrderReportRow
  | PurchaseRequestReportRow;

export type ReportColumn = {
  align?: "left" | "right";
  header: string;
  id: string;
  kind?: "currency" | "date" | "status" | "text";
  value: (row: ReportRow) => number | string | null | undefined;
};

export type ReportOption = {
  label: string;
  value: string;
};

export type ReportConfig = {
  columns: ReportColumn[];
  description: string;
  endpoint: string;
  filters: ReportFilterKey[];
  route: string;
  rowId: (row: ReportRow) => string;
  statusOptions?: ReportOption[];
  title: string;
  type: ReportType;
  viewPermission: string;
};

export type ExportReportRequest = {
  filters: ReportFilters;
  format: ReportExportFormat;
  reportType: ReportType;
};

export type ExportReportResult = {
  blob: Blob;
  filename: string;
};
