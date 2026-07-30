import { Image as ImageIcon, Play, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { CiteFlowIntroContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: CiteFlowIntroContent = {
  eyebrow: 'Ecopark Onsen',
  heading:
    "Life Style Redefined. It's a first of its kind concept in Vietnam set within Ecopark's larger vision of green, sustainable urban living",
  posterUrl: '/cite-flow/onsen-pools.webp',
  videoUrl: '',
  playIconUrl: '/cite-flow/play-button.svg',
};
const EN: CiteFlowIntroContent = { ...VI };

export const citeFlowIntroDef: BlockDef<CiteFlowIntroContent> = {
  type: 'cite_flow_intro',
  meta: {
    type: 'cite_flow_intro',
    label: 'Cite Flow Intro',
    accent: '#3f6b4f',
    adminLabel: 'Cite Flow Intro',
    gradient: 'from-emerald-800 to-neutral-900',
    defaultName: 'Cite Flow Intro',
    aiLabelVi:
      'intro section: eyebrow + heading reveal theo từ, ảnh scale theo scroll, nút play crossfade sang video',
    aiLabelEn:
      'intro section: word-by-word eyebrow + heading reveal, scroll-scrubbed media scale, play button crossfades to video',
  },
  component: dynamic(() =>
    import('../../CiteFlowIntro').then(m => m.CiteFlowIntro)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'eyebrow',
      label: 'Eyebrow',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'heading',
      label: 'Tiêu đề',
      icon: Type,
      fieldType: 'textarea',
    },
    {
      key: 'posterUrl',
      label: 'Ảnh',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'media',
      groupLabel: 'Media',
    },
    {
      key: 'videoUrl',
      label: 'Video',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'media',
    },
    {
      key: 'playIconUrl',
      label: 'Icon nút play',
      icon: Play,
      fieldType: 'image',
      groupId: 'media',
    },
  ],
};
