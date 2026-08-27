import { BrandScopeBar } from '@/components/molecules/portal-v2/BrandScopeBar';
import { SourcesWorkspace } from '@/components/organisms/portal-v2/sources/SourcesWorkspace';
import { fetchSourcesCatalog } from '@/services/portal-v2/sourcesCatalog';
import { resolvePortalScope } from '@/services/portal-v2/scope';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalV2SourcesPage({ searchParams }: Props) {
  const params = await searchParams;
  const scope = await resolvePortalScope(params);
  const data = await fetchSourcesCatalog();

  return (
    <div className='flex min-h-0 flex-col'>
      <BrandScopeBar scope={scope} />
      <SourcesWorkspace
        key={scope.brandId ?? 'none'}
        initialSources={data.sources}
        wizards={data.wizards}
        initialError={data.error ?? scope.error}
      />
    </div>
  );
}
