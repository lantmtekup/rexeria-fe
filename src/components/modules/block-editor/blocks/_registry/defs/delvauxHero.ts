/**
 * BlockDef cho `delvaux_hero` — hero section `.hero` của delvaux-clone: ảnh
 * đóng khung 80px scale 0.9→1 khi vào trang → scale 1→2 + fade theo scroll →
 * lộ lớp "intro" tua theo scroll (frame-sequence canvas / video / ảnh
 * full-bleed). Component: `blocks/DelvauxHero.tsx`. Path A.
 *
 * Bản gốc KHÔNG có chữ trên hero → heading/subheading mặc định rỗng (tuỳ
 * chọn). Default dùng asset thật trong `public/delvaux/` (thuộc sở hữu dự
 * án): ảnh hero + frame-sequence 142 frame.
 */
import { Film, Image as ImageIcon, Layers, Pilcrow, Type } from 'lucide-react';

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
      'hero cinematic: ảnh đóng khung phóng to + mờ dần theo scroll, lộ frame-sequence/video tua theo scroll',
    aiLabelEn:
      'cinematic hero: framed image scales and fades on scroll, revealing a scroll-scrubbed frame-sequence/video',
  },
  // dynamic để webpack tách chunk per-block (audit FE 2026-07-04 P1).
  component: dynamic(() =>
    import('../../DelvauxHero').then(m => m.DelvauxHero)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'posterUrl',
      label: 'Ảnh chính',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'heading',
      label: 'Tiêu đề (tuỳ chọn)',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'subheading',
      label: 'Phụ đề (tuỳ chọn)',
      icon: Pilcrow,
      fieldType: 'textarea',
    },
    {
      key: 'videoUrl',
      label: 'Video (URL mp4)',
      icon: Film,
      fieldType: 'text',
    },
    {
      key: 'frameUrlPattern',
      label: 'Frame-sequence (URL chứa {i})',
      icon: Layers,
      fieldType: 'text',
    },
  ],
};
