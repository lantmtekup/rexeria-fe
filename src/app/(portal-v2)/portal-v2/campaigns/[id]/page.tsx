import { notFound } from 'next/navigation';

import { CampaignDetail } from '@/components/organisms/portal-v2/campaigns/CampaignDetail';
import { fetchCampaign } from '@/services/portal-v2/campaignBoard';

type PortalV2CampaignPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PortalV2CampaignPage({
  params,
}: PortalV2CampaignPageProps) {
  const { id } = await params;
  const { campaign, degraded } = await fetchCampaign(id);

  if (!campaign) notFound();

  return <CampaignDetail campaign={campaign} degraded={degraded} />;
}
