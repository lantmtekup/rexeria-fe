import { migrateBlockV1toV2 } from '@/components/modules/block-editor/serialize';
import type { Block as EditorBlock } from '@/components/modules/block-editor/types';
import { blockMetaPreset } from '@/lib/portal-v2/exchange/mock';
import type {
  ExchangeListingMeta,
  ExchangeListingView,
} from '@/lib/portal-v2/exchange/types';
import type { Block } from '@/services/rexer/types';

/**
 * Parse `Block.settings` back to an editor Block (same round-trip as
 * /admin/blocks). Returns null when settings isn't a valid editor Block or
 * has no desktop content — cover then falls back to the generated thumb.
 */
const parseEditorBlock = (
  settings: Record<string, unknown> | undefined
): EditorBlock | null => {
  if (!settings || typeof settings !== 'object') return null;
  if (!('blockType' in settings)) return null;
  const migrated = migrateBlockV1toV2(settings);
  return migrated.contentVi?.desktop ? migrated : null;
};

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
    editorBlock: parseEditorBlock(block.settings),
    category: block.type_code,
    meta,
    proven: Boolean(meta.evidence),
  };
};
