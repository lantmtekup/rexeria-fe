/**
 * BlockDef cho `delvaux_hero` — hero section `.hero` của delvaux-clone: ảnh
 * đóng khung 80px scale 0.9→1 khi vào trang → scale 1→2 + fade theo scroll →
 * lộ lớp "intro" tua theo scroll (frame-sequence). Component: `blocks/DelvauxHero.tsx`.
 * Path A.
 *
 * Layers chỉ expose: posterUrl + frameUrls + heading/subheading.
 * `videoUrl` / `frameUrlPattern` / `overlayOpacity` giữ trong content (legacy /
 * default) nhưng không hiện trong panel — bản gốc không dùng.
 */
import { Film, Image as ImageIcon, Pilcrow, Type } from 'lucide-react';

import dynamic from 'next/dynamic';
import { DELVAUX_HERO_FRAMES } from './delvauxHeroFrames';
import type { DelvauxHeroContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: DelvauxHeroContent = {
  videoUrl: '',
  posterUrl:
    'https://d10zufojjcedud.cloudfront.net/uploads/f5c6ef7f-f53a-45ad-b07d-2e6c15bced3e/delvaux-png-hero.png',
  heading: '',
  subheading: '',
  overlayOpacity: 0,
  frameUrlPattern: '',
  frameCount: DELVAUX_HERO_FRAMES.length,
  frameUrls: DELVAUX_HERO_FRAMES,
};

const EN: DelvauxHeroContent = { ...VI };

export const delvauxHeroDef: BlockDef<DelvauxHeroContent> = {
  type: 'delvaux_hero',
  meta: {
    type: 'delvaux_hero',
    label: 'Hero - Scroll Video',
    accent: '#0a0a0a',
    adminLabel: 'Hero - Scroll Video',
    gradient: 'from-neutral-900 to-neutral-700',
    defaultName: 'Hero - Scroll Video',
    aiLabelVi:
      'hero cinematic: ảnh đóng khung phóng to + mờ dần theo scroll, lộ frame-sequence tua theo scroll',
    aiLabelEn:
      'cinematic hero: framed image scales and fades on scroll, revealing a scroll-scrubbed frame-sequence',
  },
  // dynamic để webpack tách chunk per-block (audit FE 2026-07-04 P1).
  component: dynamic(() =>
    import('../../DelvauxHero').then(m => m.DelvauxHero)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'posterUrl',
      label: 'Ảnh đóng khung',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'media',
      groupLabel: 'Media',
    },
    {
      key: 'frameUrls',
      label: 'Chuỗi frame intro',
      icon: Film,
      groupId: 'media',
    },
    {
      key: 'heading',
      label: 'Tiêu đề (tuỳ chọn)',
      icon: Type,
      fieldType: 'text',
      groupId: 'copy',
      groupLabel: 'Chữ (tuỳ chọn)',
    },
    {
      key: 'subheading',
      label: 'Phụ đề (tuỳ chọn)',
      icon: Pilcrow,
      fieldType: 'textarea',
      groupId: 'copy',
    },
  ],
};
