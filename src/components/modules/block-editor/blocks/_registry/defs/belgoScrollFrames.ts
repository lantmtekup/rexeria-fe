/**
 * BlockDef cho `belgo_scroll_frames` — overlay canvas frame-sequence scrub theo
 * scroll + preloader curtain. Port từ apps/belgo ScrollFrameSequence.tsx.
 * Path A registry.
 */
import {
  Film,
  Hash,
  Image as ImageIcon,
  Layers,
  Tag,
  Type,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { BelgoScrollFramesContent } from '../../../types';
import type { BlockDef } from '../types';

/** Mặc định trỏ vào bộ 89 frame webp trong `public/belgo/frame`. */
export const BELGO_SCROLL_FRAMES_DEFAULTS = {
  startSelector: '#hero',
  endSelector: '#about-product',
  frameCount: 89,
  frameSrc: '/belgo/frame/frame-{i}.webp',
  framePad: 2,
  showLoader: true,
  loaderLogoUrl: '/belgo/logo.svg',
  loaderLogoAlt: 'Belgő',
  loaderLabel: 'CRAFTING',
} as const;

/**
 * Thay `{i}` bằng chỉ số frame 1-based đã zero-pad. Template không có `{i}`
 * (vd người dùng dán 1 URL tĩnh) thì trả nguyên — vẫn render được 1 frame.
 */
export const resolveBelgoFrameSrc = (
  template: string,
  index: number,
  pad: number
): string => template.replace('{i}', String(index).padStart(pad, '0'));

const VI: BelgoScrollFramesContent = { ...BELGO_SCROLL_FRAMES_DEFAULTS };
const EN: BelgoScrollFramesContent = { ...BELGO_SCROLL_FRAMES_DEFAULTS };

export const belgoScrollFramesDef: BlockDef<BelgoScrollFramesContent> = {
  type: 'belgo_scroll_frames',
  meta: {
    type: 'belgo_scroll_frames',
    category: 'intro',
    style: 'luxury',
    tags: ['belgo', 'beer', 'canvas', 'scroll', 'scrub', 'overlay'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-08-03',
    label: 'Belgo · Scroll Frames',
    accent: '#C9A24B',
    adminLabel: 'Belgo Scroll Frames',
    gradient: 'from-amber-950 to-neutral-950',
    defaultName: 'Belgo Scroll Frames',
    aiLabelVi:
      'overlay canvas full-viewport: chuỗi frame chai bia scrub theo scroll giữa hero và about, kèm preloader curtain + progress',
    aiLabelEn:
      'full-viewport canvas overlay: bottle frame sequence scrubbed between the hero and about blocks, with a preloader curtain + progress bar',
  },
  component: dynamic(() =>
    import('../../BelgoScrollFrames').then(m => m.BelgoScrollFrames)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'startSelector',
      label: 'Selector block bắt đầu',
      icon: Layers,
      fieldType: 'text',
      groupId: 'range',
      groupLabel: 'Vùng scrub',
    },
    {
      key: 'endSelector',
      label: 'Selector block kết thúc',
      icon: Layers,
      fieldType: 'text',
      groupId: 'range',
    },
    {
      key: 'frameSrc',
      label: 'URL frame (chứa {i})',
      icon: Film,
      fieldType: 'text',
      groupId: 'frames',
      groupLabel: 'Chuỗi frame',
    },
    {
      key: 'frameCount',
      label: 'Số frame',
      icon: Hash,
      fieldType: 'text',
      groupId: 'frames',
    },
    {
      key: 'framePad',
      label: 'Zero-pad {i}',
      icon: Hash,
      fieldType: 'text',
      groupId: 'frames',
    },
    // `showLoader` là boolean → không có fieldType tương ứng trong toolbar
    // (repo chưa hỗ trợ toggle); chỉnh qua settings block, không list ở Lớp.
    {
      key: 'loaderLogoUrl',
      label: 'Logo preloader',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'loader',
      groupLabel: 'Preloader',
    },
    {
      key: 'loaderLogoAlt',
      label: 'Alt / aria-label',
      icon: Tag,
      fieldType: 'text',
      groupId: 'loader',
    },
    {
      key: 'loaderLabel',
      label: 'Nhãn tiến độ',
      icon: Type,
      fieldType: 'text',
      groupId: 'loader',
    },
  ],
};
