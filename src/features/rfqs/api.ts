import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  AddRFQVendorsRequest,
  CreateQuotationRequest,
  CreateRFQRequest,
  Quotation,
  RFQ,
  RFQComparison,
  RFQListData,
  RFQListFilters,
  SelectQuotationRequest,
} from "./types";

const emptyRFQList: RFQListData = {
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

function normalizeRFQList(data?: RFQListData): RFQListData {
  return {
    items: data?.items ?? [],
    limit: data?.limit ?? emptyRFQList.limit,
    page: data?.page ?? emptyRFQList.page,
    total: data?.total ?? 0,
  };
}

export async function getRFQs(filters: RFQListFilters) {
  const response = await apiClient.get<ApiResponse<RFQListData>>("/rfqs", {
    params: compactParams(filters),
  });

  return normalizeRFQList(response.data.data);
}

export async function getRFQ(id: string) {
  const response = await apiClient.get<ApiResponse<RFQ>>(`/rfqs/${id}`);

  return response.data.data;
}

export async function createRFQ(payload: CreateRFQRequest) {
  const response = await apiClient.post<ApiResponse<RFQ>>("/rfqs", payload);

  return response.data.data;
}

export async function addRFQVendors({
  id,
  payload,
}: {
  id: string;
  payload: AddRFQVendorsRequest;
}) {
  const response = await apiClient.post<ApiResponse<RFQ>>(
    `/rfqs/${id}/vendors`,
    payload,
  );

  return response.data.data;
}

export async function openRFQ(id: string) {
  const response = await apiClient.post<ApiResponse<RFQ>>(`/rfqs/${id}/open`);

  return response.data.data;
}

export async function cancelRFQ(id: string) {
  const response = await apiClient.post<ApiResponse<RFQ>>(`/rfqs/${id}/cancel`);

  return response.data.data;
}

export async function createQuotation({
  id,
  payload,
}: {
  id: string;
  payload: CreateQuotationRequest;
}) {
  const response = await apiClient.post<ApiResponse<Quotation>>(
    `/rfqs/${id}/quotations`,
    payload,
  );

  return response.data.data;
}

export async function getRFQComparison(id: string) {
  const response = await apiClient.get<ApiResponse<RFQComparison>>(
    `/rfqs/${id}/comparison`,
  );

  return response.data.data;
}

export async function selectQuotation({
  id,
  payload,
}: {
  id: string;
  payload: SelectQuotationRequest;
}) {
  const response = await apiClient.post<ApiResponse<RFQ>>(
    `/rfqs/${id}/select-quotation`,
    payload,
  );

  return response.data.data;
}
