import {
  adaptCanvasBlueprint,
  parseCanvas,
} from '@/components/modules/block-editor/serialize';
import type { BlockType } from '@/components/modules/block-editor/types';
import { rexerApi } from '@/services/rexer/endpoints';

export type ExchangePageLayer = {
  id: string;
  name: string;
  blockType: BlockType;
  index: number;
};

const pageLayersCache = new Map<string, ExchangePageLayer[]>();
const pageLayersInflight = new Map<string, Promise<ExchangePageLayer[]>>();

/** Visible blocks from the published `/p/{slug}` canvas (same source as live page). */
export const getCachedExchangePageLayers = (
  slug: string
): ExchangePageLayer[] | null => pageLayersCache.get(slug) ?? null;

export const prefetchExchangePageLayers = (
  slug: string
): Promise<ExchangePageLayer[]> => {
  const cached = pageLayersCache.get(slug);
  if (cached) return Promise.resolve(cached);

  const inflight = pageLayersInflight.get(slug);
  if (inflight) return inflight;

  const request = rexerApi.publicPages
    .get(slug)
    .then(page => {
      const blueprint = page.canvas_blueprint;
      if (!blueprint) {
        pageLayersCache.set(slug, []);
        return [];
      }

      const canvas = parseCanvas(adaptCanvasBlueprint(blueprint));
      const blocks = canvas?.pages.flatMap(p => p.blocks) ?? [];
      const layers: ExchangePageLayer[] = blocks
        .filter(b => b.isVisible)
        .map((b, i) => ({
          id: b.id,
          name: b.name?.trim() || b.blockType,
          blockType: b.blockType,
          index: i + 1,
        }));

      pageLayersCache.set(slug, layers);
      return layers;
    })
    .finally(() => {
      pageLayersInflight.delete(slug);
    });

  pageLayersInflight.set(slug, request);
  return request;
};
