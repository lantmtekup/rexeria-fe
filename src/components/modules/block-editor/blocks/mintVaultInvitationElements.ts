/**
 * Layers folder ảnh cho `mint_vault_invitation` (Hồi IV · Lời mời).
 * Toàn bộ `images` (coin nổ) gom vào 1 group collapsible, sửa được từng ảnh.
 * Pure function — tách khỏi client component để LayersPanel import không kéo cả block.
 */
import { Image as ImageIcon } from 'lucide-react';

import type { LayerElement } from '../LayersPanel';

/** 1 field / ảnh, chung `groupId`; groupLabel chỉ ở phần tử đầu. */
export const mintVaultInvitationImageElements = (
  images: string[]
): LayerElement[] =>
  images.map((_, i) => ({
    key: `images[${i}]`,
    label: `Ảnh ${i + 1}`,
    groupId: 'inviteImages',
    ...(i === 0 ? { groupLabel: 'Ảnh explosion' } : {}),
    icon: ImageIcon,
    fieldType: 'image' as const,
  }));
