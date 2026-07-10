/**
 * BlockDef cho `scroll_mattis` — scroll reveal "Box Mode" 3 slide (ảnh, video,
 * ảnh). Media + chữ marquee (bgWord) + meta (title/categories/year) đều editable.
 * Default slide1/slide3 (ảnh tĩnh) trỏ URL S3 (uploaded 2026-07-10) thay vì
 * asset local — src/assets/images/scroll_mattis/*.{jpg,webp} vẫn giữ làm
 * fallback cuối cùng trong ScrollMattis.tsx cho block cũ chưa có field.
 * Slide2 (video) giữ nguyên URL ngoài (framerusercontent.com) — không thuộc
 * phạm vi migrate.
 */
import { Image as ImageIcon, Type } from 'lucide-react';

import { SCROLL_MATTIS_ITEMS } from '@/assets/images/scroll_mattis';

import { ScrollMattis } from '../../ScrollMattis';
import type { ScrollMattisContent } from '../../../types';
import type { BlockDef } from '../types';

const SLIDE1_S3_URL =
  'https://d10zufojjcedud.cloudfront.net/uploads/4d265660-8757-4da1-875d-29b776737f57/scroll_mattis_m1.jpg';
const SLIDE3_S3_URL =
  'https://d10zufojjcedud.cloudfront.net/uploads/05f6ad58-40dc-4c33-8ee2-5b199402fa0d/scroll_mattis_m2.webp';

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
  slide1Url: SLIDE1_S3_URL,
  slide3Url: SLIDE3_S3_URL,
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
      label: 'media',
      groupId: 'slide1',
      groupLabel: 'Slide 1',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'slide1BgWord',
      label: 'chữ chạy',
      groupId: 'slide1',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide1Title',
      label: 'title',
      groupId: 'slide1',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide1Category1',
      label: 'category 1',
      groupId: 'slide1',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide1Category2',
      label: 'category 2',
      groupId: 'slide1',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide1Year',
      label: 'năm',
      groupId: 'slide1',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide2Url',
      label: 'media',
      groupId: 'slide2',
      groupLabel: 'Slide 2',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'slide2BgWord',
      label: 'chữ chạy',
      groupId: 'slide2',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide2Title',
      label: 'title',
      groupId: 'slide2',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide2Category1',
      label: 'category 1',
      groupId: 'slide2',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide2Category2',
      label: 'category 2',
      groupId: 'slide2',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide2Year',
      label: 'năm',
      groupId: 'slide2',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide3Url',
      label: 'media',
      groupId: 'slide3',
      groupLabel: 'Slide 3',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'slide3BgWord',
      label: 'chữ chạy',
      groupId: 'slide3',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide3Title',
      label: 'title',
      groupId: 'slide3',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide3Category1',
      label: 'category 1',
      groupId: 'slide3',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide3Category2',
      label: 'category 2',
      groupId: 'slide3',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'slide3Year',
      label: 'năm',
      groupId: 'slide3',
      icon: Type,
      fieldType: 'text',
    },
  ],
};
