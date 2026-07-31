import { Image as ImageIcon, Link2, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { CiteFlowFooterContent } from '../../../types';
import type { BlockDef } from '../types';

const CONTENT: CiteFlowFooterContent = {
  heading: 'Say Hello!',
  email: 'info@ecoparkonsen.com',
  menuLabel: 'Menu',
  menuLink1Label: 'Home',
  menuLink1Href: '/',
  menuLink2Label: 'Contact',
  menuLink2Href: '/contact',
  socialLabel: 'Social Media',
  socialLink1Label: 'LinkedIn',
  socialLink1Href: '#',
  socialLink2Label: 'Behance',
  socialLink2Href: '#',
  socialLink3Label: 'YouTube',
  socialLink3Href: '#',
  logoUrl: '/cite-flow/ecopark-logo.png',
  logoAlt: 'Ecopark Onsen',
};

export const citeFlowFooterDef: BlockDef<CiteFlowFooterContent> = {
  type: 'cite_flow_footer',
  meta: {
    type: 'cite_flow_footer',
    label: 'Cite Flow Footer',
    accent: '#3f6b4f',
    adminLabel: 'Cite Flow Footer',
    gradient: 'from-emerald-800 to-neutral-900',
    defaultName: 'Cite Flow Footer',
    aiLabelVi:
      'footer "curtain reveal": khối cao dính (sticky) hiện dần khi cuộn tới cuối trang — heading liên hệ, cột Menu + Social, logo',
    aiLabelEn:
      '"curtain reveal" footer: a tall sticky block that reveals on scroll — contact heading, Menu + Social columns, logo',
  },
  component: dynamic(() =>
    import('../../CiteFlowFooter').then(m => m.CiteFlowFooter)
  ),
  defaultContent: { vi: CONTENT, en: CONTENT },
  elements: [
    { key: 'heading', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'email', label: 'Email', icon: Type, fieldType: 'text' },
    {
      key: 'menuLabel',
      label: 'Nhãn cột',
      groupId: 'menu',
      groupLabel: 'Menu',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'menuLink1Label',
      label: 'Mục 1 — Nhãn',
      groupId: 'menu',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'menuLink1Href',
      label: 'Mục 1 — Link',
      groupId: 'menu',
      icon: Link2,
      fieldType: 'link',
    },
    {
      key: 'menuLink2Label',
      label: 'Mục 2 — Nhãn',
      groupId: 'menu',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'menuLink2Href',
      label: 'Mục 2 — Link',
      groupId: 'menu',
      icon: Link2,
      fieldType: 'link',
    },
    {
      key: 'socialLabel',
      label: 'Nhãn cột',
      groupId: 'social',
      groupLabel: 'Social Media',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'socialLink1Label',
      label: 'Mục 1 — Nhãn',
      groupId: 'social',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'socialLink1Href',
      label: 'Mục 1 — Link',
      groupId: 'social',
      icon: Link2,
      fieldType: 'link',
    },
    {
      key: 'socialLink2Label',
      label: 'Mục 2 — Nhãn',
      groupId: 'social',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'socialLink2Href',
      label: 'Mục 2 — Link',
      groupId: 'social',
      icon: Link2,
      fieldType: 'link',
    },
    {
      key: 'socialLink3Label',
      label: 'Mục 3 — Nhãn',
      groupId: 'social',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'socialLink3Href',
      label: 'Mục 3 — Link',
      groupId: 'social',
      icon: Link2,
      fieldType: 'link',
    },
    {
      key: 'logoUrl',
      label: 'Logo',
      groupId: 'logo',
      groupLabel: 'Logo',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'logoAlt',
      label: 'Alt logo',
      groupId: 'logo',
      icon: Type,
      fieldType: 'text',
    },
  ],
};
