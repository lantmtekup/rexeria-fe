import { Image as ImageIcon, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { CiteFlowHeroContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: CiteFlowHeroContent = {
  backgroundImageUrl: '/cite-flow/hero-bg.webp',
  backgroundImageAlt: 'Cite Flow development aerial view',
  heading: 'Live with Nature\nBathe in Serenity',
};
const EN: CiteFlowHeroContent = {
  backgroundImageUrl: '/cite-flow/hero-bg.webp',
  backgroundImageAlt: 'Cite Flow development aerial view',
  heading: 'Live with Nature\nBathe in Serenity',
};

export const citeFlowHeroDef: BlockDef<CiteFlowHeroContent> = {
  type: 'cite_flow_hero',
  meta: {
    type: 'cite_flow_hero',
    label: 'Cite Flow Hero',
    accent: '#3f6b4f',
    adminLabel: 'Cite Flow Hero',
    gradient: 'from-emerald-800 to-neutral-900',
    defaultName: 'Cite Flow Hero',
    aiLabelVi:
      'hero full-viewport: ảnh nền Ken-Burns + heading fade + scroll parallax',
    aiLabelEn:
      'full-viewport hero: Ken-Burns background + heading fade + scroll parallax',
  },
  component: dynamic(() =>
    import('../../CiteFlowHero').then(m => m.CiteFlowHero)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'backgroundImageUrl',
      label: 'Ảnh nền',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'backgroundImageAlt',
      label: 'Alt ảnh nền',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'heading',
      label: 'Tiêu đề',
      icon: Type,
      fieldType: 'textarea',
    },
  ],
};
