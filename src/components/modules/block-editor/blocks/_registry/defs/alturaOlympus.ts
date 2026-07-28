/**
 * BlockDef cho `altura_olympus` — scroll split 50/50 + image sequence.
 * Text CMS + images[] động + features[] (label + lucide icon). Legacy
 * image1..4Url vẫn resolve được. Assets local fallback trong component.
 */
import {
  Image as ImageIcon,
  Link,
  ListChecks,
  MousePointerClick,
  Pilcrow,
  Shapes,
  Type,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  AlturaOlympusContent,
  AlturaOlympusFeature,
} from '../../../types';
import type { BlockDef } from '../types';

const AlturaOlympus = dynamic(() =>
  import('../../AlturaOlympus').then(m => m.AlturaOlympus)
);

export const ALTURA_OLYMPUS_ICON_OPTIONS = [
  'Crosshair',
  'Droplets',
  'Shield',
  'Package',
  'Cog',
  'Activity',
] as const;

export type AlturaOlympusIconName =
  (typeof ALTURA_OLYMPUS_ICON_OPTIONS)[number];

export const ALTURA_OLYMPUS_DEFAULT_FEATURES: AlturaOlympusFeature[] = [
  { label: 'Superior Precision', icon: 'Crosshair' },
  { label: 'Water Resistance', icon: 'Droplets' },
  { label: '5-Year Warranty', icon: 'Shield' },
  { label: '100K+ Units Sold', icon: 'Package' },
  { label: 'Grand Seiko Caliber', icon: 'Cog' },
  { label: 'Frequency 3,5 Hz', icon: 'Activity' },
];

const CDN = 'https://d10zufojjcedud.cloudfront.net/uploads';

export const ALTURA_OLYMPUS_DEFAULT_IMAGES: string[] = [
  `${CDN}/b1f3296c-8578-4a1f-b049-d33fda29fb02/altura_olympus_m1.png`,
  `${CDN}/04f5b2e5-e815-4866-adea-1c0c11d25525/altura_olympus_m2.png`,
  `${CDN}/7d103c7b-8f89-4544-88f3-0b9d46e2e78c/altura_olympus_m3.png`,
  `${CDN}/248def38-841a-49cc-9e24-b07be9d18702/altura_olympus_m4.png`,
];

const LEGACY_IMAGE_KEYS = [
  'image1Url',
  'image2Url',
  'image3Url',
  'image4Url',
] as const;

/** Resolve images[] — ưu tiên mảng; fallback legacy flat; rồi default CDN. */
export const resolveAlturaOlympusImages = (
  content: AlturaOlympusContent | null | undefined
): string[] => {
  const raw = content?.images;
  if (Array.isArray(raw) && raw.length > 0) {
    const urls = raw
      .filter((u): u is string => typeof u === 'string')
      .map(u => u.trim())
      .filter(Boolean);
    if (urls.length > 0) return urls;
  }

  const legacy = LEGACY_IMAGE_KEYS.map(key => {
    const v = content?.[key];
    return typeof v === 'string' ? v.trim() : '';
  }).filter(Boolean);

  if (legacy.length > 0) return legacy;
  return [...ALTURA_OLYMPUS_DEFAULT_IMAGES];
};

/** Resolve features[] — fallback default khi thiếu / rỗng. */
export const resolveAlturaOlympusFeatures = (
  content: AlturaOlympusContent | null | undefined
): AlturaOlympusFeature[] => {
  const raw = content?.features;
  if (!Array.isArray(raw) || raw.length === 0) {
    return ALTURA_OLYMPUS_DEFAULT_FEATURES.map(f => ({ ...f }));
  }
  return raw
    .filter(f => f && typeof f === 'object')
    .map(f => ({
      label: typeof f.label === 'string' ? f.label : '',
      icon:
        typeof f.icon === 'string' && f.icon.trim()
          ? f.icon.trim()
          : 'Crosshair',
    }));
};

/**
 * Layers — 1 ảnh / slot. Dùng chung giữa BlockDef và LayersPanel.
 */
export const alturaOlympusImageElements = (
  images: string[]
): LayerElement[] => {
  const list = images.length > 0 ? images : ALTURA_OLYMPUS_DEFAULT_IMAGES;
  return list.map((_, i) => ({
    key: `images[${i}]`,
    label: i === 0 ? 'Ảnh 1 (cover)' : `Ảnh ${i + 1}`,
    // groupId ≠ 'images' — tránh trùng React key với layer manager `images`.
    groupId: 'imageSlots',
    groupLabel: i === 0 ? 'Ảnh' : undefined,
    icon: ImageIcon,
    fieldType: 'image' as const,
  }));
};

/**
 * Layers folders — 1 group / feature (label + icon).
 */
export const alturaOlympusFeatureElements = (
  features: AlturaOlympusFeature[]
): LayerElement[] => {
  const list = features.length > 0 ? features : ALTURA_OLYMPUS_DEFAULT_FEATURES;
  return list.flatMap((feat, i) => {
    const groupId = `feature${i}`;
    const groupLabel =
      (feat.label ?? '').trim().slice(0, 40) || `Feature ${i + 1}`;
    return [
      {
        key: `features[${i}].label`,
        label: 'Nhãn',
        groupId,
        groupLabel,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `features[${i}].icon`,
        label: 'Icon (lucide)',
        groupId,
        icon: Shapes,
        fieldType: 'text' as const,
      },
    ];
  });
};

const CONTENT_ELEMENTS: LayerElement[] = [
  {
    key: 'eyebrow',
    label: 'Nhãn',
    groupId: 'content',
    groupLabel: 'Nội dung',
    icon: Type,
    fieldType: 'text',
  },
  {
    key: 'heading',
    label: 'Tiêu đề',
    groupId: 'content',
    icon: Type,
    fieldType: 'text',
  },
  {
    key: 'description',
    label: 'Mô tả',
    groupId: 'content',
    icon: Pilcrow,
    fieldType: 'textarea',
  },
  {
    key: 'ctaText',
    label: 'Nút',
    groupId: 'cta',
    groupLabel: 'CTA',
    icon: MousePointerClick,
    fieldType: 'text',
  },
  {
    key: 'ctaLink',
    label: 'Link',
    groupId: 'cta',
    icon: Link,
    fieldType: 'text',
  },
];

const VI: AlturaOlympusContent = {
  eyebrow: 'Gallery',
  heading: 'Take a closer look',
  description:
    'Thoughtfully composed to be seen, felt, and remembered in its own way',
  features: ALTURA_OLYMPUS_DEFAULT_FEATURES.map(f => ({ ...f })),
  ctaText: 'Discover',
  ctaLink: '#',
  images: [...ALTURA_OLYMPUS_DEFAULT_IMAGES],
};

const EN: AlturaOlympusContent = {
  ...VI,
  images: [...ALTURA_OLYMPUS_DEFAULT_IMAGES],
};

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
      'scroll split 50/50: ảnh trái đè ảnh phải → thoát → content trái + ảnh phải scrub động',
    aiLabelEn:
      '50/50 scroll split: left image overlays right → exits → left content + right image scrub sequence',
  },
  component: AlturaOlympus,
  defaultContent: { vi: VI, en: EN },
  elements: [
    ...CONTENT_ELEMENTS,
    ...alturaOlympusImageElements(ALTURA_OLYMPUS_DEFAULT_IMAGES),
    {
      key: 'images',
      label: 'Thêm / quản lý ảnh',
      icon: ListChecks,
    },
    ...alturaOlympusFeatureElements(ALTURA_OLYMPUS_DEFAULT_FEATURES),
    {
      key: 'features',
      label: 'Thêm / quản lý features',
      icon: ListChecks,
    },
  ],
};

/** Static content layers — dùng lại trong LayersPanel expand. */
export const alturaOlympusContentElements = CONTENT_ELEMENTS;
