/**
 * BlockDef cho `altura_olympus` — scroll split 50/50 + image sequence.
 */
import { Link, MousePointerClick, Pilcrow, Type } from 'lucide-react';

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
  ],
};
