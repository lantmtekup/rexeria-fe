import { rexerApi } from '@/services/rexer/endpoints';
import type { Page } from '@/services/rexer/types';

/**
 * BE thường lưu `thumbnail_asset_id` nhưng không resolve `thumbnail_url`
 * trên list/get page. Batch-resolve qua media.list để hiển thị ảnh card.
 */
const MEDIA_IDS_PER_REQUEST = 100;

export async function enrichPagesWithThumbnailUrls(
  pages: Page[]
): Promise<Page[]> {
  if (pages.length === 0) return pages;

  const assetIdByPage = new Map<string, string>();
  for (const page of pages) {
    if (page.thumbnail_url) continue;
    if (page.thumbnail_asset_id) {
      assetIdByPage.set(page.id, page.thumbnail_asset_id);
    }
  }

  const assetIds = Array.from(new Set(assetIdByPage.values()));
  if (assetIds.length === 0) return pages;

  // BE caps `ids` ở 100 mỗi request → chia lô (list page có thể lên tới 500).
  const batches: string[][] = [];
  for (let i = 0; i < assetIds.length; i += MEDIA_IDS_PER_REQUEST) {
    batches.push(assetIds.slice(i, i + MEDIA_IDS_PER_REQUEST));
  }

  const media = await Promise.all(
    batches.map(ids =>
      rexerApi.media
        .list({ ids })
        .then(r => r.items ?? [])
        .catch(() => [])
    )
  ).then(chunks => chunks.flat());

  const urlByAsset = new Map<string, string>();
  for (const asset of media) {
    if (asset.public_url) urlByAsset.set(asset.id, asset.public_url);
  }

  return pages.map(page => {
    if (page.thumbnail_url) return page;
    const assetId = assetIdByPage.get(page.id);
    const url = assetId ? urlByAsset.get(assetId) : undefined;
    if (!url) return page;
    return { ...page, thumbnail_url: url };
  });
}
