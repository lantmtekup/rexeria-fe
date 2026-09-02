/**
 * BlockDef cho `westly_product_reveal` — stack nét vẽ sân thượng + dải mây +
 * skyline, click lật sang ảnh hoàn thiện; drift + mouse parallax; panel copy
 * trôi ngược. Section chốt chuỗi Westly (không sticky/veil).
 * Port từ apps/the-westly ProductReveal.tsx. Path A registry.
 */
import {
  AlignLeft,
  Cloud,
  Image as ImageIcon,
  Layers,
  Palette,
  Tag,
  Type,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { WestlyProductRevealContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: WestlyProductRevealContent = {
  eyebrow: 'ROOFTOP',
  title: 'A Private Rooftop Above the Upper West Side',
  description:
    'Designed for memorable gatherings and quiet mornings alike, this is the outdoor space the Upper West Side has never been able to offer, until now. It is not an amenity. It is an extension of the home.',
  foregroundUrl: '/the-westly/s6-p1.png',
  foregroundAlt: 'Nét vẽ sân thượng The Westly',
  cloudsUrl: '/the-westly/s6-p2.png',
  skylineUrl: '/the-westly/s6-p3.png',
  photoUrl: '/the-westly/s6-p4.png',
  photoAlt: 'Sân thượng The Westly lúc hoàng hôn',
  bgColor: '#F3F1EA',
};

const EN: WestlyProductRevealContent = {
  ...VI,
  foregroundAlt: 'The Terrace interior sketch',
  photoAlt: 'The Terrace at dusk',
};

export const westlyProductRevealDef: BlockDef<WestlyProductRevealContent> = {
  type: 'westly_product_reveal',
  meta: {
    type: 'westly_product_reveal',
    label: 'The Westly · Rooftop',
    accent: '#6E7A6F',
    adminLabel: 'The Westly Rooftop',
    gradient: 'from-stone-50 to-stone-200',
    defaultName: 'The Westly Rooftop',
    aiLabelVi:
      'rooftop The Westly: stack nét vẽ + mây + skyline, click lật sang ảnh hoàn thiện, panel copy trôi ngược khi scroll',
    aiLabelEn:
      'The Westly rooftop: sketch + clouds + skyline stack, click flips to the finished photo, copy panel drifting on scroll',
  },
  component: dynamic(() =>
    import('../../WestlyProductReveal').then(m => m.WestlyProductReveal)
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
      key: 'foregroundUrl',
      label: 'Nét vẽ (trên cùng)',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'layers',
      groupLabel: 'Lớp ảnh',
    },
    {
      key: 'cloudsUrl',
      label: 'Dải mây (trôi)',
      icon: Cloud,
      fieldType: 'image',
      groupId: 'layers',
    },
    {
      key: 'skylineUrl',
      label: 'Skyline (sau cùng)',
      icon: Layers,
      fieldType: 'image',
      groupId: 'layers',
    },
    {
      key: 'photoUrl',
      label: 'Ảnh hoàn thiện (reveal)',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'layers',
    },
    {
      key: 'bgColor',
      label: 'Màu nền',
      icon: Palette,
      fieldType: 'text',
    },
  ],
};
