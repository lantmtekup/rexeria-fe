/**
 * BlockDef cho `pnj_header` — logo cố định góc trên PNJ.
 * Port từ apps/pnj Header. Path A registry.
 */
import { Image as ImageIcon, Link2, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { PnjHeaderContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: PnjHeaderContent = {
  logoUrl: '/pnj/logo-pnj.png',
  logoAlt: 'PNJ',
  logoHref: '',
};

const EN: PnjHeaderContent = {
  logoUrl: '/pnj/logo-pnj.png',
  logoAlt: 'PNJ',
  logoHref: '',
};

export const pnjHeaderDef: BlockDef<PnjHeaderContent> = {
  type: 'pnj_header',
  meta: {
    type: 'pnj_header',
    label: 'PNJ · Header',
    accent: '#003468',
    adminLabel: 'PNJ Header',
    gradient: 'from-white to-neutral-100',
    defaultName: 'PNJ Header',
    aiLabelVi: 'header PNJ: logo fixed top trong suốt, thu nhỏ khi scroll',
    aiLabelEn:
      'PNJ fixed-top logo header: transparent over hero, shrinks on scroll',
  },
  component: dynamic(() => import('../../PnjHeader').then(m => m.PnjHeader)),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'logoUrl',
      label: 'Logo',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'logoAlt',
      label: 'Alt / aria-label',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'logoHref',
      label: 'Link logo',
      icon: Link2,
      fieldType: 'text',
    },
  ],
};
