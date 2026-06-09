import { PurchaseRequestFormPage } from "@/features/purchase-requests/components";

type EditPurchaseRequestRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPurchaseRequestRoute({
  params,
}: EditPurchaseRequestRouteProps) {
  const { id } = await params;

  return <PurchaseRequestFormPage mode="edit" requestId={id} />;
}
