export type InvoiceStatus =
  | "PENDING"
  | "PARTIALLY_PAID"
  | "PAID"
  | "CANCELLED";

export type InvoiceVendor = {
  id: string;
  name: string;
};

export type InvoicePurchaseOrder = {
  id: string;
  poNumber: string;
  status: string;
  totalAmount: number;
};

export type InvoiceActor = {
  id: string;
  name: string;
  role: string;
};

export type InvoicePayment = {
  amount: number;
  createdAt: string;
  createdBy: InvoiceActor;
  id: string;
  notes: string;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string;
  updatedAt: string;
};

export type Invoice = {
  createdAt: string;
  createdBy: InvoiceActor;
  daysOverdue: number;
  dueDate: string;
  id: string;
  invoiceAmount: number;
  invoiceDate: string;
  invoiceNumber: string;
  isOverdue: boolean;
  notes: string;
  paidAmount: number;
  paidAt?: string | null;
  payments?: InvoicePayment[];
  purchaseOrder: InvoicePurchaseOrder;
  remainingAmount: number;
  status: InvoiceStatus | string;
  updatedAt: string;
  vendor: InvoiceVendor;
};

export type InvoiceListData = {
  items: Invoice[];
  limit: number;
  page: number;
  total: number;
};

export type InvoiceListFilters = {
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  page?: number;
  purchaseOrderId?: string;
  status?: string;
  vendorId?: string;
};

export type CreateInvoiceRequest = {
  dueDate: string;
  invoiceAmount: number;
  invoiceDate: string;
  invoiceNumber: string;
  notes?: string;
  purchaseOrderId: string;
};

export type UpdateInvoiceRequest = Partial<
  Omit<CreateInvoiceRequest, "purchaseOrderId">
>;

export type AddInvoicePaymentRequest = {
  amount: number;
  notes?: string;
  paymentDate?: string;
  paymentMethod?: string;
  referenceNumber?: string;
};

export type PaymentListItem = InvoicePayment & {
  invoice: {
    id: string;
    invoiceNumber: string;
    status: string;
  };
  purchaseOrder: InvoicePurchaseOrder;
  vendor: InvoiceVendor;
};

export type PaymentListData = {
  items: PaymentListItem[];
  limit: number;
  page: number;
  total: number;
};

export type PaymentListFilters = {
  dateFrom?: string;
  dateTo?: string;
  invoiceId?: string;
  limit?: number;
  page?: number;
  paymentMethod?: string;
  vendorId?: string;
};

export type InvoiceEligiblePurchaseOrder = {
  id: string;
  poNumber: string;
  totalAmount: number;
  vendor: InvoiceVendor;
};
