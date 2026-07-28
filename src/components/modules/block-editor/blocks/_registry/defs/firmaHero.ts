/** BlockDef `firma_hero`. */
import { Image as ImageIcon, Pilcrow, Type } from 'lucide-react';
import { FirmaHero } from '../../FirmaHero';
import type { FirmaHeroContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: FirmaHeroContent = {
  titleLead: "Let's create",
  titleAccent: 'together.',
  subtitle:
    'We help businesses find their voice, shape their identity, and connect with their audience. Less talk. More craft.',
  imageUrl:
    'https://framerusercontent.com/images/B4jxrHJqCYeKMdfyNVrqx2Gp4.jpg',
};
const EN: FirmaHeroContent = { ...VI };
export const firmaHeroDef: BlockDef<FirmaHeroContent> = {
  type: 'firma_hero',
  meta: {
    type: 'firma_hero',
    label: 'Hero - Editorial Serif',
    accent: '#8a7f6a',
    adminLabel: 'Hero - Editorial Serif',
    gradient: 'from-stone-100 to-stone-300',
    defaultName: 'Hero - Editorial Serif',
    aiLabelVi: 'hero serif tao nha + subtext + anh lon bo goc',
    aiLabelEn: 'editorial serif hero + subtext + large rounded image',
  },
  component: FirmaHero,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'subtitle', label: 'Phụ đề', icon: Pilcrow, fieldType: 'textarea' },
    { key: 'image', label: 'Ảnh', icon: ImageIcon, fieldType: 'image' },
  ],
};
