/**
 * BlockDef cho `scroll_mattis` — scroll reveal "Box Mode" 3 slide (ảnh, video,
 * ảnh). Media + chữ marquee (bgWord) + meta (title/categories/year) đều editable.
 */
import { Image as ImageIcon, Type } from 'lucide-react';

import { SCROLL_MATTIS_ITEMS } from '@/assets/images/scroll_mattis';

import { ScrollMattis } from '../../ScrollMattis';
import type { ScrollMattisContent } from '../../../types';
import type { BlockDef } from '../types';

const slideDefaults = (i: 0 | 1 | 2) => {
  const s = SCROLL_MATTIS_ITEMS[i];
  const n = (i + 1) as 1 | 2 | 3;
  return {
    [`slide${n}Url`]: s.src,
    [`slide${n}BgWord`]: s.bgWord,
    [`slide${n}Title`]: s.title,
    [`slide${n}Category1`]: s.categories[0],
    [`slide${n}Category2`]: s.categories[1],
    [`slide${n}Year`]: s.year,
  } as Pick<
    ScrollMattisContent,
    | 'slide1Url'
    | 'slide2Url'
    | 'slide3Url'
    | 'slide1BgWord'
    | 'slide2BgWord'
    | 'slide3BgWord'
    | 'slide1Title'
    | 'slide2Title'
    | 'slide3Title'
    | 'slide1Category1'
    | 'slide1Category2'
    | 'slide2Category1'
    | 'slide2Category2'
    | 'slide3Category1'
    | 'slide3Category2'
    | 'slide1Year'
    | 'slide2Year'
    | 'slide3Year'
  >;
};

const VI: ScrollMattisContent = {
  portfolioLabel: 'PORTFOLIO',
  ...slideDefaults(0),
  ...slideDefaults(1),
  ...slideDefaults(2),
};
const EN: ScrollMattisContent = { ...VI };

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
      'scroll reveal 3 slide (ảnh, video, ảnh): slide active thu nhỏ + mờ, slide kế zoom in thay thế theo cuộn',
    aiLabelEn:
      'scroll reveal with 3 slides (image, video, image): active slide shrinks and fades while the next zooms in',
  },
  component: ScrollMattis,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'portfolioLabel', label: 'Nhãn góc', icon: Type, fieldType: 'text' },
    {
      key: 'slide1Url',
      label: 'Slide 1 — media',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'slide1BgWord',
      label: 'Slide 1 — chữ chạy',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide1Title',
      label: 'Slide 1 — title',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide1Category1',
      label: 'Slide 1 — category 1',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide1Category2',
      label: 'Slide 1 — category 2',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide1Year',
      label: 'Slide 1 — năm',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide2Url',
      label: 'Slide 2 — media',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'slide2BgWord',
      label: 'Slide 2 — chữ chạy',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide2Title',
      label: 'Slide 2 — title',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide2Category1',
      label: 'Slide 2 — category 1',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide2Category2',
      label: 'Slide 2 — category 2',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide2Year',
      label: 'Slide 2 — năm',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide3Url',
      label: 'Slide 3 — media',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'slide3BgWord',
      label: 'Slide 3 — chữ chạy',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide3Title',
      label: 'Slide 3 — title',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide3Category1',
      label: 'Slide 3 — category 1',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide3Category2',
      label: 'Slide 3 — category 2',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide3Year',
      label: 'Slide 3 — năm',
      icon: Type,
      fieldType: 'text',
    },
  ],
};
