/**
 * BlockDef cho `westly_reveal` — cảnh bếp 2 lớp nét chì với chữ nấp trong ô
 * kính (nằm giữa hai lớp), click cả section lật sang ảnh thật (chữ đổi chỗ +
 * đổi màu), feather mask mép trên, veil bàn giao.
 * Port từ apps/the-westly SceneReveal.tsx. Path A registry.
 */
import {
  AlignLeft,
  Image as ImageIcon,
  Layers,
  Palette,
  Tag,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { WestlyRevealContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: WestlyRevealContent = {
  eyebrow: 'EXPLORE KITCHEN SPACE',
  title: 'The separate windowed kitchen recalls the sophistication',
  nearUrl: '/the-westly/s5-p1.png',
  nearAlt: 'Bản vẽ nội thất bếp The Westly',
  farUrl: '/the-westly/s5-p2.png',
  photoUrl: '/the-westly/s5-p3.png',
  photoAlt: 'Không gian bếp The Westly',
  bgColor: '#ffffff',
  veilColor: '#F3F1EA',
};

const EN: WestlyRevealContent = {
  ...VI,
  nearAlt: 'The Westly kitchen sketch',
  photoAlt: 'The Westly kitchen space',
};

export const westlyRevealDef: BlockDef<WestlyRevealContent> = {
  type: 'westly_reveal',
  meta: {
    type: 'westly_reveal',
    label: 'The Westly · Reveal',
    accent: '#6E7A6F',
    adminLabel: 'The Westly Reveal',
    gradient: 'from-stone-100 to-stone-300',
    defaultName: 'The Westly Reveal',
    aiLabelVi:
      'reveal The Westly: cảnh bếp 2 lớp nét chì với chữ nấp trong ô kính, click cả section lật sang ảnh thật, veil bàn giao',
    aiLabelEn:
      'The Westly reveal: two-layer kitchen sketch with copy tucked behind a window, click anywhere flips to the real photo, veil hand-off',
  },
  component: dynamic(() =>
    import('../../WestlyReveal').then(m => m.WestlyReveal)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'eyebrow',
      label: 'Eyebrow',
      icon: Tag,
      fieldType: 'text',
      groupId: 'copy',
      groupLabel: 'Khối chữ',
    },
    {
      key: 'title',
      label: 'Tiêu đề',
      icon: AlignLeft,
      fieldType: 'text',
      groupId: 'copy',
    },
    {
      key: 'nearUrl',
      label: 'Lớp nét trước (near — che chữ)',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'layers',
      groupLabel: 'Lớp ảnh',
    },
    {
      key: 'farUrl',
      label: 'Lớp nét sau (far — sau chữ)',
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
