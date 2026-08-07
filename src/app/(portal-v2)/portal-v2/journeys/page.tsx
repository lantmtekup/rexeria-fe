import { BrandScopeBar } from '@/components/molecules/portal-v2/BrandScopeBar';
import { JourneysWorkspace } from '@/components/organisms/portal-v2/journeys/JourneysWorkspace';
import { readJourneyEditParam } from '@/lib/portal-v2/journeys/editParam';
import {
  fetchPersonas,
  fetchSegments,
} from '@/services/portal-v2/journeyAudience';
import { fetchCampaignBoard } from '@/services/portal-v2/campaignBoardV2';
import { fetchJourneyBoard } from '@/services/portal-v2/journeyBoard';
import { resolvePortalScope } from '@/services/portal-v2/scope';

type PortalV2JourneysPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalV2JourneysPage({
  searchParams,
}: PortalV2JourneysPageProps) {
  const params = await searchParams;
  const scope = await resolvePortalScope(params);
  const initialEditId = readJourneyEditParam(params);
  // Ba nguồn độc lập ⇒ song song.
  const [board, personas, segments, campaigns] = await Promise.all([
    fetchJourneyBoard({ brandId: scope.brandId }),
    fetchPersonas(scope.brandId),
    fetchSegments(scope.brandId),
    // "Use in campaign" cần chiến dịch THẬT: fork vào một id bịa là 404.
    fetchCampaignBoard({ brandId: scope.brandId }),
  ]);

  return (
    <div className='flex min-h-0 flex-col'>
      <BrandScopeBar scope={scope} />
      {/* Đổi brand ⇒ remount; state gieo bằng `useState(() => prop)`. */}
      <JourneysWorkspace
        key={scope.brandId ?? 'none'}
        initialEditId={initialEditId}
        initialJourneys={board.items}
        initialVersions={board.versions}
        brandId={scope.brandId}
        personas={personas}
        campaigns={campaigns.items.map(c => ({
          id: c.id,
          name: c.name,
          stage: c.status,
        }))}
        segments={segments}
        initialError={board.error ?? scope.error}
      />
    </div>
  );
}
