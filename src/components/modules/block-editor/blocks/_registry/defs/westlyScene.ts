/**
 * BlockDef cho `westly_scene` — bản vẽ phòng 2 lớp nét chì quét ngược chiều
 * khi scroll + mouse parallax có clamp; bấm nút lật sang ảnh thật; feather mask
 * mép trên lúc trườn vào; veil bàn giao sang block sau.
 * Port từ apps/the-westly SceneParallax.tsx. Path A registry.
 */
import {
  AlignLeft,
  Image as ImageIcon,
  Layers,
  Palette,
  Tag,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { WestlySceneContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: WestlySceneContent = {
  eyebrow: 'APARTMENT SPACE',
  title: 'Classic New York charm with welcomed modern twists.',
  revealShowLabel: 'VIEW PENTHOUSE B',
  revealHideLabel: 'BACK TO SKETCH',
  nearUrl: '/the-westly/s3-p1.png',
  nearAlt: 'Bản vẽ nội thất The Westly',
  farUrl: '/the-westly/s3-p2.png',
  photoUrl: '/the-westly/s3-p3.png',
  photoAlt: 'Không gian căn hộ The Westly',
  bgColor: '#ffffff',
  veilColor: '#F3F1EA',
};

const EN: WestlySceneContent = {
  ...VI,
  nearAlt: 'The Westly interior sketch',
  photoAlt: 'The Westly apartment space',
};

export const westlySceneDef: BlockDef<WestlySceneContent> = {
  type: 'westly_scene',
  meta: {
    type: 'westly_scene',
    label: 'The Westly · Scene',
    accent: '#6E7A6F',
    adminLabel: 'The Westly Scene',
    gradient: 'from-stone-300 to-stone-500',
    defaultName: 'The Westly Scene',
    aiLabelVi:
      'scene The Westly: bản vẽ phòng 2 lớp nét chì quét ngược chiều khi scroll + parallax chuột, bấm nút lật sang ảnh thật, veil bàn giao',
    aiLabelEn:
      'The Westly scene: two-layer pencil sketch sweeping on scroll with mouse parallax, button flips to the real photo, veil hand-off',
  },
  component: dynamic(() =>
    import('../../WestlyScene').then(m => m.WestlyScene)
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
      key: 'revealShowLabel',
      label: 'Nhãn nút (đang xem sketch)',
      icon: Tag,
      fieldType: 'text',
      groupId: 'reveal',
      groupLabel: 'Nút reveal',
    },
    {
      key: 'revealHideLabel',
      label: 'Nhãn nút (đang xem ảnh)',
      icon: Tag,
      fieldType: 'text',
      groupId: 'reveal',
    },
    {
      key: 'nearUrl',
      label: 'Lớp nét trước (near)',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'layers',
      groupLabel: 'Lớp ảnh',
    },
    {
      key: 'farUrl',
      label: 'Lớp nét sau (far)',
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
