export type AuditLogUser = {
  email?: string;
  id?: string;
  name?: string;
  role?: string;
};

export type AuditJsonValue =
  | AuditJsonValue[]
  | boolean
  | null
  | number
  | string
  | { [key: string]: AuditJsonValue };

export type AuditLog = {
  action: string;
  companyId?: number;
  createdAt: string;
  entityId?: string;
  entityType: string;
  id: string;
  ipAddress: string;
  newData?: AuditJsonValue;
  oldData?: AuditJsonValue;
  user?: AuditLogUser;
  userAgent: string;
};

export type AuditLogListData = {
  items: AuditLog[];
  limit: number;
  page: number;
  total: number;
};

export type AuditLogFilters = {
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  entityId?: string;
  entityType?: string;
  limit?: number;
  page?: number;
  userId?: string;
};

export type AuditLogListMode = "entity" | "list";

export type AuditOption = {
  label: string;
  value: string;
};
