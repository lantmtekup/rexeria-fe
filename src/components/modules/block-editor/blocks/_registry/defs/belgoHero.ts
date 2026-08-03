/**
 * BlockDef cho `belgo_hero` — hero Belgo: video nền full-bleed + tiêu đề Bebas
 * nhiều dòng canh giữa. Port từ apps/belgo Hero.tsx. Path A registry.
 */
import { Film, ListChecks } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { BelgoHeroContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: BelgoHeroContent = {
  videoUrl: '/belgo/videos/hero.mp4',
  titleLines: ['BELGIAN', 'CRAFT BEER'],
};

const EN: BelgoHeroContent = {
  ...VI,
  titleLines: ['BELGIAN', 'CRAFT BEER'],
};

export const belgoHeroDef: BlockDef<BelgoHeroContent> = {
  type: 'belgo_hero',
  meta: {
    type: 'belgo_hero',
    label: 'Belgo · Hero',
    accent: '#EDE6D6',
    adminLabel: 'Belgo Hero',
    gradient: 'from-amber-950 to-neutral-950',
    defaultName: 'Belgo Hero',
    aiLabelVi:
      'hero Belgo: video nền full-bleed, scrim nhẹ, tiêu đề Bebas nhiều dòng canh giữa',
    aiLabelEn:
      'Belgo hero: full-bleed background video, subtle scrim, centered multi-line Bebas display title',
  },
  component: dynamic(() => import('../../BelgoHero').then(m => m.BelgoHero)),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'videoUrl',
      label: 'Video nền (ảnh hoặc mp4)',
      icon: Film,
      fieldType: 'image',
    },
    // titleLines expand in LayersPanel.elementsForType(belgo_hero)
    {
      key: 'titleLines',
      label: 'Thêm / quản lý tiêu đề',
      icon: ListChecks,
    },
  ],
};
