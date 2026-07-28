/**
 * BlockDef cho `mintv2_services` — heading lớn + selector list + preview swap.
 * Port từ apps/mintcoin-v2 ServicesSection. Path A registry.
 */
import { Image as ImageIcon, ListChecks, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import { IMG as MINT_IMG } from '@/templates/mint-coint/lib/image-cdn';

import type { LayerElement } from '../../../LayersPanel';
import type { MintV2ServiceItem, MintV2ServicesContent } from '../../../types';
import type { BlockDef } from '../types';

const MINTV2_CDN = 'https://d10zufojjcedud.cloudfront.net/coin-nextjs';
const MINTV2_FRAME48 = `${MINTV2_CDN}/frames/frame-048.webp`;

const VI_ITEMS: MintV2ServiceItem[] = [
  {
    key: 'thomson',
    label: 'Tom Thomson Heritage',
    preview: MINT_IMG.painting,
    caption: 'Painted 1916–17, Algonquin Park',
  },
  {
    key: 'engraving',
    label: 'Engraving Craft',
    preview: MINT_IMG.coinReverse,
    caption: 'Master engravers · hand-finished relief',
  },
  {
    key: 'gold',
    label: '99.99% Pure Gold',
    preview: MINTV2_FRAME48,
    caption: '1006.1 g · .99999 fineness',
  },
  {
    key: 'mintage',
    label: 'Limited Mintage 75',
    preview: MINT_IMG.coinPackaging,
    caption: 'Each coin individually serialised',
  },
  {
    key: 'effigy',
    label: 'King Charles III Effigy',
    preview: MINT_IMG.coinObverse,
    caption: 'By Canadian artist Steven Rosati',
  },
];

const VI: MintV2ServicesContent = {
  eyebrow: 'Two Dimensions',
  title: 'HERITAGE & CRAFT',
  items: VI_ITEMS,
};

/** Layers folders — 1 group / service item. */
export const mintV2ServicesItemElements = (
  items: MintV2ServiceItem[]
): LayerElement[] => {
  const list = items.length > 0 ? items : VI_ITEMS;
  return list.flatMap((item, i) => {
    const groupId = `item${i}`;
    const groupLabel = item.label?.trim() || `Mục ${i + 1}`;
    return [
      {
        key: `items[${i}].label`,
        label: 'Nhãn',
        groupId,
        groupLabel,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `items[${i}].preview`,
        label: 'Ảnh preview',
        groupId,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `items[${i}].caption`,
        label: 'Caption',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
    ];
  });
};

export const mintV2ServicesDef: BlockDef<MintV2ServicesContent> = {
  type: 'mintv2_services',
  meta: {
    type: 'mintv2_services',
    category: 'services',
    style: 'modern',
    tags: ['mint', 'services'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'MintV2 · Services',
    accent: '#c79119',
    adminLabel: 'MintV2 Services',
    gradient: 'from-yellow-500 to-amber-700',
    defaultName: 'Services',
    aiLabelVi: 'heading lớn + danh sách chọn + ảnh preview đổi theo mục',
    aiLabelEn: 'big heading + selector list + swapping preview image',
  },
  component: dynamic(() =>
    import('../../MintV2Services').then(m => m.MintV2Services)
  ),
  defaultContent: { vi: VI, en: VI },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Type, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề lớn', icon: Type, fieldType: 'text' },
    ...mintV2ServicesItemElements(VI_ITEMS),
    {
      key: 'items',
      label: 'Thêm / quản lý mục',
      icon: ListChecks,
    },
  ],
};
