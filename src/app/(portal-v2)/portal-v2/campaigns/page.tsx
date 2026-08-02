import { CampaignsWorkspace } from '@/components/organisms/portal-v2/campaigns/CampaignsWorkspace';
import { fetchCampaignBoard } from '@/services/portal-v2/campaignBoard';

export default async function PortalV2CampaignsPage() {
  const { items, error, source, degraded } = await fetchCampaignBoard();
  return (
    <CampaignsWorkspace
      initialItems={items}
      initialError={error}
      initialSource={source}
      initialDegraded={degraded}
    />
  );
}
