import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  ApprovalWorkflow,
  ApprovalWorkflowStep,
  StepRequest,
  WorkflowRequest,
} from "./types";

export async function getApprovalWorkflows() {
  const response =
    await apiClient.get<ApiResponse<ApprovalWorkflow[]>>(
      "/approval-workflows",
    );

  return response.data.data ?? [];
}

export async function getApprovalWorkflow(id: string) {
  const response = await apiClient.get<ApiResponse<ApprovalWorkflow>>(
    `/approval-workflows/${id}`,
  );

  return response.data.data;
}

export async function createApprovalWorkflow(payload: WorkflowRequest) {
  const response = await apiClient.post<ApiResponse<ApprovalWorkflow>>(
    "/approval-workflows",
    payload,
  );

  return response.data.data;
}

export async function updateApprovalWorkflow({
  id,
  payload,
}: {
  id: string;
  payload: WorkflowRequest;
}) {
  const response = await apiClient.patch<ApiResponse<ApprovalWorkflow>>(
    `/approval-workflows/${id}`,
    payload,
  );

  return response.data.data;
}

export async function deleteApprovalWorkflow(id: string) {
  await apiClient.delete<ApiResponse<null>>(`/approval-workflows/${id}`);
}

export async function getApprovalWorkflowSteps(workflowId: string) {
  const response = await apiClient.get<ApiResponse<ApprovalWorkflowStep[]>>(
    `/approval-workflows/${workflowId}/steps`,
  );

  return response.data.data ?? [];
}

export async function createApprovalWorkflowStep({
  payload,
  workflowId,
}: {
  payload: StepRequest;
  workflowId: string;
}) {
  const response = await apiClient.post<ApiResponse<ApprovalWorkflowStep>>(
    `/approval-workflows/${workflowId}/steps`,
    payload,
  );

  return response.data.data;
}

export async function updateApprovalWorkflowStep({
  payload,
  stepId,
  workflowId,
}: {
  payload: StepRequest;
  stepId: string;
  workflowId: string;
}) {
  const response = await apiClient.patch<ApiResponse<ApprovalWorkflowStep>>(
    `/approval-workflows/${workflowId}/steps/${stepId}`,
    payload,
  );

  return response.data.data;
}

export async function deleteApprovalWorkflowStep({
  stepId,
  workflowId,
}: {
  stepId: string;
  workflowId: string;
}) {
  await apiClient.delete<ApiResponse<null>>(
    `/approval-workflows/${workflowId}/steps/${stepId}`,
  );
}
