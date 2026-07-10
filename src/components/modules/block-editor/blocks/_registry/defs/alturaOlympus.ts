/**
 * BlockDef cho `altura_olympus` — scroll split 50/50 + image sequence.
 * Text CMS + 4 ảnh + feature labels đều content editable.
 */
import {
  Image as ImageIcon,
  Link,
  MousePointerClick,
  Pilcrow,
  Type,
} from 'lucide-react';

import { ALTURA_OLYMPUS_IMAGES } from '@/assets/images/altura_olympus';

import { AlturaOlympus } from '../../AlturaOlympus';
import type { AlturaOlympusContent } from '../../../types';
import type { BlockDef } from '../types';

const DEFAULT_FEATURES = [
  { label: 'Superior Precision', icon: 'Crosshair' },
  { label: 'Water Resistance', icon: 'Droplets' },
  { label: '5-Year Warranty', icon: 'Shield' },
  { label: '100K+ Units Sold', icon: 'Package' },
  { label: 'Grand Seiko Caliber', icon: 'Cog' },
  { label: 'Frequency 3,5 Hz', icon: 'Activity' },
];

const VI: AlturaOlympusContent = {
  eyebrow: 'Gallery',
  heading: 'Take a closer look',
  description:
    'Thoughtfully composed to be seen, felt, and remembered in its own way',
  features: DEFAULT_FEATURES,
  ctaText: 'Discover',
  ctaLink: '#',
  image1Url: ALTURA_OLYMPUS_IMAGES[0],
  image2Url: ALTURA_OLYMPUS_IMAGES[1],
  image3Url: ALTURA_OLYMPUS_IMAGES[2],
  image4Url: ALTURA_OLYMPUS_IMAGES[3],
};

const EN: AlturaOlympusContent = { ...VI };

export const alturaOlympusDef: BlockDef<AlturaOlympusContent> = {
  type: 'altura_olympus',
  meta: {
    type: 'altura_olympus',
    label: 'Altura Olympus',
    accent: '#457B6D',
    adminLabel: 'Altura Olympus',
    gradient: 'from-emerald-800 to-neutral-900',
    defaultName: 'Altura Olympus',
    aiLabelVi:
      'scroll split 50/50: ảnh trái đè ảnh phải → thoát → content trái + ảnh phải scrub m1-m4',
    aiLabelEn:
      '50/50 scroll split: left image overlays right → exits → left content + right image scrub m1-m4',
  },
  component: AlturaOlympus,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Nhãn', icon: Type, fieldType: 'text' },
    { key: 'heading', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    {
      key: 'description',
      label: 'Mô tả',
      icon: Pilcrow,
      fieldType: 'textarea',
    },
    {
      key: 'ctaText',
      label: 'Nút CTA',
      icon: MousePointerClick,
      fieldType: 'text',
    },
    { key: 'ctaLink', label: 'Link CTA', icon: Link, fieldType: 'text' },
    {
      key: 'image1Url',
      label: 'Ảnh 1 (cover)',
      icon: ImageIcon,
      fieldType: 'image',
    },
    { key: 'image2Url', label: 'Ảnh 2', icon: ImageIcon, fieldType: 'image' },
    { key: 'image3Url', label: 'Ảnh 3', icon: ImageIcon, fieldType: 'image' },
    { key: 'image4Url', label: 'Ảnh 4', icon: ImageIcon, fieldType: 'image' },
    {
      key: 'features[0].label',
      label: 'Feature 1',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'features[1].label',
      label: 'Feature 2',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'features[2].label',
      label: 'Feature 3',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'features[3].label',
      label: 'Feature 4',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'features[4].label',
      label: 'Feature 5',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'features[5].label',
      label: 'Feature 6',
      icon: Type,
      fieldType: 'text',
    },
  ],
};
