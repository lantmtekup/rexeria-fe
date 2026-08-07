import { BrandScopeBar } from '@/components/molecules/portal-v2/BrandScopeBar';
import { CampaignsWorkspace } from '@/components/organisms/portal-v2/campaigns/CampaignsWorkspace';
import { readCampaignIdParam } from '@/lib/portal-v2/campaigns/idParam';
import { withJourneyLinks } from '@/lib/portal-v2/campaigns/journeyLink';
import { fetchCampaignBoard } from '@/services/portal-v2/campaignBoardV2';
import { fetchJourneyBoard } from '@/services/portal-v2/journeyBoard';
import { resolvePortalScope } from '@/services/portal-v2/scope';

type PortalV2CampaignsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalV2CampaignsPage({
  searchParams,
}: PortalV2CampaignsPageProps) {
  const params = await searchParams;
  const scope = await resolvePortalScope(params);
  const initialId = readCampaignIdParam(params);
  // Hai nguồn độc lập ⇒ chạy song song; nối tiếp thì thời gian cộng dồn.
  const [board, journeys] = await Promise.all([
    fetchCampaignBoard({ brandId: scope.brandId }),
    fetchJourneyBoard({ brandId: scope.brandId }),
  ]);

  return (
    <div className='flex min-h-0 flex-col'>
      <BrandScopeBar scope={scope} />
      {/*
        Đổi brand ⇒ REMOUNT. Workspace gieo state bằng `useState(() => prop)`,
        mà initializer chỉ chạy lúc mount.
      */}
      <CampaignsWorkspace
        key={scope.brandId ?? 'none'}
        initialCampaignId={initialId}
        // Nối bằng `journeys.campaign_id` — `CampaignV2` không có `journey_id`.
        initialCampaigns={withJourneyLinks(board.items, journeys.items)}
        initialJourneys={journeys.items}
        initialError={board.error ?? scope.error}
      />
    </div>
  );
}
