import { HelpCircle, Image as ImageIcon, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type {
  CiteFlowHeaderContent,
  CiteFlowHeaderSocialLink,
} from '../../../types';
import type { LayerElement } from '../../../LayersPanel';
import type { BlockDef } from '../types';

const DEFAULT_SOCIAL_LINKS: CiteFlowHeaderSocialLink[] = [
  { label: 'LinkedIn', href: '#' },
  { label: 'Behance', href: '#' },
  { label: 'YouTube', href: '#' },
];

const CONTENT: CiteFlowHeaderContent = {
  variant: 'dark',
  logoUrl: '/cite-flow/ecopark-logo.png',
  logoAlt: 'Ecopark',
  logoHref: '/',
  contactLabel: 'Contact',
  contactHref: '#',
  emailHeading: '{ SAY HELLO }',
  emailLabel: 'info@ecoparkonsen.com',
  emailHref: 'mailto:info@ecoparkonsen.com',
  socialHeading: '{ SOCIAL MEDIA }',
  socialLinks: DEFAULT_SOCIAL_LINKS,
};

export const citeFlowHeaderSocialLinkElements = (
  links: CiteFlowHeaderSocialLink[]
): LayerElement[] => {
  const list = links.length > 0 ? links : DEFAULT_SOCIAL_LINKS;
  return list.flatMap((link, i) => {
    const groupId = `social${i}`;
    const groupLabel = link.label?.trim() || `Social ${i + 1}`;
    return [
      {
        key: `socialLinks[${i}].label`,
        label: 'Nhãn',
        groupId,
        groupLabel,
        icon: HelpCircle,
        fieldType: 'text' as const,
      },
      {
        key: `socialLinks[${i}].href`,
        label: 'Link',
        groupId,
        icon: Type,
        fieldType: 'link' as const,
      },
    ];
  });
};

export const citeFlowHeaderDef: BlockDef<CiteFlowHeaderContent> = {
  type: 'cite_flow_header',
  meta: {
    type: 'cite_flow_header',
    label: 'Cite Flow Header',
    accent: '#3f6b4f',
    adminLabel: 'Cite Flow Header',
    gradient: 'from-emerald-800 to-neutral-900',
    defaultName: 'Cite Flow Header',
    aiLabelVi:
      'header dính (fixed) trên cùng: logo + nav Contact, hamburger mobile mở panel Contact/email/social, ẩn/hiện theo hướng cuộn',
    aiLabelEn:
      'fixed top header: logo + Contact nav, mobile hamburger opens Contact/email/social panel, hides/shows on scroll direction',
  },
  component: dynamic(() =>
    import('../../CiteFlowHeader').then(m => m.CiteFlowHeader)
  ),
  defaultContent: { vi: CONTENT, en: CONTENT },
  elements: [
    {
      key: 'variant',
      label: 'Biến thể (dark/light)',
      icon: Type,
      fieldType: 'text',
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
      label: 'Alt',
      groupId: 'logo',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'logoHref',
      label: 'Link',
      groupId: 'logo',
      icon: Type,
      fieldType: 'link',
    },
    {
      key: 'contactLabel',
      label: 'Nhãn',
      groupId: 'contact',
      groupLabel: 'Nav — Contact',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'contactHref',
      label: 'Link',
      groupId: 'contact',
      icon: Type,
      fieldType: 'link',
    },
    {
      key: 'emailHeading',
      label: 'Tiêu đề mục',
      groupId: 'email',
      groupLabel: 'Email',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'emailLabel',
      label: 'Nhãn',
      groupId: 'email',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'emailHref',
      label: 'mailto:',
      groupId: 'email',
      icon: Type,
      fieldType: 'link',
    },
    {
      key: 'socialHeading',
      label: 'Tiêu đề mục',
      groupId: 'socialHeading',
      groupLabel: 'Social Media — tiêu đề',
      icon: Type,
      fieldType: 'text',
    },
    ...citeFlowHeaderSocialLinkElements(DEFAULT_SOCIAL_LINKS),
    {
      key: 'socialLinks',
      label: 'Thêm / quản lý social',
      icon: HelpCircle,
    },
  ],
};
