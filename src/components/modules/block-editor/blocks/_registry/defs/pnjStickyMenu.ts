/**
 * BlockDef cho `pnj_sticky_menu` — thanh điều hướng cố định đáy viewport PNJ.
 * Port từ apps/pnj StickyMenu. Path A registry.
 */
import { Link2, ListChecks, MousePointerClick, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type { PnjStickyMenuContent, PnjStickyMenuItem } from '../../../types';
import type { BlockDef } from '../types';

const DEFAULT_ITEMS: PnjStickyMenuItem[] = [
  { key: 'discover', label: 'Discover', link: 'discover' },
  { key: 'description', label: 'Description', link: 'description' },
  { key: 'information', label: 'Information', link: 'information' },
  { key: 'contact', label: 'Contact', link: 'contact' },
];

const VI_ITEMS: PnjStickyMenuItem[] = [
  { key: 'discover', label: 'Khám phá', link: 'discover' },
  { key: 'description', label: 'Mô tả', link: 'description' },
  { key: 'information', label: 'Thông tin', link: 'information' },
  { key: 'contact', label: 'Liên hệ', link: 'contact' },
];

const VI: PnjStickyMenuContent = {
  items: VI_ITEMS,
  ctaText: 'Mua ngay',
  ctaLink: 'contact',
};

const EN: PnjStickyMenuContent = {
  items: DEFAULT_ITEMS,
  ctaText: 'Buy now',
  ctaLink: 'contact',
};

export const pnjStickyMenuItemElements = (
  items: PnjStickyMenuItem[]
): LayerElement[] => {
  const list = items.length > 0 ? items : DEFAULT_ITEMS;
  return list.flatMap((item, i) => {
    const groupId = `nav${i}`;
    const groupLabel = item.label?.trim() || `Mục ${i + 1}`;
    return [
      {
        key: `items[${i}].label`,
        label: 'nhãn',
        groupId,
        groupLabel,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `items[${i}].link`,
        label: 'link',
        groupId,
        icon: Link2,
        fieldType: 'link' as const,
      },
    ];
  });
};

export const pnjStickyMenuDef: BlockDef<PnjStickyMenuContent> = {
  type: 'pnj_sticky_menu',
  meta: {
    type: 'pnj_sticky_menu',
    label: 'PNJ · Sticky Menu',
    accent: '#003468',
    adminLabel: 'PNJ Sticky Menu',
    gradient: 'from-white to-neutral-200',
    defaultName: 'PNJ Sticky Menu',
    aiLabelVi:
      'thanh menu cố định đáy màn hình PNJ: anchor link tới section hoặc URL + nút CTA',
    aiLabelEn:
      'PNJ fixed bottom nav: section anchors or external URLs + CTA button',
  },
  component: dynamic(() =>
    import('../../PnjStickyMenu').then(m => m.PnjStickyMenu)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    ...pnjStickyMenuItemElements(DEFAULT_ITEMS),
    {
      key: 'items',
      label: 'Thêm / quản lý mục',
      icon: ListChecks,
    },
    { key: 'ctaText', label: 'Nút CTA', icon: Type, fieldType: 'text' },
    {
      key: 'ctaLink',
      label: 'Link CTA',
      icon: MousePointerClick,
      fieldType: 'link',
    },
  ],
};
