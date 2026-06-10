import { PlatformSubscriptionsPage } from "@/features/platform/subscriptions/components";

type PlatformSubscriptionsRouteProps = {
  searchParams: Promise<{ companyId?: string }>;
};

export default async function PlatformSubscriptionsRoute({
  searchParams,
}: PlatformSubscriptionsRouteProps) {
  const { companyId } = await searchParams;

  return <PlatformSubscriptionsPage focusedCompanyId={companyId} />;
}
