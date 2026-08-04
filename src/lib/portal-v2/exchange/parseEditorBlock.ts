import { migrateBlockV1toV2 } from '@/components/modules/block-editor/serialize';
import type { Block as EditorBlock } from '@/components/modules/block-editor/types';

/**
 * Lightweight check — avoids migrate/parse on the catalog fetch path.
 * Full parse is deferred to viewport-visible cards.
 */
export const canLivePreview = (
  settings: Record<string, unknown> | undefined
): boolean => {
  if (!settings || typeof settings !== 'object') return false;
  return 'blockType' in settings;
};

/**
 * Parse `Block.settings` back to an editor Block (same round-trip as
 * /admin/blocks). Returns null when settings isn't a valid editor Block or
 * has no desktop content — cover then falls back to the generated thumb.
 */
export const parseEditorBlock = (
  settings: Record<string, unknown> | undefined
): EditorBlock | null => {
  if (!canLivePreview(settings)) return null;
  const migrated = migrateBlockV1toV2(settings!);
  return migrated.contentVi?.desktop ? migrated : null;
};
