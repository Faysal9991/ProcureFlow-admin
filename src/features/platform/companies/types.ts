export type PlatformCompanyStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type PlatformUsage = {
  departmentCount: number;
  id: string;
  requestCountMonth: number;
  storageUsedMb: number;
  updatedAt: string;
  userCount: number;
};

export type PlatformCompany = {
  address: string;
  createdAt: string;
  email: string;
  id: string;
  name: string;
  phone: string;
  requireRfqBeforePo: boolean;
  status: PlatformCompanyStatus | string;
  updatedAt: string;
  usage?: PlatformUsage | null;
};

export type PlatformCompanyListData = {
  items: PlatformCompany[];
  limit: number;
  page: number;
  total: number;
};

export type PlatformPlan = {
  createdAt: string;
  id: string;
  isActive: boolean;
  maxDepartments?: number | null;
  maxRequestsPerMonth?: number | null;
  maxStorageMb?: number | null;
  maxUsers?: number | null;
  name: string;
  price: number;
  updatedAt: string;
};

export type PlatformPlanFilters = {
  isActive?: boolean;
};

export type PlatformSubscription = {
  companyId?: string;
  createdAt: string;
  endDate: string;
  id: string;
  plan: PlatformPlan;
  startDate: string;
  status: string;
  updatedAt: string;
};

export type PlatformCompanyListFilters = {
  limit?: number;
  page?: number;
  planId?: string;
  search?: string;
  status?: PlatformCompanyStatus;
};

export type CreatePlatformCompanyRequest = {
  adminEmail: string;
  adminName: string;
  adminPhone?: string;
  companyAddress?: string;
  companyEmail: string;
  companyName: string;
  companyPhone?: string;
  planId: string;
  subscriptionEndDate?: string;
  subscriptionStartDate?: string;
};

export type CreatePlatformCompanyData = {
  adminUserId: string;
  companyId: string;
  subscriptionId: string;
  temporaryPassword: string;
};

export type UpdatePlatformCompanyRequest = {
  address?: string;
  email?: string;
  name?: string;
  phone?: string;
  requireRfqBeforePo?: boolean;
};

export type PlatformCompanyAction = "activate" | "suspend";

export type CreatePlatformPlanRequest = {
  isActive?: boolean;
  maxDepartments?: number | null;
  maxRequestsPerMonth?: number | null;
  maxStorageMb?: number | null;
  maxUsers?: number | null;
  name: string;
  price: number;
};

export type UpdatePlatformPlanRequest = Partial<CreatePlatformPlanRequest>;

export type AssignPlatformPlanRequest = {
  endDate?: string;
  planId: string;
  startDate?: string;
};
