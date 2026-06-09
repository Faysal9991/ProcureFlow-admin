import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  AddInvoicePaymentRequest,
  CreateInvoiceRequest,
  Invoice,
  InvoiceListData,
  InvoiceListFilters,
  PaymentListData,
  PaymentListFilters,
  UpdateInvoiceRequest,
} from "./types";

const emptyInvoiceList: InvoiceListData = {
  items: [],
  limit: 10,
  page: 1,
  total: 0,
};

const emptyPaymentList: PaymentListData = {
  items: [],
  limit: 10,
  page: 1,
  total: 0,
};

function compactParams<T extends Record<string, unknown>>(filters: T) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value != null),
  );
}

function normalizeInvoiceList(data?: InvoiceListData): InvoiceListData {
  return {
    items: data?.items ?? [],
    limit: data?.limit ?? emptyInvoiceList.limit,
    page: data?.page ?? emptyInvoiceList.page,
    total: data?.total ?? 0,
  };
}

function normalizePaymentList(data?: PaymentListData): PaymentListData {
  return {
    items: data?.items ?? [],
    limit: data?.limit ?? emptyPaymentList.limit,
    page: data?.page ?? emptyPaymentList.page,
    total: data?.total ?? 0,
  };
}

export async function getInvoices(filters: InvoiceListFilters) {
  const response = await apiClient.get<ApiResponse<InvoiceListData>>(
    "/invoices",
    {
      params: compactParams(filters),
    },
  );

  return normalizeInvoiceList(response.data.data);
}

export async function getInvoice(id: string) {
  const response = await apiClient.get<ApiResponse<Invoice>>(
    `/invoices/${id}`,
  );

  return response.data.data;
}

export async function createInvoice(payload: CreateInvoiceRequest) {
  const response = await apiClient.post<ApiResponse<Invoice>>(
    "/invoices",
    payload,
  );

  return response.data.data;
}

export async function updateInvoice({
  id,
  payload,
}: {
  id: string;
  payload: UpdateInvoiceRequest;
}) {
  const response = await apiClient.patch<ApiResponse<Invoice>>(
    `/invoices/${id}`,
    payload,
  );

  return response.data.data;
}

export async function cancelInvoice(id: string) {
  const response = await apiClient.post<ApiResponse<Invoice>>(
    `/invoices/${id}/cancel`,
  );

  return response.data.data;
}

export async function addInvoicePayment({
  id,
  payload,
}: {
  id: string;
  payload: AddInvoicePaymentRequest;
}) {
  const response = await apiClient.post<ApiResponse<Invoice>>(
    `/invoices/${id}/payments`,
    payload,
  );

  return response.data.data;
}

export async function getPayments(filters: PaymentListFilters) {
  const response = await apiClient.get<ApiResponse<PaymentListData>>(
    "/payments",
    {
      params: compactParams(filters),
    },
  );

  return normalizePaymentList(response.data.data);
}
