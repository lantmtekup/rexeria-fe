import { BrandScopeBar } from '@/components/molecules/portal-v2/BrandScopeBar';
import { ExperiencesWorkspace } from '@/components/organisms/portal-v2/experiences/ExperiencesWorkspace';
import { readExchangePreviewParam } from '@/lib/portal-v2/exchange/previewParam';
import { fetchExperienceLibrary } from '@/services/portal-v2/experienceLibrary';
import { resolvePortalScope } from '@/services/portal-v2/scope';

type PortalV2ExperiencesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalV2ExperiencesPage({
  searchParams,
}: PortalV2ExperiencesPageProps) {
  const sp = await searchParams;
  const initialPreviewId = readExchangePreviewParam(sp);
  const scope = await resolvePortalScope(sp);
  const { items, error } = await fetchExperienceLibrary({
    brandId: scope.brandId,
  });

  return (
    <div className='flex min-h-0 flex-col'>
      <BrandScopeBar scope={scope} />
      <ExperiencesWorkspace
        brandId={scope.brandId}
        initialItems={items}
        initialError={error ?? scope.error}
        initialPreviewId={initialPreviewId}
      />
    </div>
  );
}
