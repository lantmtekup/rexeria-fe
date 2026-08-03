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

/** One canvas page and its visible blocks — the sidebar groups layers by page. */
export type ExchangePageLayerGroup = {
  id: string;
  name: string;
  /** '' for the home page; sub-pages map to `/p/{slug}/{pagePath}`. */
  pagePath: string;
  isHome: boolean;
  layers: ExchangePageLayer[];
};

const pageLayersCache = new Map<string, ExchangePageLayerGroup[]>();
const pageLayersInflight = new Map<string, Promise<ExchangePageLayerGroup[]>>();

/** Visible blocks from the published `/p/{slug}` canvas (same source as live page). */
export const getCachedExchangePageLayers = (
  slug: string
): ExchangePageLayerGroup[] | null => pageLayersCache.get(slug) ?? null;

export const prefetchExchangePageLayers = (
  slug: string
): Promise<ExchangePageLayerGroup[]> => {
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
      const groups: ExchangePageLayerGroup[] = (canvas?.pages ?? [])
        .map(p => ({
          id: p.id,
          name: p.name,
          pagePath: p.isHome ? '' : p.slug,
          isHome: p.isHome,
          layers: p.blocks
            .filter(b => b.isVisible)
            .map((b, i) => ({
              id: b.id,
              name: b.name?.trim() || b.blockType,
              blockType: b.blockType,
              index: i + 1,
            })),
        }))
        .filter(g => g.layers.length > 0);

      pageLayersCache.set(slug, groups);
      return groups;
    })
    .finally(() => {
      pageLayersInflight.delete(slug);
    });

  pageLayersInflight.set(slug, request);
  return request;
};
