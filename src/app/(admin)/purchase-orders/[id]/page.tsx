import { PurchaseOrderDetailPage } from "@/features/purchase-orders/components";

type PurchaseOrderDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function PurchaseOrderDetailRoute({
  params,
}: PurchaseOrderDetailRouteProps) {
  const { id } = await params;

  return <PurchaseOrderDetailPage orderId={id} />;
}
