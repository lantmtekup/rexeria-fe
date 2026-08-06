import { BrandScopeBar } from '@/components/molecules/portal-v2/BrandScopeBar';
import { MediaWorkspace } from '@/components/organisms/portal-v2/media/MediaWorkspace';
import { fetchMediaCatalog } from '@/services/portal-v2/mediaCatalog';
import { resolvePortalScope } from '@/services/portal-v2/scope';
import { RxApiError } from '@/services/rexer/client';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PortalV2MediaPage({ searchParams }: Props) {
  const scope = await resolvePortalScope(await searchParams);

  try {
    // `brandId` null = admin chưa chọn ⇒ xem chéo mọi brand. Người dùng thường
    // luôn bị BE ép về brand của họ, tham số này không đổi được điều đó.
    const { assets, error } = await fetchMediaCatalog({
      brandId: scope.brandId,
    });
    return (
      <div className='flex min-h-0 flex-col'>
        <BrandScopeBar scope={scope} />
        <MediaWorkspace
          brandId={scope.brandId}
          initialAssets={assets}
          initialError={error ?? scope.error}
        />
      </div>
    );
  } catch (err) {
    const loadError =
      err instanceof RxApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Failed to load media';
    return (
      <div className='flex min-h-0 flex-col'>
        <BrandScopeBar scope={scope} />
        <MediaWorkspace
          brandId={scope.brandId}
          initialAssets={[]}
          initialError={loadError}
        />
      </div>
    );
  }
}
