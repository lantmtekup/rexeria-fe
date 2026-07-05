/** BlockDef `nordhaven_hero`. */
import { Image as ImageIcon, Type } from 'lucide-react';
import { NordhavenHero } from '../../NordhavenHero';
import type { NordhavenHeroContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: NordhavenHeroContent = {
  wordmark: 'NORDHAVEN',
  imageUrl:
    'https://cdn.prod.website-files.com/690cfcee9951c3898eab7661/69461d9ac2b44a8b6994e559_About%20Gallery%20%281%29.webp',
};
const EN: NordhavenHeroContent = { ...VI };
export const nordhavenHeroDef: BlockDef<NordhavenHeroContent> = {
  type: 'nordhaven_hero',
  meta: {
    type: 'nordhaven_hero',
    label: 'Hero - Masked Wordmark',
    accent: '#111111',
    adminLabel: 'Hero - Masked Wordmark',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'Hero - Masked Wordmark',
    aiLabelVi:
      'chữ khổng lồ wordmark mask ảnh kiến trúc + ảnh nền, nền gần đen',
    aiLabelEn:
      'giant wordmark masking an architecture photo over a dark background',
  },
  component: NordhavenHero,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'wordmark', label: 'Wordmark', icon: Type, fieldType: 'text' },
    { key: 'image', label: 'Ảnh', icon: ImageIcon, fieldType: 'image' },
  ],
};
