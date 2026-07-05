/** BlockDef `lumea_hero`. */
import {
  Image as ImageIcon,
  MousePointerClick,
  Sparkles,
  Type,
} from 'lucide-react';
import { LumeaHero } from '../../LumeaHero';
import type { LumeaHeroContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: LumeaHeroContent = {
  eyebrow: 'Rise to a New Standard of Luxury',
  title: 'Where Elegance Meets the Horizon',
  primaryCta: 'Book a Private Tour',
  secondaryCta: 'View Features',
  imageUrl:
    'https://cdn.prod.website-files.com/68e5ec116b3a2c9be42a08b1/68e5ec116b3a2c9be42a08bf_Hero%20%281%29.webp',
};
const EN: LumeaHeroContent = { ...VI };
export const lumeaHeroDef: BlockDef<LumeaHeroContent> = {
  type: 'lumea_hero',
  meta: {
    type: 'lumea_hero',
    label: 'Hero - Luxury Fullbleed',
    accent: '#a68a5b',
    adminLabel: 'Hero - Luxury Fullbleed',
    gradient: 'from-stone-800 to-neutral-900',
    defaultName: 'Hero - Luxury Fullbleed',
    aiLabelVi:
      'hero full-bleed ảnh nội thất + overlay tối, eyebrow + heading serif lớn + 2 nút',
    aiLabelEn:
      'full-bleed interior hero with dark overlay, eyebrow + big serif heading + two CTAs',
  },
  component: LumeaHero,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    {
      key: 'primaryCta',
      label: 'Nút chính',
      icon: MousePointerClick,
      fieldType: 'text',
    },
    {
      key: 'secondaryCta',
      label: 'Nút phụ',
      icon: MousePointerClick,
      fieldType: 'text',
    },
    { key: 'image', label: 'Ảnh nền', icon: ImageIcon, fieldType: 'image' },
  ],
};
