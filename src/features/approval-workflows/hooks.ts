import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createApprovalWorkflow,
  createApprovalWorkflowStep,
  deleteApprovalWorkflow,
  deleteApprovalWorkflowStep,
  getApprovalWorkflow,
  getApprovalWorkflows,
  getApprovalWorkflowSteps,
  updateApprovalWorkflow,
  updateApprovalWorkflowStep,
} from "./api";

export const approvalWorkflowQueryKeys = {
  all: ["approval-workflows"] as const,
  detail: (id: string) => ["approval-workflows", "detail", id] as const,
  list: () => ["approval-workflows", "list"] as const,
  steps: (workflowId: string) =>
    ["approval-workflows", "steps", workflowId] as const,
};

function invalidateWorkflow(
  queryClient: ReturnType<typeof useQueryClient>,
  workflowId?: string,
) {
  queryClient.invalidateQueries({ queryKey: approvalWorkflowQueryKeys.all });

  if (workflowId) {
    queryClient.invalidateQueries({
      queryKey: approvalWorkflowQueryKeys.detail(workflowId),
    });
    queryClient.invalidateQueries({
      queryKey: approvalWorkflowQueryKeys.steps(workflowId),
    });
  }
}

export function useApprovalWorkflows(enabled = true) {
  return useQuery({
    enabled,
    queryFn: getApprovalWorkflows,
    queryKey: approvalWorkflowQueryKeys.list(),
  });
}

export function useApprovalWorkflow(id: string, enabled = true) {
  return useQuery({
    enabled: enabled && !!id,
    queryFn: () => getApprovalWorkflow(id),
    queryKey: approvalWorkflowQueryKeys.detail(id),
  });
}

export function useApprovalWorkflowSteps(workflowId: string, enabled = true) {
  return useQuery({
    enabled: enabled && !!workflowId,
    queryFn: () => getApprovalWorkflowSteps(workflowId),
    queryKey: approvalWorkflowQueryKeys.steps(workflowId),
  });
}

export function useCreateApprovalWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createApprovalWorkflow,
    onSuccess: (workflow) => {
      invalidateWorkflow(queryClient, workflow.id);
    },
  });
}

export function useUpdateApprovalWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateApprovalWorkflow,
    onSuccess: (workflow) => {
      invalidateWorkflow(queryClient, workflow.id);
      queryClient.setQueryData(
        approvalWorkflowQueryKeys.detail(workflow.id),
        workflow,
      );
    },
  });
}

export function useDeleteApprovalWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteApprovalWorkflow,
    onSuccess: () => {
      invalidateWorkflow(queryClient);
    },
  });
}

export function useCreateApprovalWorkflowStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createApprovalWorkflowStep,
    onSuccess: (step) => {
      invalidateWorkflow(queryClient, step.workflowId);
    },
  });
}

export function useUpdateApprovalWorkflowStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateApprovalWorkflowStep,
    onSuccess: (step) => {
      invalidateWorkflow(queryClient, step.workflowId);
    },
  });
}

export function useDeleteApprovalWorkflowStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteApprovalWorkflowStep,
    onSuccess: (_, variables) => {
      invalidateWorkflow(queryClient, variables.workflowId);
    },
  });
}
