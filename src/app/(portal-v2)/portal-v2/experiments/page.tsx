import { BrandScopeBar } from '@/components/molecules/portal-v2/BrandScopeBar';
import { ExperimentsWorkspace } from '@/components/organisms/portal-v2/experiments/ExperimentsWorkspace';
import { readExperimentIdParam } from '@/lib/portal-v2/experiments/idParam';
import { fetchExperiments } from '@/services/portal-v2/experiments';
import { resolvePortalScope } from '@/services/portal-v2/scope';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalV2ExperimentsPage({ searchParams }: Props) {
  const params = await searchParams;
  const scope = await resolvePortalScope(params);
  const experimentId = readExperimentIdParam(params);
  const bundle = await fetchExperiments({ brandId: scope.brandId });

  return (
    <div className='flex min-h-0 flex-col'>
      <BrandScopeBar scope={scope} />
      {/* Đổi brand ⇒ remount; state gieo bằng `useState(() => prop)`. */}
      <ExperimentsWorkspace
        key={scope.brandId ?? 'none'}
        initialExperiments={bundle.experiments}
        demoData={bundle.demoData}
        live={bundle.live}
        initialExperimentId={experimentId}
        initialError={bundle.error ?? scope.error}
      />
    </div>
  );
}
