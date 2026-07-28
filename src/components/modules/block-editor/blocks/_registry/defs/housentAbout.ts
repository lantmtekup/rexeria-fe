/** BlockDef `housent_about` — who-we-are intro 1 cột canh giữa. */
import { MousePointerClick, Pilcrow, Sparkles, Type } from 'lucide-react';

import { HousentAbout } from '../../HousentAbout';
import type { HousentAboutContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: HousentAboutContent = {
  eyebrow: 'Who We Are',
  title: 'Architecting Trust in Every Square Meter',
  text: 'We are redefining the industry standard. By neutralizing the noise of the market, we transform raw analytics into clear, human-centric property solutions. Transparency isn’t just a word for us — it’s our core architecture, ensuring every transaction is rooted in real-time verified data.',
  text2:
    'Experience a secure, digital-first approach to real estate. We combine structural precision with high-end technology to make your journey effortless. Whether building a local home or a worldwide portfolio, we empower you with the clarity needed to make bold, informed decisions.',
  ctaText: 'Explore Us',
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
      'giới thiệu 1 cột canh giữa: badge + nút CTA trên đầu, tiêu đề lớn, 2 đoạn mô tả',
    aiLabelEn:
      'centered intro: badge + CTA button on top, big heading, two body paragraphs',
  },
  component: HousentAbout,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Badge', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'text', label: 'Đoạn 1', icon: Pilcrow, fieldType: 'textarea' },
    { key: 'text2', label: 'Đoạn 2', icon: Pilcrow, fieldType: 'textarea' },
    {
      key: 'ctaText',
      label: 'Nút CTA',
      icon: MousePointerClick,
      fieldType: 'text',
    },
  ],
};
