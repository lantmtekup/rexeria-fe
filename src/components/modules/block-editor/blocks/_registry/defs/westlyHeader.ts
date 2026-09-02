/**
 * BlockDef cho `westly_header` — logo giữa nổi fixed trên mọi section, nền
 * radial gradient trắng tan dần. Port từ apps/the-westly Header.tsx (gắn fixed
 * trong layout.tsx của apps). Path A registry.
 */
import { Image as ImageIcon, Link as LinkIcon, Tag } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { WestlyHeaderContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: WestlyHeaderContent = {
  logoUrl: '/the-westly/logo.svg',
  logoAlt: 'The Westly',
  logoHref: '',
};

const EN: WestlyHeaderContent = { ...VI };

export const westlyHeaderDef: BlockDef<WestlyHeaderContent> = {
  type: 'westly_header',
  meta: {
    type: 'westly_header',
    label: 'The Westly · Header',
    accent: '#6E7A6F',
    adminLabel: 'The Westly Header',
    gradient: 'from-white to-neutral-200',
    defaultName: 'The Westly Header',
    aiLabelVi:
      'header The Westly: logo giữa nổi fixed trên mọi section, nền gradient trắng tan dần',
    aiLabelEn:
      'The Westly header: centered logo fixed above every section on a fading white gradient',
  },
  component: dynamic(() =>
    import('../../WestlyHeader').then(m => m.WestlyHeader)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'logoUrl',
      label: 'Logo',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'logo',
      groupLabel: 'Logo',
    },
    {
      key: 'logoAlt',
      label: 'Alt logo',
      icon: Tag,
      fieldType: 'text',
      groupId: 'logo',
    },
    {
      key: 'logoHref',
      label: 'Link logo',
      icon: LinkIcon,
      fieldType: 'link',
      groupId: 'logo',
    },
  ],
};
