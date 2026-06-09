import type { PurchaseRequestItem } from "@/features/purchase-requests/types";

export type PurchaseOrderStatus =
  | "DRAFT"
  | "ISSUED"
  | "RECEIVED"
  | "CANCELLED"
  | "CLOSED";

export type PurchaseOrderActor = {
  id: string;
  name: string;
  role: string;
};

export type PurchaseOrderVendor = {
  id: string;
  name: string;
};

export type PurchaseOrderRequest = {
  id: string;
  items?: PurchaseRequestItem[];
  status: string;
  title: string;
};

export type PurchaseOrderItem = {
  description: string;
  id: string;
  itemName: string;
  purchaseRequestItemId: string;
  quantity: number;
  totalPrice: number;
  unit: string;
  unitPrice: number;
  vendorQuotationItemId?: string;
};

export type PurchaseOrder = {
  cancelledAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  createdBy: PurchaseOrderActor;
  id: string;
  issuedAt?: string | null;
  items?: PurchaseOrderItem[];
  notes: string;
  poNumber: string;
  purchaseRequest: PurchaseOrderRequest;
  quotationId?: string;
  receivedAt?: string | null;
  status: PurchaseOrderStatus | string;
  statusChangedBy?: PurchaseOrderActor | null;
  totalAmount: number;
  updatedAt: string;
  vendor: PurchaseOrderVendor;
};

export type PurchaseOrderListData = {
  items: PurchaseOrder[];
  limit: number;
  page: number;
  total: number;
};

export type PurchaseOrderListFilters = {
  limit?: number;
  page?: number;
  purchaseRequestId?: string;
  search?: string;
  status?: string;
  vendorId?: string;
};

export type PurchaseOrderItemInput = {
  purchaseRequestItemId: string;
  quantity: number;
  unitPrice: number;
};

export type CreatePurchaseOrderRequest = {
  items?: PurchaseOrderItemInput[];
  notes?: string;
  purchaseRequestId?: string;
  quotationId?: string;
  vendorId?: string;
};

export type UpdatePurchaseOrderRequest = {
  items?: PurchaseOrderItemInput[];
  notes?: string;
  vendorId?: string;
};

export type PurchaseOrderAction = "issue" | "cancel" | "receive" | "close";

export type RFQVendorSummary = {
  id: string;
  name: string;
  status: string;
};

export type RFQPurchaseRequest = {
  id: string;
  status: string;
  title: string;
};

export type RFQQuotation = {
  id: string;
  quotationNumber: string;
  status: string;
  totalAmount: number;
  vendor: RFQVendorSummary;
};

export type RFQ = {
  id: string;
  purchaseRequest: RFQPurchaseRequest;
  quotations?: RFQQuotation[];
  rfqNumber: string;
  selectedQuotationId?: string | null;
  status: string;
};

export type RFQListData = {
  items: RFQ[];
  limit: number;
  page: number;
  total: number;
};

export type RFQListFilters = {
  limit?: number;
  page?: number;
  status?: string;
};
