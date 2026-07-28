/**
 * BlockDef cho `cool_hunter_footer` — footer Cool Hunter: icon + tiêu đề CTA +
 * nút Sign Up, ảnh nền dâng từ dưới khi scroll (không pin). Port từ
 * apps/cool-hunter FooterSection.tsx. Path A registry.
 */
import { Image as ImageIcon, Link2, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { CoolHunterFooterContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: CoolHunterFooterContent = {
  bgUrl: '/cool-hunter/footer-bg.png',
  iconUrl: '/cool-hunter/icon-footer.svg',
  title: 'Sign Up For Notifications To See More\nOf Our Interesting Stories.',
  ctaText: 'Sign Up',
  ctaHref: '',
};

const EN: CoolHunterFooterContent = {
  ...VI,
};

export const coolHunterFooterDef: BlockDef<CoolHunterFooterContent> = {
  type: 'cool_hunter_footer',
  meta: {
    type: 'cool_hunter_footer',
    label: 'Cool Hunter · Footer',
    accent: '#111111',
    adminLabel: 'Cool Hunter Footer',
    gradient: 'from-neutral-200 to-neutral-800',
    defaultName: 'Cool Hunter Footer',
    aiLabelVi:
      'footer Cool Hunter: icon + tiêu đề CTA + nút Sign Up, ảnh nền dâng từ dưới khi scroll',
    aiLabelEn:
      'Cool Hunter footer: icon + CTA headline + Sign Up button, background image rises on scroll',
  },
  component: dynamic(() =>
    import('../../CoolHunterFooter').then(m => m.CoolHunterFooter)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'bgUrl',
      label: 'Ảnh nền',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'media',
      groupLabel: 'Ảnh',
    },
    {
      key: 'iconUrl',
      label: 'Icon',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'media',
    },
    {
      key: 'title',
      label: 'Tiêu đề',
      icon: Type,
      fieldType: 'textarea',
      groupId: 'cta',
      groupLabel: 'CTA',
    },
    {
      key: 'ctaText',
      label: 'Nút',
      icon: Type,
      fieldType: 'text',
      groupId: 'cta',
    },
    {
      key: 'ctaHref',
      label: 'Link nút',
      icon: Link2,
      fieldType: 'link',
      groupId: 'cta',
    },
  ],
};
