import { BrandScopeBar } from '@/components/molecules/portal-v2/BrandScopeBar';
import { JourneyAuditWorkspace } from '@/components/organisms/portal-v2/journey-audit/JourneyAuditWorkspace';
import { readJourneyAuditParams } from '@/lib/portal-v2/journey-audit/params';
import {
  fetchDropoffBundle,
  fetchJourneyAuditBundle,
} from '@/services/portal-v2/journeyAudit';
import { resolvePortalScope } from '@/services/portal-v2/scope';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalV2JourneyAuditPage({
  searchParams,
}: Props) {
  const params = await searchParams;
  const scope = await resolvePortalScope(params);
  const initialState = readJourneyAuditParams(params);
  // Journey cần cả leaks của Drop-off (phase risk chip, ghost warning, drawer
  // revenue impact) — hai nguồn độc lập ⇒ song song.
  const [bundle, dropoffBundle] = await Promise.all([
    fetchJourneyAuditBundle({ brandId: scope.brandId }),
    fetchDropoffBundle({ brandId: scope.brandId }),
  ]);

  return (
    <div className='flex min-h-0 flex-col'>
      <BrandScopeBar scope={scope} />
      {/* Đổi brand ⇒ remount; state gieo bằng `useState(() => prop)`. */}
      <JourneyAuditWorkspace
        key={scope.brandId ?? 'none'}
        bundle={bundle}
        dropoffs={dropoffBundle.dropoffs}
        initialState={initialState}
        initialError={bundle.error ?? scope.error}
      />
    </div>
  );
}
