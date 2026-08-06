import { BrandScopeBar } from '@/components/molecules/portal-v2/BrandScopeBar';
import { BrandWorkspace } from '@/components/organisms/portal-v2/brand/BrandWorkspace';
import { emptyBrandData } from '@/lib/portal-v2/brand/mapProfile';
import { fetchBrandProfile } from '@/services/portal-v2/brandProfile';
import { resolvePortalScope } from '@/services/portal-v2/scope';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalV2BrandPage({ searchParams }: Props) {
  const scope = await resolvePortalScope(await searchParams);
  // Admin chưa chọn brand ⇒ KHÔNG nạp gì. Nạp đại một brand là cách màn hình
  // nói dối về việc đang sửa hồ sơ của ai.
  const profile = await fetchBrandProfile(scope.brandId);

  return (
    <div className='flex min-h-0 flex-col'>
      <BrandScopeBar scope={scope} />
      <BrandWorkspace
        // Nạp hỏng ⇒ khung TRỐNG, không phải mock. Vẽ "Ilia Beauty" ở đây
        // khiến người dùng tưởng đó là hồ sơ brand mình rồi bấm Edit lên nó.
        initialData={profile.data ?? emptyBrandData()}
        initialVersion={profile.version}
        brandId={scope.brandId}
        initialError={profile.error ?? scope.error}
      />
    </div>
  );
}
