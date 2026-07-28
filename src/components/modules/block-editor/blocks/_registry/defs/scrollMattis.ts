/**
 * BlockDef cho `scroll_mattis` — scroll reveal "Box Mode" (ảnh / video).
 * Media + chữ marquee (bgWord) + meta (title/categories/year) đều editable.
 * `slides[]` = preferred (thêm/xoá). Flat slide1/2/3 = legacy fallback.
 * Default ảnh tĩnh trỏ URL S3; video slide giữ framerusercontent.
 */
import { Image as ImageIcon, ListChecks, Type } from 'lucide-react';

import { SCROLL_MATTIS_ITEMS } from '@/assets/images/scroll_mattis';

import { ScrollMattis } from '../../ScrollMattis';
import type { LayerElement } from '../../../LayersPanel';
import type {
  ScrollMattisContent,
  ScrollMattisSlideItem,
} from '../../../types';
import type { BlockDef } from '../types';

const SLIDE1_S3_URL =
  'https://d10zufojjcedud.cloudfront.net/uploads/4d265660-8757-4da1-875d-29b776737f57/scroll_mattis_m1.jpg';
const SLIDE3_S3_URL =
  'https://d10zufojjcedud.cloudfront.net/uploads/05f6ad58-40dc-4c33-8ee2-5b199402fa0d/scroll_mattis_m2.webp';

const DEFAULT_SLIDES: ScrollMattisSlideItem[] = [
  {
    url: SLIDE1_S3_URL,
    bgWord: SCROLL_MATTIS_ITEMS[0].bgWord,
    title: SCROLL_MATTIS_ITEMS[0].title,
    category1: SCROLL_MATTIS_ITEMS[0].categories[0],
    category2: SCROLL_MATTIS_ITEMS[0].categories[1],
    year: SCROLL_MATTIS_ITEMS[0].year,
  },
  {
    url: SCROLL_MATTIS_ITEMS[1].src,
    bgWord: SCROLL_MATTIS_ITEMS[1].bgWord,
    title: SCROLL_MATTIS_ITEMS[1].title,
    category1: SCROLL_MATTIS_ITEMS[1].categories[0],
    category2: SCROLL_MATTIS_ITEMS[1].categories[1],
    year: SCROLL_MATTIS_ITEMS[1].year,
  },
  {
    url: SLIDE3_S3_URL,
    bgWord: SCROLL_MATTIS_ITEMS[2].bgWord,
    title: SCROLL_MATTIS_ITEMS[2].title,
    category1: SCROLL_MATTIS_ITEMS[2].categories[0],
    category2: SCROLL_MATTIS_ITEMS[2].categories[1],
    year: SCROLL_MATTIS_ITEMS[2].year,
  },
];

/** Flat legacy keys → slide item (khi content cũ chưa có slides[]). */
const legacySlide = (
  content: ScrollMattisContent,
  i: 0 | 1 | 2
): ScrollMattisSlideItem => {
  const base = SCROLL_MATTIS_ITEMS[i];
  const pick = (v?: string) => v?.trim() || '';
  if (i === 0) {
    return {
      url: pick(content.slide1Url) || base.src,
      bgWord: pick(content.slide1BgWord) || base.bgWord,
      title: pick(content.slide1Title) || base.title,
      category1: pick(content.slide1Category1) || base.categories[0],
      category2: pick(content.slide1Category2) || base.categories[1],
      year: pick(content.slide1Year) || base.year,
    };
  }
  if (i === 1) {
    return {
      url: pick(content.slide2Url) || base.src,
      bgWord: pick(content.slide2BgWord) || base.bgWord,
      title: pick(content.slide2Title) || base.title,
      category1: pick(content.slide2Category1) || base.categories[0],
      category2: pick(content.slide2Category2) || base.categories[1],
      year: pick(content.slide2Year) || base.year,
    };
  }
  return {
    url: pick(content.slide3Url) || base.src,
    bgWord: pick(content.slide3BgWord) || base.bgWord,
    title: pick(content.slide3Title) || base.title,
    category1: pick(content.slide3Category1) || base.categories[0],
    category2: pick(content.slide3Category2) || base.categories[1],
    year: pick(content.slide3Year) || base.year,
  };
};

/** Resolve slides[] (preferred) hoặc flat slide1/2/3 (legacy). */
export const resolveScrollMattisSlides = (
  content: ScrollMattisContent
): ScrollMattisSlideItem[] => {
  const raw = content.slides;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.filter(
      s => s && typeof s === 'object' && typeof s.url === 'string'
    );
  }
  return [
    legacySlide(content, 0),
    legacySlide(content, 1),
    legacySlide(content, 2),
  ];
};

export const scrollMattisSlideElements = (
  slides: ScrollMattisSlideItem[]
): LayerElement[] =>
  slides.flatMap((s, i) => {
    const groupId = `slide${i}`;
    const groupLabel = s.title?.trim() || `Slide ${i + 1}`;
    return [
      {
        key: `slides[${i}].url`,
        label: 'media',
        groupId,
        groupLabel,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `slides[${i}].bgWord`,
        label: 'chữ chạy',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `slides[${i}].title`,
        label: 'title',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `slides[${i}].category1`,
        label: 'category 1',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `slides[${i}].category2`,
        label: 'category 2',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `slides[${i}].year`,
        label: 'năm',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
    ];
  });

/** Legacy flat slide1/2/3 — Layers khi content chưa migrate sang slides[]. */
export const SCROLL_MATTIS_LEGACY_ELEMENTS: LayerElement[] = [0, 1, 2].flatMap(
  i => {
    const n = i + 1;
    const groupId = `slide${n}`;
    return [
      {
        key: `slide${n}Url`,
        label: 'media',
        groupId,
        groupLabel: `Slide ${n}`,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `slide${n}BgWord`,
        label: 'chữ chạy',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `slide${n}Title`,
        label: 'title',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `slide${n}Category1`,
        label: 'category 1',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `slide${n}Category2`,
        label: 'category 2',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `slide${n}Year`,
        label: 'năm',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
    ];
  }
);
const VI: ScrollMattisContent = {
  portfolioLabel: 'PORTFOLIO',
  slides: DEFAULT_SLIDES,
};

const EN: ScrollMattisContent = { ...VI, slides: [...DEFAULT_SLIDES] };

export const scrollMattisDef: BlockDef<ScrollMattisContent> = {
  type: 'scroll_mattis',
  meta: {
    type: 'scroll_mattis',
    label: 'Scroll - Mattis',
    accent: '#171717',
    adminLabel: 'Scroll - Mattis',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Scroll - Mattis',
    aiLabelVi:
      'scroll reveal N slide (ảnh/video): slide active thu nhỏ + mờ, slide kế zoom in theo cuộn',
    aiLabelEn:
      'scroll reveal with N slides (image/video): active slide shrinks and fades while the next zooms in',
  },
  component: ScrollMattis,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'portfolioLabel', label: 'Nhãn góc', icon: Type, fieldType: 'text' },
    ...scrollMattisSlideElements(DEFAULT_SLIDES),
    {
      key: 'slides',
      label: 'Thêm / quản lý slide',
      icon: ListChecks,
    },
  ],
};
