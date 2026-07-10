/**
 * BlockDef cho `altura_olympus` — scroll split 50/50 + image sequence.
 * Default images trỏ URL S3 (uploaded 2026-07-10) thay vì asset local —
 * src/assets/images/altura_olympus/*.png vẫn giữ làm fallback cuối cùng
 * trong AlturaOlympus.tsx cho block cũ chưa có field.
 */
import {
  ImageIcon,
  Link,
  MousePointerClick,
  Pilcrow,
  Type,
} from 'lucide-react';

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

const CDN = 'https://d10zufojjcedud.cloudfront.net/uploads';
const DEFAULT_IMAGES: Pick<
  AlturaOlympusContent,
  'coverImageUrl' | 'image2Url' | 'image3Url' | 'image4Url'
> = {
  coverImageUrl: `${CDN}/b1f3296c-8578-4a1f-b049-d33fda29fb02/altura_olympus_m1.png`,
  image2Url: `${CDN}/04f5b2e5-e815-4866-adea-1c0c11d25525/altura_olympus_m2.png`,
  image3Url: `${CDN}/7d103c7b-8f89-4544-88f3-0b9d46e2e78c/altura_olympus_m3.png`,
  image4Url: `${CDN}/248def38-841a-49cc-9e24-b07be9d18702/altura_olympus_m4.png`,
};

const VI: AlturaOlympusContent = {
  eyebrow: 'Gallery',
  heading: 'Take a closer look',
  description:
    'Thoughtfully composed to be seen, felt, and remembered in its own way',
  features: DEFAULT_FEATURES,
  ctaText: 'Discover',
  ctaLink: '#',
  ...DEFAULT_IMAGES,
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
    {
      key: 'coverImageUrl',
      label: 'Ảnh cover (m1)',
      icon: ImageIcon,
      fieldType: 'image',
    },
    { key: 'image2Url', label: 'Ảnh 2', icon: ImageIcon, fieldType: 'image' },
    { key: 'image3Url', label: 'Ảnh 3', icon: ImageIcon, fieldType: 'image' },
    { key: 'image4Url', label: 'Ảnh 4', icon: ImageIcon, fieldType: 'image' },
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
