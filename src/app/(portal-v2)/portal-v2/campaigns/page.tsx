import { BrandScopeBar } from '@/components/molecules/portal-v2/BrandScopeBar';
import { CampaignsWorkspace } from '@/components/organisms/portal-v2/campaigns/CampaignsWorkspace';
import { readCampaignIdParam } from '@/lib/portal-v2/campaigns/idParam';
import { withJourneyLinks } from '@/lib/portal-v2/campaigns/journeyLink';
import { fetchCampaignBoard } from '@/services/portal-v2/campaignBoardV2';
import { fetchJourneyBoard } from '@/services/portal-v2/journeyBoard';
import { fetchCampaignExperienceLibrary } from '@/services/portal-v2/campaignExperiences';
import { fetchProductCatalog } from '@/services/portal-v2/productCatalog';
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
  const [board, journeys, catalog, experiences] = await Promise.all([
    fetchCampaignBoard({ brandId: scope.brandId }),
    fetchJourneyBoard({ brandId: scope.brandId }),
    // Hộp "Thêm vào chiến dịch này" phải liệt kê SKU thật của brand — bản
    // trước dùng `MOCK_PRODUCTS`, tức một dòng mỹ phẩm không tồn tại.
    fetchProductCatalog({ brandId: scope.brandId }),
    // Hộp chọn trải nghiệm phải là thư viện THẬT — bản trước dùng
    // `MOCK_CAMPAIGN_EXPERIENCES`, tức gắn lên một id không tồn tại.
    fetchCampaignExperienceLibrary(scope.brandId),
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
        brandId={scope.brandId}
        initialProducts={catalog.products.map(p => ({
          id: p.id,
          name: p.title,
        }))}
        initialExperiences={experiences}
        initialError={board.error ?? scope.error}
      />
    </div>
  );
}
