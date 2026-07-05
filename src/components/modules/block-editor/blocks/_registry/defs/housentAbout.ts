/** BlockDef `housent_about` — who-we-are split intro. */
import { Hash, Pilcrow, Sparkles, Type } from 'lucide-react';

import { HousentAbout } from '../../HousentAbout';
import type { HousentAboutContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: HousentAboutContent = {
  eyebrow: 'Who We Are',
  title: 'Architecting trust in every square meter',
  text: 'For over fifteen years we have guided buyers and sellers through every kind of market. Verified listings, transparent pricing and advisors who treat your goals as their own — that is how we build lasting confidence.',
  points: [
    { value: '15+ yrs', label: 'On the market' },
    { value: '12k+', label: 'Homes matched' },
    { value: '40+', label: 'Expert advisors' },
    { value: '98%', label: 'Would recommend' },
  ],
};
const EN: HousentAboutContent = { ...VI };

export const housentAboutDef: BlockDef<HousentAboutContent> = {
  type: 'housent_about',
  meta: {
    type: 'housent_about',
    label: 'About - Split Intro',
    accent: '#e8622c',
    adminLabel: 'About - Split Intro',
    gradient: 'from-orange-100 to-stone-200',
    defaultName: 'About - Split Intro',
    aiLabelVi:
      'giới thiệu 2 cột: tiêu đề lớn trái + đoạn mô tả và mini-stat phải',
    aiLabelEn:
      'two-column intro: big heading left + description and mini-stats right',
  },
  component: HousentAbout,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'text', label: 'Mô tả', icon: Pilcrow, fieldType: 'textarea' },
    { key: 'points', label: 'Mini-stat', icon: Hash },
  ],
};
