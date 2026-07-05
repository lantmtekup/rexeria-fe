/** BlockDef `ignitex_about`. */
import { Hash, Sparkles, Type } from 'lucide-react';
import { IgnitexAbout } from '../../IgnitexAbout';
import type { IgnitexAboutContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: IgnitexAboutContent = {
  eyebrow: 'About the studio',
  title:
    'Not just another creative agency — a partner obsessed with turning strategy into work that ships.',
  stats: [
    { value: '120+', label: 'Projects delivered' },
    { value: '8 yrs', label: 'In business' },
    { value: '30+', label: 'Happy clients' },
    { value: '12', label: 'Awards won' },
  ],
};
const EN: IgnitexAboutContent = { ...VI };
export const ignitexAboutDef: BlockDef<IgnitexAboutContent> = {
  type: 'ignitex_about',
  meta: {
    type: 'ignitex_about',
    label: 'About - Stats Row',
    accent: '#111111',
    adminLabel: 'About - Stats Row',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'About - Stats Row',
    aiLabelVi: 'cau lon + hang mini-stat nen toi',
    aiLabelEn: 'large statement + mini-stat row on dark',
  },
  component: IgnitexAbout,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Câu', icon: Type, fieldType: 'textarea' },
    { key: 'stats', label: 'Mini-stat', icon: Hash },
  ],
};
