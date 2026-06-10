import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  CompanyPlatformBillingInvoiceListData,
  CreatePlatformBillingInvoiceRequest,
  PlatformBillingFilters,
  PlatformBillingInvoice,
  PlatformBillingInvoiceListData,
  RecordPlatformBillingPaymentRequest,
} from "./types";

export async function getPlatformBillingInvoices(
  filters: PlatformBillingFilters,
) {
  const response = await apiClient.get<
    ApiResponse<PlatformBillingInvoiceListData>
  >("/platform/billing/invoices", { params: filters });

  return (
    response.data.data ?? {
      items: [],
      limit: filters.limit ?? 10,
      page: filters.page ?? 1,
      summary: {
        mrr: 0,
        overdueInvoiceCount: 0,
        paidAmount: 0,
        paidInvoiceCount: 0,
        pendingAmount: 0,
        pendingInvoiceCount: 0,
      },
      total: 0,
    }
  );
}

export async function getPlatformBillingInvoice(id: string) {
  const response = await apiClient.get<ApiResponse<PlatformBillingInvoice>>(
    `/platform/billing/invoices/${id}`,
  );

  return response.data.data;
}

export async function getCompanyPlatformBillingInvoices({
  companyId,
  limit = 10,
  page = 1,
}: {
  companyId: string;
  limit?: number;
  page?: number;
}) {
  const response = await apiClient.get<
    ApiResponse<CompanyPlatformBillingInvoiceListData>
  >(`/platform/companies/${companyId}/billing/invoices`, {
    params: { limit, page },
  });

  return response.data.data ?? { items: [], limit, page, total: 0 };
}

export async function createPlatformBillingInvoice({
  companyId,
  payload,
}: {
  companyId: string;
  payload: CreatePlatformBillingInvoiceRequest;
}) {
  const response = await apiClient.post<ApiResponse<PlatformBillingInvoice>>(
    `/platform/companies/${companyId}/billing/invoices`,
    payload,
  );

  return response.data.data;
}

export async function recordPlatformBillingPayment({
  invoiceId,
  payload,
}: {
  invoiceId: string;
  payload: RecordPlatformBillingPaymentRequest;
}) {
  const response = await apiClient.post<ApiResponse<PlatformBillingInvoice>>(
    `/platform/billing/invoices/${invoiceId}/payments`,
    payload,
  );

  return response.data.data;
}

export async function cancelPlatformBillingInvoice(id: string) {
  const response = await apiClient.post<ApiResponse<PlatformBillingInvoice>>(
    `/platform/billing/invoices/${id}/cancel`,
  );

  return response.data.data;
}
