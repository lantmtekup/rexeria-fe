/**
 * Layers per-item folders cho `mint_vault_craft` (Hồi III · The Craft).
 * Mỗi proof point → 1 group collapsible (ảnh / tiêu đề / mô tả) trong panel Lớp.
 * Pure function — tách khỏi client component để LayersPanel import không kéo cả block.
 */
import { Image as ImageIcon, Pilcrow, Type } from 'lucide-react';

import type { LayerElement } from '../LayersPanel';
import type { MintVaultCraftItem } from '../types';

/** 3 field / mục, chung `groupId = craft${i}`; groupLabel chỉ ở phần tử đầu. */
export const mintVaultCraftItemElements = (
  items: MintVaultCraftItem[]
): LayerElement[] =>
  items.flatMap((item, i) => {
    const groupId = `craft${i}`;
    const groupLabel = item.title?.trim() || `Mục ${i + 1}`;
    return [
      {
        key: `items[${i}].imageUrl`,
        label: 'Ảnh',
        groupId,
        groupLabel,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `items[${i}].title`,
        label: 'Tiêu đề',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `items[${i}].description`,
        label: 'Mô tả',
        groupId,
        icon: Pilcrow,
        fieldType: 'textarea' as const,
      },
    ];
  });
