/**
 * Layers folder ảnh cho `mint_vault_reveal` (Hồi I.5 · cửa hầm mở).
 * Toàn bộ `images` gom vào 1 group collapsible, sửa được từng ảnh trong panel Lớp.
 * Pure function — tách khỏi client component để LayersPanel import không kéo cả block.
 */
import { Image as ImageIcon } from 'lucide-react';

import type { LayerElement } from '../LayersPanel';

/** 1 field / ảnh, chung `groupId`; groupLabel chỉ ở phần tử đầu. */
export const mintVaultRevealImageElements = (
  images: string[]
): LayerElement[] =>
  images.map((_, i) => ({
    key: `images[${i}]`,
    label: `Ảnh ${i + 1}`,
    groupId: 'revealImages',
    ...(i === 0 ? { groupLabel: 'Ảnh gallery' } : {}),
    icon: ImageIcon,
    fieldType: 'image' as const,
  }));
