/**
 * BlockDef cho `springs_hero` — tường ảnh chéo 6 ô (`#l-gallery-sticky` /
 * `.l-gallery__split` springs-estate-clone) + eyebrow trái + headline serif
 * lớn neo bottom-right ("Splendor" / "of Renewal"). Component:
 * `blocks/SpringsHero.tsx`. Path A.
 *
 * Ảnh mặc định dùng LIVE origin springs.estate (`@xxl` ~1440px, không copy
 * byte về repo) — đúng 6 ảnh preloader gốc (trái 1-3, phải 1-3).
 */
import { Heading, Image as ImageIcon, Pilcrow, Type } from 'lucide-react';

import { SpringsHero } from '../../SpringsHero';
import type { SpringsHeroContent } from '../../../types';
import type { BlockDef } from '../types';

const GALLERY_IMAGES = [
  'https://springs.estate/assets/images/media/landing/0.preloader/preloader-left-1@xxl.webp',
  'https://springs.estate/assets/images/media/landing/0.preloader/preloader-left-2@xxl.webp',
  'https://springs.estate/assets/images/media/landing/0.preloader/preloader-left-3@xxl.webp',
  'https://springs.estate/assets/images/media/landing/0.preloader/preloader-right-1@xxl.webp',
  'https://springs.estate/assets/images/media/landing/0.preloader/preloader-right-2@xxl.webp',
  'https://springs.estate/assets/images/media/landing/0.preloader/preloader-right-3@xxl.webp',
];

const VI: SpringsHeroContent = {
  galleryImages: GALLERY_IMAGES,
  eyebrow:
    'Nơi cư trú độc quyền với hạ tầng chăm sóc sức khoẻ phong phú, ngay cạnh Công viên Tự nhiên',
  heading: 'Vẻ rực rỡ\ncủa sự hồi sinh',
  subheading: '',
};

const EN: SpringsHeroContent = {
  galleryImages: GALLERY_IMAGES,
  eyebrow:
    'Exclusive residence with a rich wellness infrastructure next to Nature Park',
  heading: 'Splendor\nof Renewal',
  subheading: '',
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
      'hero tường ảnh chéo 6 ô + tiêu đề serif lớn, entrance scroll reveal',
    aiLabelEn:
      'diagonal 6-photo wall hero + large serif headline, scroll reveal entrance',
  },
  component: SpringsHero,
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'galleryImages',
      label: 'Tường ảnh (6 ảnh)',
      icon: ImageIcon,
      fieldType: 'image',
    },
    { key: 'eyebrow', label: 'Eyebrow', icon: Type, fieldType: 'text' },
    {
      key: 'heading',
      label: 'Tiêu đề lớn',
      icon: Heading,
      fieldType: 'textarea',
    },
    {
      key: 'subheading',
      label: 'Dòng phụ (tuỳ chọn)',
      icon: Pilcrow,
      fieldType: 'text',
    },
  ],
};
