export type WorkflowApproverRole =
  | "MANAGER"
  | "PROCUREMENT"
  | "FINANCE"
  | "COMPANY_ADMIN";

export type ApprovalWorkflowStep = {
  createdAt: string;
  departmentId?: string;
  id: string;
  isRequired: boolean;
  role: WorkflowApproverRole | string;
  stepOrder: number;
  updatedAt: string;
  workflowId?: string;
};

export type ApprovalWorkflow = {
  createdAt: string;
  departmentId?: string;
  id: string;
  isActive: boolean;
  isDefault: boolean;
  maxAmount?: number | null;
  minAmount?: number | null;
  name: string;
  priority: number;
  steps?: ApprovalWorkflowStep[];
  updatedAt: string;
};

export type WorkflowRequest = {
  departmentId?: string | null;
  isActive?: boolean;
  isDefault?: boolean;
  maxAmount?: number | null;
  minAmount?: number | null;
  name?: string;
  priority?: number;
};

export type StepRequest = {
  departmentId?: string | null;
  isRequired?: true;
  role?: WorkflowApproverRole;
  stepOrder?: number;
};
