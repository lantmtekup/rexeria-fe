/**
 * BlockDef cho `belgo_more_flavors` — pin + scrub gallery hương vị bia.
 * Port từ apps/belgo MoreFlavors.tsx. Path A registry.
 */
import {
  Film,
  Image as ImageIcon,
  ListChecks,
  Palette,
  Tag,
  Type,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type { BelgoFlavorItem, BelgoMoreFlavorsContent } from '../../../types';
import {
  BELGO_DEFAULT_FLAVORS,
  resolveBelgoMoreFlavors,
} from '../../belgoMoreFlavorsContent';
import type { BlockDef } from '../types';

const VI: BelgoMoreFlavorsContent = {
  videoUrl: '/belgo/videos/section5.mp4',
  eyebrow: 'OUR PRODUCTS',
  title: "DON'T STOP NOW – THERE'S MORE FLAVOR TO DISCOVER!",
  flavors: BELGO_DEFAULT_FLAVORS.map(item => ({ ...item })),
};

const EN: BelgoMoreFlavorsContent = { ...VI };

export const belgoFlavorItemElements = (
  flavors: BelgoFlavorItem[]
): LayerElement[] => {
  const list = flavors.length > 0 ? flavors : BELGO_DEFAULT_FLAVORS;
  return list.flatMap((f, i) => {
    const groupId = `flavor${i}`;
    const groupLabel = f.name?.trim() || `Hương vị ${i + 1}`;
    return [
      {
        key: `flavors[${i}].name`,
        label: 'Tên',
        groupId,
        groupLabel,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `flavors[${i}].color`,
        label: 'Màu tiêu đề',
        groupId,
        icon: Palette,
        fieldType: 'text' as const,
      },
      {
        key: `flavors[${i}].bgImageUrl`,
        label: 'Nền',
        groupId,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `flavors[${i}].bottleImageUrl`,
        label: 'Chai',
        groupId,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `flavors[${i}].glassImageUrl`,
        label: 'Ly',
        groupId,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
    ];
  });
};

export const belgoMoreFlavorsDef: BlockDef<BelgoMoreFlavorsContent> = {
  type: 'belgo_more_flavors',
  meta: {
    type: 'belgo_more_flavors',
    category: 'intro',
    style: 'luxury',
    tags: ['belgo', 'beer', 'gallery', 'scroll', 'video'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-08-03',
    label: 'Belgo · More Flavors',
    accent: '#e2dccb',
    adminLabel: 'Belgo More Flavors',
    gradient: 'from-amber-100 to-stone-300',
    defaultName: 'Belgo More Flavors',
    aiLabelVi:
      'section Belgo more flavors: video + gallery pin/scrub ngang, hover reveal chai/ly theo item giữa viewport',
    aiLabelEn:
      'Belgo more flavors section: video column + pinned horizontal flavor gallery with center-item hover reveal',
  },
  component: dynamic(() =>
    import('../../BelgoMoreFlavors').then(m => m.BelgoMoreFlavors)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'videoUrl',
      label: 'Video nền',
      icon: Film,
      fieldType: 'image',
    },
    {
      key: 'eyebrow',
      label: 'Eyebrow',
      icon: Tag,
      fieldType: 'text',
      groupId: 'copy',
      groupLabel: 'Nội dung video',
    },
    {
      key: 'title',
      label: 'Tiêu đề',
      icon: Type,
      fieldType: 'text',
      groupId: 'copy',
    },
    ...belgoFlavorItemElements(BELGO_DEFAULT_FLAVORS),
    {
      key: 'flavors',
      label: 'Thêm / quản lý hương vị',
      icon: ListChecks,
    },
  ],
};

export { resolveBelgoMoreFlavors };
