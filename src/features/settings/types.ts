export type WorkflowSummary = {
  departmentId?: string;
  id: string;
  isActive: boolean;
  isDefault: boolean;
  maxAmount?: number | null;
  minAmount?: number | null;
  name: string;
  priority: number;
};

export type CompanySettings = {
  address: string;
  budgetEnforcementEnabled: boolean;
  createdAt: string;
  defaultCurrency: string;
  defaultWorkflow?: WorkflowSummary | null;
  defaultWorkflowId?: string;
  email: string;
  fiscalYearStartMonth: number;
  id: string;
  logoUrl: string;
  name: string;
  passwordMaxAgeDays?: number | null;
  passwordRotationEnabled: boolean;
  phone: string;
  requireRfqBeforePo: boolean;
  sessionExpiryHours?: number | null;
  status: string;
  updatedAt: string;
};

export type UpdateCompanySettingsRequest = Partial<{
  address: string;
  budgetEnforcementEnabled: boolean;
  defaultCurrency: string;
  defaultWorkflowId: string;
  email: string;
  fiscalYearStartMonth: number;
  logoUrl: string;
  name: string;
  passwordMaxAgeDays: number;
  passwordRotationEnabled: boolean;
  phone: string;
  requireRfqBeforePo: boolean;
  sessionExpiryHours: number;
}>;
