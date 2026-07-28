/**
 * BlockDef cho `springs_hero` — port section `#about` / `.l-intro` gốc của
 * springs.estate: STICKY SCROLL HERO 600vh (opening h1+subtitle fade-up →
 * ảnh nền thu hẹp clip-path → 3 ảnh cột phải reveal tuần tự + scale).
 * Component: `blocks/SpringsHero.tsx`. Path A.
 *
 * Ảnh mặc định trỏ asset LOCAL trong `public/landing/springs/intro/` (5 file
 * webp gốc đã tải về repo): 1 ảnh nền + 3 ảnh reveal.
 */
import { Heading, Image as ImageIcon, Pilcrow } from 'lucide-react';

import { SpringsHero } from '../../SpringsHero';
import type { SpringsHeroContent } from '../../../types';
import type { BlockDef } from '../types';

const INTRO = '/landing/springs/intro';

/** Ảnh nền lớn (gốc `intro-image@md`). */
const BACKGROUND_IMAGE = `${INTRO}/intro-image@md.webp`;

/** 3 ảnh cột phải reveal tuần tự (gốc opening-1/3/2). */
const REVEAL_IMAGES = [
  `${INTRO}/opening-1@xxl.webp`,
  `${INTRO}/opening-3@xxl.webp`,
  `${INTRO}/opening-2@xxl.webp`,
];

const VI: SpringsHeroContent = {
  title: 'Sống đẳng cấp\nvới tầm nhìn vô đối',
  subtitle:
    'Căn hộ, nhà phố liền kề và penthouse duplex trong một khu dân cư yên tĩnh, xanh mát.',
  backgroundImage: BACKGROUND_IMAGE,
  revealImages: REVEAL_IMAGES,
};

const EN: SpringsHeroContent = {
  title: 'Premium Living\nwith Unrivaled Views',
  subtitle:
    'Apartments, terraced townhouses, and duplex penthouses in a quiet, green neighborhood.',
  backgroundImage: BACKGROUND_IMAGE,
  revealImages: REVEAL_IMAGES,
};

export const springsHeroDef: BlockDef<SpringsHeroContent> = {
  type: 'springs_hero',
  meta: {
    type: 'springs_hero',
    label: 'Springs - Hero',
    accent: '#173620',
    adminLabel: 'Springs - Hero',
    gradient: 'from-emerald-950 to-emerald-700',
    defaultName: 'Springs - Hero',
    aiLabelVi:
      'hero sticky-scroll 600vh: tiêu đề fade-up, ảnh nền thu hẹp clip-path, 3 ảnh reveal tuần tự',
    aiLabelEn:
      'sticky-scroll hero 600vh: title fade-up, background clip-path narrow, 3 images sequential reveal',
  },
  component: SpringsHero,
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'title',
      label: 'Tiêu đề lớn',
      icon: Heading,
      fieldType: 'textarea',
    },
    { key: 'subtitle', label: 'Dòng phụ', icon: Pilcrow, fieldType: 'text' },
    {
      key: 'backgroundImage',
      label: 'Ảnh nền',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'revealImages',
      label: 'Ảnh reveal (3 ảnh)',
      icon: ImageIcon,
      fieldType: 'image',
    },
  ],
};
