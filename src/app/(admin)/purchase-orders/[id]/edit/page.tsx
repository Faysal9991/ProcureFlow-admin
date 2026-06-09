import { PurchaseOrderFormPage } from "@/features/purchase-orders/components";

type EditPurchaseOrderRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPurchaseOrderRoute({
  params,
}: EditPurchaseOrderRouteProps) {
  const { id } = await params;

  return <PurchaseOrderFormPage mode="edit" orderId={id} />;
}
