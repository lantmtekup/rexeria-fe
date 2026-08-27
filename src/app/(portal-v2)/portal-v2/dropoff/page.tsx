import { BrandScopeBar } from '@/components/molecules/portal-v2/BrandScopeBar';
import { DropoffWorkspace } from '@/components/organisms/portal-v2/dropoff/DropoffWorkspace';
import { readDropoffParams } from '@/lib/portal-v2/journey-audit/params';
import {
  fetchDropoffBundle,
  fetchJourneyAuditBundle,
} from '@/services/portal-v2/journeyAudit';
import { resolvePortalScope } from '@/services/portal-v2/scope';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalV2DropoffPage({ searchParams }: Props) {
  const params = await searchParams;
  const scope = await resolvePortalScope(params);
  const initialState = readDropoffParams(params);
  // Drop-off cần journey (stage responsible + tên touchpoint) — song song.
  const [bundle, dropoffBundle] = await Promise.all([
    fetchJourneyAuditBundle({ brandId: scope.brandId }),
    fetchDropoffBundle({ brandId: scope.brandId }),
  ]);

  return (
    <div className='flex min-h-0 flex-col'>
      <BrandScopeBar scope={scope} />
      <DropoffWorkspace
        key={scope.brandId ?? 'none'}
        bundle={bundle}
        dropoffBundle={dropoffBundle}
        initialState={initialState}
        initialError={dropoffBundle.error ?? scope.error}
      />
    </div>
  );
}
