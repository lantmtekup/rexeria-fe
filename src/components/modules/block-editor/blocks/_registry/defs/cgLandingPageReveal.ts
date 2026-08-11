/**
 * BlockDef cho `cg_landing_page_reveal` — port Codegrid
 * `24012024-Landing-Page-Reveal` (discord 122): overlay counter + logo letter +
 * image strip → hero scale reveal + headline. Không nav/menu.
 */
import { ImageIcon, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { CgLandingPageRevealContent } from '../../../types';
import type { BlockDef } from '../types';

export const CG_LANDING_PAGE_REVEAL_DEFAULTS = {
  brandText: 'kudos',
  heroImageUrl: '/cg-landing-page-reveal/hero.jpg',
  loaderImageUrl: '/cg-landing-page-reveal/loader.jpg',
} as const satisfies CgLandingPageRevealContent;

const VI: CgLandingPageRevealContent = { ...CG_LANDING_PAGE_REVEAL_DEFAULTS };
const EN: CgLandingPageRevealContent = { ...CG_LANDING_PAGE_REVEAL_DEFAULTS };

export const cgLandingPageRevealDef: BlockDef<CgLandingPageRevealContent> = {
  type: 'cg_landing_page_reveal',
  meta: {
    type: 'cg_landing_page_reveal',
    category: 'intro',
    style: 'minimal',
    tags: [
      'intro',
      'preloader',
      'loader',
      'codegrid',
      'animation',
      'overlay',
      'reveal',
    ],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-08-07',
    label: 'Landing Page Reveal',
    accent: '#e6e0d8',
    adminLabel: 'Landing Page Reveal',
    gradient: 'from-stone-200 via-stone-100 to-neutral-900',
    defaultName: 'Landing Page Reveal',
    aiLabelVi:
      'màn intro full-screen: counter đếm 0–100%, logo chữ lớn, dải ảnh trượt, overlay mờ đi hé lộ hero zoom out và headline',
    aiLabelEn:
      'full-screen intro: 0–100% counter, oversized logo type, sliding image strip, overlay fades to reveal zoomed-out hero and headline',
  },
  component: dynamic(() =>
    import('../../CgLandingPageReveal').then(m => m.CgLandingPageReveal)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'brandText',
      label: 'Thương hiệu',
      icon: Type,
      fieldType: 'text',
      groupId: 'copy',
      groupLabel: 'Nội dung',
    },
    {
      key: 'heroImageUrl',
      label: 'Ảnh hero',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'media',
      groupLabel: 'Media',
    },
    {
      key: 'loaderImageUrl',
      label: 'Ảnh loader strip',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'media',
    },
  ],
};
