export type UserRole =
  | "COMPANY_ADMIN"
  | "EMPLOYEE"
  | "MANAGER"
  | "PROCUREMENT"
  | "FINANCE";

export type UserStatus = "ACTIVE" | "INACTIVE";

export type CompanyRole = {
  description?: string;
  id: string;
  isActive?: boolean;
  isSystemTemplate?: boolean;
  name: string;
  templateKey?: string;
};

export type ManagedUser = {
  companyId?: number | null;
  companyRole?: CompanyRole | null;
  createdAt: string;
  departmentId?: string | null;
  departmentName?: string;
  email: string;
  id: number;
  mustChangePassword: boolean;
  name: string;
  phone?: string | null;
  role: UserRole | string;
  status: UserStatus | string;
  updatedAt: string;
  uuid: string;
};

export type UserListData = {
  items: ManagedUser[];
  limit: number;
  page: number;
  total: number;
};

export type UserListFilters = {
  departmentId?: string;
  limit?: number;
  page?: number;
  role?: string;
  search?: string;
  status?: string;
};

export type CreateUserRequest = {
  companyRoleId?: string;
  departmentId?: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
};

export type UpdateUserRequest = {
  companyRoleId?: string;
  departmentId?: string;
  name: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
};

export type CreateUserResponseData = {
  temporaryPassword: string;
  user?: ManagedUser;
  userId: string;
};

export type ResetPasswordResponseData = {
  temporaryPassword: string;
};

export type CompanyRoleListData = {
  items: CompanyRole[];
  total: number;
};
