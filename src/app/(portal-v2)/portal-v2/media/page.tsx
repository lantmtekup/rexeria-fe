import { MediaWorkspace } from '@/components/organisms/portal-v2/media/MediaWorkspace';
import { fetchMediaCatalog } from '@/services/portal-v2/mediaCatalog';
import { RxApiError } from '@/services/rexer/client';

export default async function PortalV2MediaPage() {
  try {
    const { assets, error } = await fetchMediaCatalog();
    return <MediaWorkspace initialAssets={assets} initialError={error} />;
  } catch (err) {
    const loadError =
      err instanceof RxApiError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Failed to load media';
    return <MediaWorkspace initialAssets={[]} initialError={loadError} />;
  }
}
