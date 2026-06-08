import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  CreateVendorRequest,
  UpdateVendorRequest,
  Vendor,
  VendorListData,
  VendorListFilters,
} from "./types";

const emptyVendorList: VendorListData = {
  items: [],
  limit: 10,
  page: 1,
  total: 0,
};

function compactParams(filters: VendorListFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value != null),
  );
}

function normalizeVendorList(data?: VendorListData): VendorListData {
  return {
    items: data?.items ?? [],
    limit: data?.limit ?? emptyVendorList.limit,
    page: data?.page ?? emptyVendorList.page,
    total: data?.total ?? 0,
  };
}

export async function getVendors(filters: VendorListFilters) {
  const response = await apiClient.get<ApiResponse<VendorListData>>(
    "/vendors",
    {
      params: compactParams(filters),
    },
  );

  return normalizeVendorList(response.data.data);
}

export async function getVendor(id: string) {
  const response = await apiClient.get<ApiResponse<Vendor>>(`/vendors/${id}`);

  return response.data.data;
}

export async function createVendor(payload: CreateVendorRequest) {
  const response = await apiClient.post<ApiResponse<Vendor>>(
    "/vendors",
    payload,
  );

  return response.data.data;
}

export async function updateVendor({
  id,
  payload,
}: {
  id: string;
  payload: UpdateVendorRequest;
}) {
  const response = await apiClient.patch<ApiResponse<Vendor>>(
    `/vendors/${id}`,
    payload,
  );

  return response.data.data;
}

export async function deleteVendor(id: string) {
  await apiClient.delete<ApiResponse<null>>(`/vendors/${id}`);
}
