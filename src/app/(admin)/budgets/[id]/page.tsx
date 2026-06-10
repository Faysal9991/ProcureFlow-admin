import { BudgetDetailPage } from "@/features/budgets/components";

type BudgetDetailRouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BudgetDetailRoute({
  params,
}: BudgetDetailRouteProps) {
  const { id } = await params;

  return <BudgetDetailPage budgetId={id} />;
}
