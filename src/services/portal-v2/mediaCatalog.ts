import { mapRexerMediaAssetToUi } from '@/lib/portal-v2/media/mapMediaAsset';
import type { MediaAsset } from '@/lib/portal-v2/media/types';
import { rexerApi } from '@/services/rexer/endpoints';

export type MediaCatalogQuery = {
  q?: string;
};

export type MediaCatalogResult = {
  assets: MediaAsset[];
  error: string | null;
};

const LIST_LIMIT = 200;

/** GET /media?limit=200[&q=...] — mapped to the Portal V2 UI asset shape. */
export const fetchMediaCatalog = async (
  query: MediaCatalogQuery = {}
): Promise<MediaCatalogResult> => {
  try {
    const res = await rexerApi.media.list({ limit: LIST_LIMIT, q: query.q });
    return {
      assets: (res.items ?? []).map(mapRexerMediaAssetToUi),
      error: null,
    };
  } catch (err) {
    return {
      assets: [],
      error: err instanceof Error ? err.message : 'Failed to load media',
    };
  }
};
