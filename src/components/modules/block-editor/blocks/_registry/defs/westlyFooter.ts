/**
 * BlockDef cho `westly_footer` — footer tĩnh: logo + tiêu đề mời đăng ký +
 * nút SIGN UP (link picker 4 dạng), hai dải mây trang trí.
 * Port từ apps/the-westly Footer.tsx. Path A registry.
 */
import {
  Cloud,
  Image as ImageIcon,
  Link as LinkIcon,
  Palette,
  Type,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { WestlyFooterContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: WestlyFooterContent = {
  title: 'Sign up for notifications to see more of our interesting products.',
  ctaText: 'Sign up',
  ctaHref: '',
  logoUrl: '/the-westly/logo-icon.svg',
  logoAlt: 'The Westly',
  leftImageUrl: '/the-westly/f1.png',
  rightImageUrl: '/the-westly/f2.png',
  bgColor: '#ffffff',
};

const EN: WestlyFooterContent = { ...VI };

export const westlyFooterDef: BlockDef<WestlyFooterContent> = {
  type: 'westly_footer',
  meta: {
    type: 'westly_footer',
    label: 'The Westly · Footer',
    accent: '#6E7A6F',
    adminLabel: 'The Westly Footer',
    gradient: 'from-neutral-100 to-neutral-300',
    defaultName: 'The Westly Footer',
    aiLabelVi:
      'footer The Westly: logo + tiêu đề mời đăng ký + nút SIGN UP, hai dải mây trang trí',
    aiLabelEn:
      'The Westly footer: logo + sign-up invitation headline + SIGN UP button, cloud decorations',
  },
  component: dynamic(() =>
    import('../../WestlyFooter').then(m => m.WestlyFooter)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'title',
      label: 'Tiêu đề',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'ctaText',
      label: 'Chữ nút',
      icon: Type,
      fieldType: 'text',
      groupId: 'cta',
      groupLabel: 'Nút SIGN UP',
    },
    {
      key: 'ctaHref',
      label: 'Link nút',
      icon: LinkIcon,
      fieldType: 'link',
      groupId: 'cta',
    },
    {
      key: 'logoUrl',
      label: 'Logo',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'leftImageUrl',
      label: 'Mây trái (trang trí)',
      icon: Cloud,
      fieldType: 'image',
      groupId: 'deco',
      groupLabel: 'Trang trí',
    },
    {
      key: 'rightImageUrl',
      label: 'Mây phải (trang trí)',
      icon: Cloud,
      fieldType: 'image',
      groupId: 'deco',
    },
    {
      key: 'bgColor',
      label: 'Màu nền',
      icon: Palette,
      fieldType: 'text',
    },
  ],
};
