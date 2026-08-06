import { redirect } from 'next/navigation';

import { CAMPAIGN_ID_PARAM } from '@/lib/portal-v2/campaigns/idParam';

type PortalV2CampaignPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * The campaign screen is not its own route: the list and the detail share one
 * state tree, so opening a campaign is a query param, not a navigation. This
 * only exists to keep links minted before that change alive.
 */
export default async function PortalV2CampaignPage({
  params,
}: PortalV2CampaignPageProps) {
  const { id } = await params;
  redirect(
    `/portal-v2/campaigns?${CAMPAIGN_ID_PARAM}=${encodeURIComponent(id)}`
  );
}
