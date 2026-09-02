/**
 * BlockDef cho `westly_hero` — hero The Westly: sân thượng penthouse 3 lớp
 * (mây xa / mây gần / cảnh), chữ nấp sau lớp cảnh, mouse parallax đẩy cảnh và
 * chữ ngược hướng để lộ chữ, exit veil bàn giao sang section sau.
 * Port từ apps/the-westly Hero.tsx. Path A registry.
 */
import {
  AlignLeft,
  Cloud,
  Image as ImageIcon,
  Link as LinkIcon,
  Palette,
  Type,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { WestlyHeroContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: WestlyHeroContent = {
  title: 'The Master Penthouse.',
  subtitle: 'Your Home above the Everything else.',
  ctaText: 'EXPLORE',
  ctaHref: '',
  sceneUrl: '/the-westly/p1-hero.webp',
  sceneAlt: 'Sân thượng penthouse The Westly',
  cloudsFarUrl: '/the-westly/p2-hero.png',
  cloudsMidUrl: '/the-westly/p3-hero.png',
  veilColor: '#F3F1EA',
};

const EN: WestlyHeroContent = {
  ...VI,
  sceneAlt: 'The Westly rooftop terrace',
};

export const westlyHeroDef: BlockDef<WestlyHeroContent> = {
  type: 'westly_hero',
  meta: {
    type: 'westly_hero',
    label: 'The Westly · Hero',
    accent: '#6E7A6F',
    adminLabel: 'The Westly Hero',
    gradient: 'from-stone-500 to-stone-700',
    defaultName: 'The Westly Hero',
    aiLabelVi:
      'hero The Westly: sân thượng penthouse sticky, mây parallax theo chuột, chữ nấp sau cảnh, veil bàn giao sang section sau',
    aiLabelEn:
      'The Westly hero: sticky penthouse terrace, mouse-parallax clouds, copy tucked behind the scene, veil hand-off into the next section',
  },
  component: dynamic(() => import('../../WestlyHero').then(m => m.WestlyHero)),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'title',
      label: 'Tiêu đề',
      icon: Type,
      fieldType: 'text',
      groupId: 'copy',
      groupLabel: 'Khối chữ',
    },
    {
      key: 'subtitle',
      label: 'Dòng phụ',
      icon: AlignLeft,
      fieldType: 'text',
      groupId: 'copy',
    },
    {
      key: 'ctaText',
      label: 'Chữ nút',
      icon: Type,
      fieldType: 'text',
      groupId: 'cta',
      groupLabel: 'Nút EXPLORE',
    },
    {
      key: 'ctaHref',
      label: 'Link nút',
      icon: LinkIcon,
      fieldType: 'link',
      groupId: 'cta',
    },
    {
      key: 'sceneUrl',
      label: 'Ảnh sân thượng',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'layers',
      groupLabel: 'Lớp cảnh',
    },
    {
      key: 'cloudsFarUrl',
      label: 'Mây xa (nền)',
      icon: Cloud,
      fieldType: 'image',
      groupId: 'layers',
    },
    {
      key: 'cloudsMidUrl',
      label: 'Mây gần',
      icon: Cloud,
      fieldType: 'image',
      groupId: 'layers',
    },
    {
      key: 'veilColor',
      label: 'Màu veil bàn giao',
      icon: Palette,
      fieldType: 'text',
    },
  ],
};
