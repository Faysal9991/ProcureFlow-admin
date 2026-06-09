import { WorkflowDetailPage } from "@/features/approval-workflows/components";

type ApprovalWorkflowDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function ApprovalWorkflowDetailRoute({
  params,
}: ApprovalWorkflowDetailRouteProps) {
  const { id } = await params;

  return <WorkflowDetailPage workflowId={id} />;
}
