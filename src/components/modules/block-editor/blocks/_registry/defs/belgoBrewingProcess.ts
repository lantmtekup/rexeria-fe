/**
 * BlockDef cho `belgo_brewing_process` — section brewing full-viewport + cup
 * overlay clip-path. Port từ apps/belgo BrewingProcess.tsx. Path A registry.
 */
import { Film, Image as ImageIcon, Tag, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { BelgoBrewingProcessContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: BelgoBrewingProcessContent = {
  videoUrl: '/belgo/videos/cup.mp4',
  eyebrow: 'BREWING PROCESS',
  title: 'THE ART OF BELGIAN BREWING – A LEGACY IN EVERY DROP',
  body: 'From carefully selected malt to the final pour, every step in our brewing process is crafted for perfection. Milled grains, precise mashing, controlled fermentation, and expert conditioning ensure a smooth, flavorful beer. Whether bottled or on tap, each sip embodies true Belgian craftsmanship.',
  cupImageUrl: '/belgo/section-3/cup.png',
};

const EN: BelgoBrewingProcessContent = { ...VI };

export const belgoBrewingProcessDef: BlockDef<BelgoBrewingProcessContent> = {
  type: 'belgo_brewing_process',
  meta: {
    type: 'belgo_brewing_process',
    category: 'intro',
    style: 'luxury',
    tags: ['belgo', 'beer', 'video', 'scroll'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-08-03',
    label: 'Belgo · Brewing Process',
    accent: '#EDE6D6',
    adminLabel: 'Belgo Brewing Process',
    gradient: 'from-amber-950 to-neutral-950',
    defaultName: 'Belgo Brewing Process',
    aiLabelVi:
      'section brewing Belgo: video nền full-viewport, text reveal GSAP, cup overlay clip-path theo scroll',
    aiLabelEn:
      'Belgo brewing section: full-viewport background video, GSAP text reveal, scroll-linked cup overlay clip-path',
  },
  component: dynamic(() =>
    import('../../BelgoBrewingProcess').then(m => m.BelgoBrewingProcess)
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
      groupLabel: 'Nội dung',
    },
    {
      key: 'title',
      label: 'Tiêu đề',
      icon: Type,
      fieldType: 'text',
      groupId: 'copy',
    },
    {
      key: 'body',
      label: 'Mô tả',
      icon: Type,
      fieldType: 'textarea',
      groupId: 'copy',
    },
    {
      key: 'cupImageUrl',
      label: 'Ảnh ly (overlay)',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'cup',
      groupLabel: 'Cup overlay',
    },
  ],
};
