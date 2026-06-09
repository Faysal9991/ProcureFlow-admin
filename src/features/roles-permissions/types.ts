export type Permission = {
  category?: string;
  description?: string;
  id: string;
  key: string;
  name: string;
};

export type CompanyRole = {
  description?: string;
  id: string;
  isActive: boolean;
  isSystemTemplate: boolean;
  name: string;
  permissions: Permission[];
  templateKey?: string;
};

export type CompanyRoleListData = {
  items: CompanyRole[];
  total: number;
};

export type CreateCompanyRoleRequest = {
  description?: string;
  name: string;
  permissionIds?: string[];
};

export type CreateCompanyRoleInput = CreateCompanyRoleRequest & {
  isActive?: boolean;
};

export type UpdateCompanyRoleRequest = {
  description?: string;
  isActive?: boolean;
  name?: string;
};

export type ReplaceRolePermissionsRequest = {
  permissionIds: string[];
};

export type AssignUserRoleRequest = {
  roleId: string;
};

export type AssignableUser = {
  companyRole?: Pick<CompanyRole, "id" | "name" | "templateKey"> | null;
  email: string;
  name: string;
  role: string;
  status: string;
  uuid: string;
};

export type AssignableUserListData = {
  items: AssignableUser[];
  limit: number;
  page: number;
  total: number;
};

export type AssignableUserFilters = {
  limit?: number;
  page?: number;
  search?: string;
  status?: string;
};

export type UserRoleAssignment = {
  role: CompanyRole;
  userId: string;
};
