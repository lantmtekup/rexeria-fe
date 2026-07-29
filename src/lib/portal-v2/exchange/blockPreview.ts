import { migrateBlockV1toV2 } from '@/components/modules/block-editor/serialize';
import type { Block } from '@/components/modules/block-editor/types';
import { rexerApi } from '@/services/rexer/endpoints';

/** Session cache — prefetch before opening preview avoids shell mount flash. */
const blockPreviewCache = new Map<string, Block>();
const blockPreviewInflight = new Map<string, Promise<Block | null>>();

/** Parse BE `Block.settings` → editor Block. Null if shape is invalid. */
const parseEditorBlock = (
  settings: Record<string, unknown> | undefined
): Block | null => {
  if (!settings || typeof settings !== 'object') return null;
  if (!('blockType' in settings)) return null;
  return migrateBlockV1toV2(settings);
};

export const isExchangeBlockPreviewCached = (blockId: string): boolean =>
  blockPreviewCache.has(blockId);

export const getCachedExchangeBlockPreview = (blockId: string): Block | null =>
  blockPreviewCache.get(blockId) ?? null;

/** Fetch + cache block canvas. Dedupes concurrent requests for the same id. */
export const prefetchExchangeBlockPreview = (
  blockId: string
): Promise<Block | null> => {
  const cached = blockPreviewCache.get(blockId);
  if (cached) return Promise.resolve(cached);

  const inflight = blockPreviewInflight.get(blockId);
  if (inflight) return inflight;

  const request = rexerApi.blocks
    .get(blockId)
    .then(apiBlock => {
      const editor = parseEditorBlock(apiBlock.settings);
      if (editor) blockPreviewCache.set(blockId, editor);
      return editor;
    })
    .finally(() => {
      blockPreviewInflight.delete(blockId);
    });

  blockPreviewInflight.set(blockId, request);
  return request;
};
