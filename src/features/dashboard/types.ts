export type DashboardFilters = {
  dateFrom?: string;
  dateTo?: string;
  departmentId?: string;
  limit?: number;
  page?: number;
};

export type DashboardFilterPreset =
  | "custom"
  | "thisMonth"
  | "thisQuarter"
  | "thisYear";

export type EmployeeSummary = {
  myApprovedRequests: number;
  myCancelledRequests: number;
  myDraftRequests: number;
  myPOCreatedRequests: number;
  myRejectedRequests: number;
  mySubmittedRequests: number;
  myTotalRequests: number;
};

export type ManagerSummary = {
  approvedByMe: number;
  departmentRequests: number;
  pendingApprovals: number;
  recentSubmittedRequests: RecentSubmittedRequest[];
  rejectedByMe: number;
};

export type RecentSubmittedRequest = {
  createdAt: string;
  estimatedTotal: number;
  id: string;
  neededDate?: string;
  priority: string;
  requestedBy: {
    id: string;
    name: string;
    role: string;
  };
  title: string;
};

export type ProcurementSummary = {
  approvedRequests: number;
  poCreated: number;
  poIssued: number;
  poReceived: number;
  totalPOAmount: number;
  vendorCount: number;
};

export type FinanceSummary = {
  overdueInvoices: number;
  paidInvoices: number;
  partiallyPaidInvoices: number;
  pendingInvoices: number;
  remainingDue: number;
  totalInvoiceAmount: number;
  totalInvoices: number;
  totalPaidAmount: number;
};

export type AdminSummary = {
  overdueInvoices: number;
  pendingApprovals: number;
  remainingDue: number;
  totalDepartments: number;
  totalInvoiceAmount: number;
  totalPOAmount: number;
  totalPaidAmount: number;
  totalRequests: number;
  totalUsers: number;
  totalVendors: number;
};

export type DashboardSummary = {
  admin?: AdminSummary;
  employee?: EmployeeSummary;
  finance?: FinanceSummary;
  manager?: ManagerSummary;
  procurement?: ProcurementSummary;
  role: string;
};

export type RequestStatusChartData = {
  approved: number;
  cancelled: number;
  draft: number;
  poCreated: number;
  rejected: number;
  submitted: number;
};

export type SpendSummaryData = {
  remainingDue: number;
  totalInvoiceAmount: number;
  totalPOAmount: number;
  totalPaidAmount: number;
};

export type DepartmentSpendItem = {
  departmentId: string;
  departmentName: string;
  totalAmount: number;
};

export type TopVendorItem = {
  poCount: number;
  totalAmount: number;
  vendorId: string;
  vendorName: string;
};

export type OverdueInvoiceItem = {
  daysOverdue: number;
  dueDate: string;
  id: string;
  invoiceAmount: number;
  invoiceNumber: string;
  paidAmount: number;
  poNumber: string;
  purchaseOrderId: string;
  remainingAmount: number;
  status: string;
  vendorId: string;
  vendorName: string;
};

export type OverdueInvoicesData = {
  items: OverdueInvoiceItem[];
  limit: number;
  page: number;
  total: number;
};
