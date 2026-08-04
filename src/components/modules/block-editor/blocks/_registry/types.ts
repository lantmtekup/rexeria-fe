/**
 * PoC — Co-located block registry.
 *
 * Mục tiêu: gom MỌI thông tin của 1 block (render component, meta, default
 * content, danh sách element) vào MỘT `BlockDef` duy nhất, thay vì xé lẻ ra
 * 6 file (types.ts, factory.ts, renderBlock.tsx, LayersPanel.tsx,
 * AddBlockDialog.tsx).
 *
 * Các file trung tâm đọc registry-first (fallback code cũ) → block nào đã có
 * `BlockDef` thì KHÔNG cần sửa 5 file kia nữa. Xem `registry.ts`.
 */
import type React from 'react';

import type { LayerElement } from '../../LayersPanel';
import type {
  BlockBackground,
  BlockContent,
  BlockType,
  BlockTypeMeta,
  ElementPositionsMap,
  ElementStylesMap,
} from '../../types';

/** Props mọi block component nhận (khớp đúng renderBlock switch hiện tại). */
export interface BlockRenderProps<C extends BlockContent = BlockContent> {
  content: C;
  styles?: ElementStylesMap;
  background?: BlockBackground;
  order?: string[];
  positions?: ElementPositionsMap;
  activeKey?: string | null;
  className?: string;
  /**
   * `block.id` — định danh ổn định, GIỐNG NHAU giữa SSR và client (cùng đọc từ
   * blueprint). Block nào cần id duy nhất trong DOM (mask/gradient/clipPath
   * SVG) phải lấy từ đây, KHÔNG dùng `React.useId()`: mọi block đều nằm sau
   * `next/dynamic` (React.lazy + Suspense), boundary đó làm lệch tree-id của
   * `useId` giữa server và hydrate ⇒ hydration mismatch.
   */
  blockId?: string;
}

/** Định nghĩa đầy đủ 1 block — nguồn sự thật duy nhất. */
export interface BlockDef<C extends BlockContent = BlockContent> {
  type: BlockType;
  /** → thay entry trong BLOCK_TYPE_META (types.ts). */
  meta: BlockTypeMeta;
  /** → thay case trong renderBlock.tsx. */
  component: React.ComponentType<BlockRenderProps<C>>;
  /** → thay default VI/EN trong factory.ts. */
  defaultContent: { vi: C; en: C };
  /**
   * Element con để chỉnh trong LayersPanel (KHÔNG kể layer nền — nền được
   * thêm tự động). → thay entry ELEMENTS_BY_TYPE.
   */
  elements: LayerElement[];
}
