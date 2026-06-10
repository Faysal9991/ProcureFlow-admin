import type { PlatformPlan } from "@/features/platform/companies/types";

export type PlatformBillingStatus = "PENDING" | "PAID" | "CANCELLED";

export type PlatformBillingCompany = {
  email: string;
  id: string;
  name: string;
  status: string;
};

export type PlatformBillingActor = {
  email: string;
  id: string;
  name: string;
  role: string;
};

export type PlatformBillingPayment = {
  amount: number;
  createdAt: string;
  createdBy?: PlatformBillingActor | null;
  id: string;
  notes: string;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string;
  updatedAt: string;
};

export type PlatformBillingInvoice = {
  amount: number;
  billingPeriodEnd: string;
  billingPeriodStart: string;
  cancelledAt?: string | null;
  cancelledBy?: PlatformBillingActor | null;
  company: PlatformBillingCompany;
  createdAt: string;
  createdBy?: PlatformBillingActor | null;
  dueDate: string;
  id: string;
  invoiceNumber: string;
  isOverdue: boolean;
  notes: string;
  paidAmount: number;
  paidAt?: string | null;
  payments?: PlatformBillingPayment[];
  plan: PlatformPlan;
  remainingAmount: number;
  status: PlatformBillingStatus | string;
  subscriptionId?: string;
  updatedAt: string;
};

export type PlatformBillingSummary = {
  mrr: number;
  overdueInvoiceCount: number;
  paidAmount: number;
  paidInvoiceCount: number;
  pendingAmount: number;
  pendingInvoiceCount: number;
};

export type PlatformBillingInvoiceListData = {
  items: PlatformBillingInvoice[];
  limit: number;
  page: number;
  summary: PlatformBillingSummary;
  total: number;
};

export type CompanyPlatformBillingInvoiceListData = {
  items: PlatformBillingInvoice[];
  limit: number;
  page: number;
  total: number;
};

export type PlatformBillingFilters = {
  companyId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  page?: number;
  planId?: string;
  search?: string;
  status?: PlatformBillingStatus;
};

export type CreatePlatformBillingInvoiceRequest = {
  amount: number;
  billingPeriodEnd: string;
  billingPeriodStart: string;
  dueDate: string;
  notes?: string;
  planId?: string;
  subscriptionId?: string;
};

export type RecordPlatformBillingPaymentRequest = {
  amount: number;
  notes?: string;
  paymentDate?: string;
  paymentMethod: string;
  referenceNumber?: string;
};
