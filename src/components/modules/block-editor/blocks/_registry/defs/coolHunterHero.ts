/**
 * BlockDef cho `cool_hunter_hero` — hero Cool Hunter: logo bar + tiêu đề serif
 * + khung ảnh scrub phóng lên full stage (chữ lật đen ↔ trắng ở mép ảnh).
 * Port từ apps/cool-hunter Hero.tsx (+ Header). Path A registry.
 *
 * Title lines expand trong LayersPanel từ `titleLines[]` (không list cứng ở đây).
 */
import { Image as ImageIcon, ListChecks } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { CoolHunterHeroContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: CoolHunterHeroContent = {
  logoUrl: '/cool-hunter/logo.png',
  logoAlt: 'Cool Hunter',
  titleLines: ['A House Built', 'Like a Camera'],
  imageUrl: '/cool-hunter/hero.webp',
  imageAlt: 'Căn nhà bên hồ giữa rừng cây',
};

const EN: CoolHunterHeroContent = {
  ...VI,
  titleLines: ['A House Built', 'Like a Camera'],
  imageAlt: 'A house on a lakeshore surrounded by trees',
};

export const coolHunterHeroDef: BlockDef<CoolHunterHeroContent> = {
  type: 'cool_hunter_hero',
  meta: {
    type: 'cool_hunter_hero',
    label: 'Cool Hunter · Hero',
    accent: '#111111',
    adminLabel: 'Cool Hunter Hero',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Cool Hunter Hero',
    aiLabelVi:
      'hero Cool Hunter: logo + tiêu đề serif, khung ảnh scrub phóng to phủ chữ (chữ đổi đen ↔ trắng)',
    aiLabelEn:
      'Cool Hunter hero: logo + serif title, image frame scrubs to full bleed over the copy (title flips black ↔ white)',
  },
  component: dynamic(() =>
    import('../../CoolHunterHero').then(m => m.CoolHunterHero)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'logoUrl',
      label: 'Logo',
      icon: ImageIcon,
      fieldType: 'image',
    },
    // titleLines slots expand in LayersPanel.elementsForType(cool_hunter_hero)
    {
      key: 'titleLines',
      label: 'Thêm / quản lý tiêu đề',
      icon: ListChecks,
    },
    {
      key: 'imageUrl',
      label: 'Ảnh hero',
      icon: ImageIcon,
      fieldType: 'image',
    },
  ],
};
