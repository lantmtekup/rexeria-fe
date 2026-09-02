/**
 * BlockDef cho `westly_showcase` — card bản vẽ 3 lớp (sketch + overlay drift +
 * photo ẩn) bấm để lật sang ảnh thật, panel copy trôi ngược khi scroll, veil
 * bàn giao sang block sau. Port từ apps/the-westly ProductShowcase.tsx. Path A.
 */
import {
  AlignLeft,
  Image as ImageIcon,
  Layers,
  Palette,
  Tag,
  Type,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { WestlyShowcaseContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: WestlyShowcaseContent = {
  eyebrow: 'OVERVIEW',
  title: 'Penthouse B',
  description:
    'Perched atop The Westly, Penthouse B is a sky home above the Upper West Side, a 3,059 square foot residence offering the rarest combination in Manhattan new construction: genuine grandeur and genuine warmth. Four bedrooms, three and a half bathrooms, eleven-foot ceilings, and a private rooftop terrace that stretches over 1,000 square feet above the city.',
  sketchUrl: '/the-westly/s2-p1.png',
  sketchAlt: 'Bản vẽ nội thất Penthouse B',
  overlayUrl: '/the-westly/s2-p2.png',
  photoUrl: '/the-westly/s2-p3.png',
  photoAlt: 'Phòng khách Penthouse B',
  revealShowLabel: 'SEE FULL\nPICTURE',
  revealHideLabel: 'BACK TO\nSKETCH',
  bgColor: '#F3F1EA',
  veilColor: '#ffffff',
};

const EN: WestlyShowcaseContent = {
  ...VI,
  sketchAlt: 'Penthouse B interior sketch',
  photoAlt: 'Penthouse B living room',
};

export const westlyShowcaseDef: BlockDef<WestlyShowcaseContent> = {
  type: 'westly_showcase',
  meta: {
    type: 'westly_showcase',
    label: 'The Westly · Showcase',
    accent: '#6E7A6F',
    adminLabel: 'The Westly Showcase',
    gradient: 'from-stone-400 to-stone-600',
    defaultName: 'The Westly Showcase',
    aiLabelVi:
      'showcase The Westly: card bản vẽ 3 lớp bấm để lật sang ảnh thật, panel copy trôi ngược khi scroll, veil bàn giao',
    aiLabelEn:
      'The Westly showcase: layered sketch card that flips to the real photo on click, copy panel drifting on scroll, veil hand-off',
  },
  component: dynamic(() =>
    import('../../WestlyShowcase').then(m => m.WestlyShowcase)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'eyebrow',
      label: 'Eyebrow',
      icon: Tag,
      fieldType: 'text',
      groupId: 'copy',
      groupLabel: 'Panel copy',
    },
    {
      key: 'title',
      label: 'Tiêu đề',
      icon: Type,
      fieldType: 'text',
      groupId: 'copy',
    },
    {
      key: 'description',
      label: 'Mô tả',
      icon: AlignLeft,
      fieldType: 'textarea',
      groupId: 'copy',
    },
    {
      key: 'sketchUrl',
      label: 'Bản vẽ (sketch)',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'layers',
      groupLabel: 'Lớp ảnh',
    },
    {
      key: 'overlayUrl',
      label: 'Lớp overlay (trôi)',
      icon: Layers,
      fieldType: 'image',
      groupId: 'layers',
    },
    {
      key: 'photoUrl',
      label: 'Ảnh thật (reveal)',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'layers',
    },
    {
      key: 'revealShowLabel',
      label: 'Nhãn badge (đang xem sketch)',
      icon: Tag,
      fieldType: 'text',
      groupId: 'reveal',
      groupLabel: 'Badge reveal',
    },
    {
      key: 'revealHideLabel',
      label: 'Nhãn badge (đang xem ảnh)',
      icon: Tag,
      fieldType: 'text',
      groupId: 'reveal',
    },
    {
      key: 'bgColor',
      label: 'Màu nền',
      icon: Palette,
      fieldType: 'text',
      groupId: 'colors',
      groupLabel: 'Màu bàn giao',
    },
    {
      key: 'veilColor',
      label: 'Màu veil bàn giao',
      icon: Palette,
      fieldType: 'text',
      groupId: 'colors',
    },
  ],
};
