export type AdminRole =
  | "COMPANY_ADMIN"
  | "EMPLOYEE"
  | "FINANCE"
  | "MANAGER"
  | "PROCUREMENT"
  | "SUPER_ADMIN";

export type AdminStatus = "ACTIVE" | "DISABLED" | "INVITED";

export type AuthUser = {
  avatarUrl?: string | null;
  companyId?: number | null;
  departmentId?: number | null;
  departmentName?: string | null;
  email: string;
  id: number;
  mustChangePassword: boolean;
  name: string;
  role: AdminRole | string;
  status?: AdminStatus;
  uuid: string;
};

export type AdminUser = AuthUser;

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
};
