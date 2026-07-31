/**
 * BlockDef cho `scroll_img_scale` — danh sách title+ảnh; ảnh scale theo
 * khoảng cách tới tâm viewport. Port từ CodeGrid cg-scroll-img-scale (087).
 *
 * `items[]` động — thêm/xoá qua Layers「Thêm / quản lý mục」.
 */
import { Image as ImageIcon, ListChecks, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type { ScrollImgScaleContent, ScrollImgScaleItem } from '../../../types';
import type { BlockDef } from '../types';

export const SCROLL_IMG_SCALE_DEFAULT_ITEMS: ScrollImgScaleItem[] = [
  {
    title: 'Neo Pulse',
    imageUrl: '/scroll-img-scale/img-1.jpg',
    imageAlt: 'Neo Pulse',
  },
  {
    title: 'Quantum Vogue',
    imageUrl: '/scroll-img-scale/img-2.jpg',
    imageAlt: 'Quantum Vogue',
  },
  {
    title: 'Ether Shift Mode',
    imageUrl: '/scroll-img-scale/img-3.jpg',
    imageAlt: 'Ether Shift Mode',
  },
  {
    title: 'Orbital Luxe',
    imageUrl: '/scroll-img-scale/img-4.jpg',
    imageAlt: 'Orbital Luxe',
  },
  {
    title: 'Nova Echo Thread',
    imageUrl: '/scroll-img-scale/img-5.jpg',
    imageAlt: 'Nova Echo Thread',
  },
  {
    title: 'Flux Aura',
    imageUrl: '/scroll-img-scale/img-6.jpg',
    imageAlt: 'Flux Aura',
  },
  {
    title: 'Zenon Lume Drift',
    imageUrl: '/scroll-img-scale/img-7.jpg',
    imageAlt: 'Zenon Lume Drift',
  },
  {
    title: 'Zenon Haze',
    imageUrl: '/scroll-img-scale/img-8.jpg',
    imageAlt: 'Zenon Haze',
  },
  {
    title: 'Nebula Arc Stream',
    imageUrl: '/scroll-img-scale/img-9.jpg',
    imageAlt: 'Nebula Arc Stream',
  },
  {
    title: 'Solar Byte Haze',
    imageUrl: '/scroll-img-scale/img-10.jpg',
    imageAlt: 'Solar Byte Haze',
  },
];

const VI: ScrollImgScaleContent = {
  items: SCROLL_IMG_SCALE_DEFAULT_ITEMS,
};

const EN: ScrollImgScaleContent = {
  items: [...SCROLL_IMG_SCALE_DEFAULT_ITEMS],
};

/** Resolve items[] — fallback default khi thiếu / rỗng. */
export const resolveScrollImgScaleItems = (
  content: ScrollImgScaleContent | null | undefined
): ScrollImgScaleItem[] => {
  const raw = content?.items;
  if (!Array.isArray(raw) || raw.length === 0) {
    return SCROLL_IMG_SCALE_DEFAULT_ITEMS.map(item => ({ ...item }));
  }
  return raw.filter(it => it && typeof it === 'object');
};

/**
 * Layers folders — 1 group / item. Dùng chung giữa BlockDef và
 * LayersPanel.elementsForType.
 */
export const scrollImgScaleItemElements = (
  items: ScrollImgScaleItem[]
): LayerElement[] => {
  const list = items.length > 0 ? items : SCROLL_IMG_SCALE_DEFAULT_ITEMS;
  return list.flatMap((item, i) => {
    const groupId = `item${i}`;
    const groupLabel = (item.title ?? '').trim().slice(0, 40) || `Mục ${i + 1}`;
    return [
      {
        key: `items[${i}].title`,
        label: 'Tiêu đề',
        groupId,
        groupLabel,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `items[${i}].imageUrl`,
        label: 'Ảnh',
        groupId,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
    ];
  });
};

export const scrollImgScaleDef: BlockDef<ScrollImgScaleContent> = {
  type: 'scroll_img_scale',
  meta: {
    type: 'scroll_img_scale',
    category: 'gallery',
    style: 'modern',
    tags: ['gallery', 'scroll', 'scale', 'animation', 'codegrid'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-31',
    label: 'Scroll Img Scale',
    accent: '#0f0f0f',
    adminLabel: 'Scroll Img Scale',
    gradient: 'from-neutral-700 to-neutral-950',
    defaultName: 'Scroll Img Scale',
    aiLabelVi:
      'danh sách title+ảnh dọc; ảnh phóng to khi gần tâm viewport, thu nhỏ khi xa',
    aiLabelEn:
      'vertical title+image list; images scale up near viewport center, down when far',
  },
  component: dynamic(() =>
    import('../../ScrollImgScale').then(m => m.ScrollImgScale)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    ...scrollImgScaleItemElements(SCROLL_IMG_SCALE_DEFAULT_ITEMS),
    {
      key: 'items',
      label: 'Thêm / quản lý mục',
      icon: ListChecks,
    },
  ],
};
