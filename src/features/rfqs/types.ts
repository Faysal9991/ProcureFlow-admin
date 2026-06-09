export type RFQStatus =
  | "DRAFT"
  | "OPEN"
  | "QUOTATION_RECEIVED"
  | "COMPLETED"
  | "CANCELLED";

export type QuotationStatus = "SUBMITTED" | "SELECTED";

export type RFQActor = {
  id: string;
  name: string;
  role: string;
};

export type RFQDepartment = {
  id: string;
  name: string;
};

export type RFQPurchaseRequest = {
  department: RFQDepartment;
  id: string;
  status: string;
  title: string;
};

export type RFQVendorSummary = {
  id: string;
  name: string;
  status: string;
};

export type RFQVendor = {
  createdAt: string;
  id: string;
  vendor: RFQVendorSummary;
};

export type RFQItem = {
  description: string;
  estimatedTotalPrice: number;
  estimatedUnitPrice: number;
  id: string;
  itemName: string;
  purchaseRequestItemId: string;
  quantity: number;
  unit: string;
};

export type QuotationItem = {
  description: string;
  id: string;
  itemName: string;
  purchaseRequestItemId: string;
  quantity: number;
  rfqItemId: string;
  totalPrice: number;
  unit: string;
  unitPrice: number;
};

export type Quotation = {
  createdAt: string;
  id: string;
  items?: QuotationItem[];
  notes: string;
  quotationDate: string;
  quotationNumber: string;
  status: QuotationStatus | string;
  totalAmount: number;
  updatedAt: string;
  validUntil?: string | null;
  vendor: RFQVendorSummary;
};

export type RFQ = {
  cancelledAt?: string | null;
  createdAt: string;
  createdBy: RFQActor;
  dueDate: string;
  id: string;
  items?: RFQItem[];
  notes: string;
  openedAt?: string | null;
  purchaseRequest: RFQPurchaseRequest;
  quotations?: Quotation[];
  rfqNumber: string;
  selectedAt?: string | null;
  selectedQuotationId?: string | null;
  status: RFQStatus | string;
  updatedAt: string;
  vendors?: RFQVendor[];
};

export type RFQListData = {
  items: RFQ[];
  limit: number;
  page: number;
  total: number;
};

export type RFQListFilters = {
  departmentId?: string;
  limit?: number;
  page?: number;
  purchaseRequestId?: string;
  status?: string;
  vendorId?: string;
};

export type CreateRFQRequest = {
  dueDate: string;
  notes?: string;
  purchaseRequestId: string;
};

export type AddRFQVendorsRequest = {
  vendorIds: string[];
};

export type QuotationItemInput = {
  rfqItemId: string;
  unitPrice: number;
};

export type CreateQuotationRequest = {
  items: QuotationItemInput[];
  notes?: string;
  quotationDate?: string;
  quotationNumber?: string;
  validUntil?: string;
  vendorId: string;
};

export type SelectQuotationRequest = {
  quotationId: string;
};

export type ComparisonQuotation = {
  id: string;
  isSelected: boolean;
  items: QuotationItem[];
  quotationNumber: string;
  rank: number;
  totalAmount: number;
  vendor: RFQVendorSummary;
};

export type RFQComparison = {
  items: RFQItem[];
  quotations: ComparisonQuotation[];
  rfq: RFQ;
};

export type RFQAction = "open" | "cancel" | "select";
