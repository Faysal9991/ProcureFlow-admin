import { PurchaseRequestDetailPage } from "@/features/purchase-requests/components";

type PurchaseRequestDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function PurchaseRequestDetailRoute({
  params,
}: PurchaseRequestDetailRouteProps) {
  const { id } = await params;

  return <PurchaseRequestDetailPage requestId={id} />;
}
