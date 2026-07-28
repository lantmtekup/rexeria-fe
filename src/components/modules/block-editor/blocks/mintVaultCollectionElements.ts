/**
 * Layers per-coin folders cho `mint_vault_collection` (Hồi II · The Collection).
 * Mỗi coin → 1 group collapsible (ảnh / tên / giá / metal / weight) trong panel Lớp.
 * Pure function — tách khỏi client component để LayersPanel import không kéo cả block.
 */
import {
  Image as ImageIcon,
  Coins as CoinsIcon,
  DollarSign,
  Type,
} from 'lucide-react';

import type { LayerElement } from '../LayersPanel';
import type { MintVaultCoin } from '../types';

/** 5 field / coin, chung `groupId = coin${i}`; groupLabel chỉ ở phần tử đầu. */
export const mintVaultCoinElements = (coins: MintVaultCoin[]): LayerElement[] =>
  coins.flatMap((coin, i) => {
    const groupId = `coin${i}`;
    const groupLabel = coin.name?.trim() || `Coin ${i + 1}`;
    return [
      {
        key: `coins[${i}].image`,
        label: 'Ảnh coin',
        groupId,
        groupLabel,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `coins[${i}].name`,
        label: 'Tên',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `coins[${i}].price`,
        label: 'Giá',
        groupId,
        icon: DollarSign,
        fieldType: 'text' as const,
      },
      {
        key: `coins[${i}].metal`,
        label: 'Kim loại',
        groupId,
        icon: CoinsIcon,
        fieldType: 'text' as const,
      },
      {
        key: `coins[${i}].weight`,
        label: 'Trọng lượng',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
    ];
  });
