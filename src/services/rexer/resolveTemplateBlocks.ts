/**
 * Resolve canvas blocks (`Block[]`) của 1 Template — dùng chung cho mọi nơi
 * cần "template này có những block gì" (Admin Templates list, Blocks library
 * reverse-index "block này nằm trong template nào").
 *
 * Precedence (giống `AdminTemplatePreviewPage` — đã verify hoạt động đúng):
 *   1. `draft_canvas_blueprint` — autosave buffer, có sẵn ngay trong response
 *      list, không cần fetch thêm.
 *   2. HEAD version (`version_no` lớn nhất qua `templates.versions()`).
 *   3. `current_version_id` — fallback cuối, THƯỜNG STALE vì BE không
 *      auto-bump sau `createVersion` — không được dùng làm nguồn duy nhất.
 *
 * Module-level cache theo templateId — remount/HMR không fetch lại (giống
 * `resolveTemplateFromVersion.ts`). Lỗi KHÔNG được cache để cho phép retry.
 */

import { rexerApi } from './endpoints';
import type { Template } from './types';
import {
  adaptCanvasBlueprint,
  parseCanvas,
} from '@/components/modules/block-editor/serialize';
import type { Block } from '@/components/modules/block-editor/types';

const cache = new Map<string, Block[]>();

export function peekCachedTemplateBlocks(
  templateId: string
): Block[] | undefined {
  return cache.get(templateId);
}

export async function resolveTemplateBlocks(
  template: Template
): Promise<Block[]> {
  const cached = cache.get(template.id);
  if (cached) return cached;

  if (template.draft_canvas_blueprint) {
    const canvas = parseCanvas(
      adaptCanvasBlueprint(template.draft_canvas_blueprint)
    );
    const blocks = canvas?.pages.flatMap(p => p.blocks) ?? [];
    cache.set(template.id, blocks);
    return blocks;
  }

  try {
    let versionId: string | undefined = template.current_version_id;
    try {
      const versList = await rexerApi.templates.versions(template.id);
      const head = (versList.items ?? []).reduce<
        (typeof versList.items)[number] | null
      >(
        (max, v) =>
          !max || (v.version_no ?? 0) > (max.version_no ?? 0) ? v : max,
        null
      );
      if (head) versionId = head.id;
    } catch {
      /* versions list failed — fall back to current_version_id */
    }
    if (!versionId) {
      cache.set(template.id, []);
      return [];
    }
    const version = await rexerApi.templates.version(template.id, versionId);
    const canvas = parseCanvas(adaptCanvasBlueprint(version.canvas_blueprint));
    const blocks = canvas?.pages.flatMap(p => p.blocks) ?? [];
    cache.set(template.id, blocks);
    return blocks;
  } catch {
    return [];
  }
}
