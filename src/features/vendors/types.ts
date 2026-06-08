export type VendorStatus = "ACTIVE" | "INACTIVE";

export type Vendor = {
  address: string;
  companyId: number;
  contactPerson: string;
  createdAt: string;
  email: string;
  id: string;
  name: string;
  phone: string;
  status: VendorStatus | string;
  updatedAt: string;
};

export type VendorListData = {
  items: Vendor[];
  limit: number;
  page: number;
  total: number;
};

export type VendorListFilters = {
  limit?: number;
  page?: number;
  search?: string;
  status?: string;
};

export type CreateVendorRequest = {
  address?: string;
  contactPerson?: string;
  email?: string;
  name: string;
  phone?: string;
  status: VendorStatus;
};

export type UpdateVendorRequest = Partial<CreateVendorRequest>;
