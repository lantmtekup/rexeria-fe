import { canLivePreview } from '@/lib/portal-v2/exchange/parseEditorBlock';
import { blockMetaPreset } from '@/lib/portal-v2/exchange/mock';
import type {
  ExchangeListingMeta,
  ExchangeListingView,
} from '@/lib/portal-v2/exchange/types';
import type { Block } from '@/services/rexer/types';

export const mapBlockToListing = (block: Block): ExchangeListingView => {
  const preset = blockMetaPreset(block.id);
  const meta: ExchangeListingMeta = {
    ...preset,
    kind: 'block',
    summary: preset.summary ?? block.description,
  };

  return {
    id: `x-b-${block.id}`,
    source: 'block',
    blockId: block.id,
    name: block.name || 'Untitled',
    author: 'ReXeR',
    description: block.description || '',
    thumbnailUrl: block.thumbnail_url,
    canLivePreview: canLivePreview(block.settings),
    category: block.type_code,
    meta,
    proven: Boolean(meta.evidence),
  };
};
