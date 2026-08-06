import { CampaignsWorkspace } from '@/components/organisms/portal-v2/campaigns/CampaignsWorkspace';
import { readCampaignIdParam } from '@/lib/portal-v2/campaigns/idParam';

type PortalV2CampaignsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalV2CampaignsPage({
  searchParams,
}: PortalV2CampaignsPageProps) {
  const initialId = readCampaignIdParam(await searchParams);

  return <CampaignsWorkspace initialCampaignId={initialId} />;
}
