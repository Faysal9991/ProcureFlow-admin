import { PlatformBillingInvoiceDetailPage } from "@/features/platform/billing/components";

type PlatformBillingInvoiceDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function PlatformBillingInvoiceDetailRoute({
  params,
}: PlatformBillingInvoiceDetailRouteProps) {
  const { id } = await params;

  return <PlatformBillingInvoiceDetailPage invoiceId={id} />;
}
