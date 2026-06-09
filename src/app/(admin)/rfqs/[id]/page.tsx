import { RFQDetailPage } from "@/features/rfqs/components";

type RFQDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function RFQDetailRoute({
  params,
}: RFQDetailRouteProps) {
  const { id } = await params;

  return <RFQDetailPage rfqId={id} />;
}
