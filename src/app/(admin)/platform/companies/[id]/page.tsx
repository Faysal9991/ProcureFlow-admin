import { PlatformCompanyDetailPage } from "@/features/platform/companies/components";

type PlatformCompanyDetailRouteProps = {
  params: Promise<{ id: string }>;
};

export default async function PlatformCompanyDetailRoute({
  params,
}: PlatformCompanyDetailRouteProps) {
  const { id } = await params;

  return <PlatformCompanyDetailPage companyId={id} />;
}
