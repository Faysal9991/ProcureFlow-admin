import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createVendor,
  deleteVendor,
  getVendor,
  getVendors,
  updateVendor,
} from "./api";
import type { VendorListFilters } from "./types";

export const vendorQueryKeys = {
  all: ["vendors"] as const,
  detail: (id: string) => ["vendors", id] as const,
  list: (filters: VendorListFilters) => ["vendors", "list", filters] as const,
};

export function useVendors(filters: VendorListFilters, enabled = true) {
  return useQuery({
    enabled,
    queryFn: () => getVendors(filters),
    queryKey: vendorQueryKeys.list(filters),
  });
}

export function useVendor(id: string, enabled: boolean) {
  return useQuery({
    enabled,
    queryFn: () => getVendor(id),
    queryKey: vendorQueryKeys.detail(id),
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.all });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateVendor,
    onSuccess: (vendor) => {
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.all });
      queryClient.setQueryData(vendorQueryKeys.detail(vendor.id), vendor);
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorQueryKeys.all });
    },
  });
}
