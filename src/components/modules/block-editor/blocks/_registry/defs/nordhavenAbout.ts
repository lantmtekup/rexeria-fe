/** BlockDef `nordhaven_about`. */
import { Pilcrow, Sparkles, Type } from 'lucide-react';
import { NordhavenAbout } from '../../NordhavenAbout';
import type { NordhavenAboutContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: NordhavenAboutContent = {
  eyebrow: 'About Us',
  title:
    'We design spaces that speak quiet clarity, balance, and timeless character.',
  text: 'Nordhaven is an architecture and interior studio working across residential and cultural projects. We believe restraint is a form of luxury — every material, every line, chosen to last.',
};
const EN: NordhavenAboutContent = { ...VI };
export const nordhavenAboutDef: BlockDef<NordhavenAboutContent> = {
  type: 'nordhaven_about',
  meta: {
    type: 'nordhaven_about',
    label: 'About - Uppercase Statement',
    accent: '#111111',
    adminLabel: 'About - Uppercase Statement',
    gradient: 'from-neutral-800 to-neutral-950',
    defaultName: 'About - Uppercase Statement',
    aiLabelVi: 'câu lớn uppercase + đoạn mô tả trên nền đen',
    aiLabelEn: 'large uppercase statement + copy on a dark background',
  },
  component: NordhavenAbout,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'textarea' },
    { key: 'text', label: 'Mô tả', icon: Pilcrow, fieldType: 'textarea' },
  ],
};
