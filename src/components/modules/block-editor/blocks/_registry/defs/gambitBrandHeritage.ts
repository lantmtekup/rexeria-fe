/**
 * BlockDef cho `gambit_brand_heritage` — port `BrandHeritage` của
 * apps/gambit-delvaux: sân khấu dán, chữ "Since 1829" hiện theo ký tự rồi bị
 * khoét thủng qua màn phủ SVG để lộ video di sản phía sau. Path A.
 *
 * Layers: 1 folder "Chữ trên màn" (tagline + Since + năm) + video nền.
 *
 * Asset mặc định nằm ở `public/gambit/` (dùng chung với `gambit_delvaux_intro`
 * và `gambit_product_overview`).
 */
import { CalendarClock, Film, Pilcrow, Type } from 'lucide-react';

import dynamic from 'next/dynamic';
import type { GambitBrandHeritageContent } from '../../../types';
import type { BlockDef } from '../types';

/**
 * Default dùng chung cho BlockDef + component (component fallback về đây khi
 * field CMS rỗng, để không bao giờ render màn knockout trống chữ).
 */
export const GAMBIT_BRAND_HERITAGE_DEFAULTS = {
  videoUrl: '/gambit/video-history.mp4',
  tagline: 'The Oldest Fine Leather Goods House in the World',
  since: 'Since',
  year: '1829',
} as const satisfies GambitBrandHeritageContent;

const VI: GambitBrandHeritageContent = { ...GAMBIT_BRAND_HERITAGE_DEFAULTS };
const EN: GambitBrandHeritageContent = { ...GAMBIT_BRAND_HERITAGE_DEFAULTS };

export const gambitBrandHeritageDef: BlockDef<GambitBrandHeritageContent> = {
  type: 'gambit_brand_heritage',
  meta: {
    type: 'gambit_brand_heritage',
    label: 'Heritage - Knockout Video',
    accent: '#111111',
    adminLabel: 'Heritage - Knockout Video',
    gradient: 'from-neutral-100 to-neutral-300',
    defaultName: 'Heritage - Knockout Video',
    aiLabelVi:
      'màn di sản thương hiệu: chữ "Since 1829" hiện theo từng ký tự, sau đó bị khoét thủng qua màn phủ để lộ video lịch sử, cuộn tiếp thì màn phủ dâng lên và tan dần',
    aiLabelEn:
      'brand heritage stage: "Since 1829" types in character by character, then knocks out of a veil to reveal a heritage video which dissolves to full frame on scroll',
  },
  // dynamic để webpack tách chunk per-block (audit FE 2026-07-04 P1).
  component: dynamic(() =>
    import('../../GambitBrandHeritage').then(m => m.GambitBrandHeritage)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'videoUrl',
      label: 'Video nền (ảnh hoặc mp4)',
      icon: Film,
      fieldType: 'image',
    },
    {
      key: 'tagline',
      label: 'Dòng mô tả',
      icon: Pilcrow,
      fieldType: 'textarea',
      groupId: 'caption',
      groupLabel: 'Chữ trên màn',
    },
    {
      key: 'since',
      label: 'Chữ "Since"',
      icon: Type,
      fieldType: 'text',
      groupId: 'caption',
    },
    {
      key: 'year',
      label: 'Năm',
      icon: CalendarClock,
      fieldType: 'text',
      groupId: 'caption',
    },
  ],
};
