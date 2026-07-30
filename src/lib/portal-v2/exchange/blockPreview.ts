import { migrateBlockV1toV2 } from '@/components/modules/block-editor/serialize';
import type { Block, Device } from '@/components/modules/block-editor/types';
import { rexerApi } from '@/services/rexer/endpoints';

/** Session cache — API parse OK (settings shape). */
const blockPreviewCache = new Map<string, Block>();
const blockPreviewInflight = new Map<string, Promise<Block | null>>();

/** Session cache — embed iframe warmed. */
const blockEmbedCache = new Set<string>();
const blockEmbedInflight = new Map<string, Promise<boolean>>();

const BLOCK_EMBED_TIMEOUT_MS = 30_000;

/** Parse BE `Block.settings` → editor Block. Null if shape is invalid. */
const parseEditorBlock = (
  settings: Record<string, unknown> | undefined
): Block | null => {
  if (!settings || typeof settings !== 'object') return null;
  if (!('blockType' in settings)) return null;
  return migrateBlockV1toV2(settings);
};

export const exchangeBlockEmbedSrc = (
  blockId: string,
  device: Device = 'desktop'
): string =>
  `/embed/block/${encodeURIComponent(blockId)}?device=${encodeURIComponent(device)}`;

export const isExchangeBlockPreviewCached = (blockId: string): boolean =>
  blockPreviewCache.has(blockId);

export const getCachedExchangeBlockPreview = (blockId: string): Block | null =>
  blockPreviewCache.get(blockId) ?? null;

export const markExchangeBlockPreviewCached = (blockId: string): void => {
  blockEmbedCache.add(blockId);
};

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

/**
 * Warm the block embed iframe (desktop default). Resolves on onLoad or timeout.
 * Call after API prefetch succeeds so invalid blocks never open the stage.
 */
export const prefetchExchangeBlockEmbed = (
  blockId: string,
  device: Device = 'desktop'
): Promise<boolean> => {
  if (typeof document === 'undefined') return Promise.resolve(false);
  if (blockEmbedCache.has(blockId)) return Promise.resolve(true);

  const inflight = blockEmbedInflight.get(blockId);
  if (inflight) return inflight;

  const request = new Promise<boolean>(resolve => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.tabIndex = -1;
    iframe.style.cssText =
      'position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none';
    iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups';
    iframe.src = exchangeBlockEmbedSrc(blockId, device);

    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      iframe.onload = null;
      iframe.remove();
      blockEmbedInflight.delete(blockId);
      if (ok) blockEmbedCache.add(blockId);
      resolve(ok);
    };

    const timer = window.setTimeout(
      () => finish(false),
      BLOCK_EMBED_TIMEOUT_MS
    );

    iframe.onload = () => finish(true);
    document.body.appendChild(iframe);
  });

  blockEmbedInflight.set(blockId, request);
  return request;
};
