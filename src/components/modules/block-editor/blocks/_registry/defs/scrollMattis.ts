/**
 * BlockDef cho `scroll_mattis` — scroll reveal "Box Mode" 3 slide (ảnh, video,
 * ảnh). Slide active thu nhỏ + mờ, slide kế zoom in thay thế theo scroll.
 * Default 2 ảnh tĩnh trỏ URL S3 (uploaded 2026-07-10) thay vì asset local —
 * src/assets/images/scroll_mattis/*.{jpg,webp} vẫn giữ làm fallback cuối
 * cùng trong ScrollMattis.tsx cho block cũ chưa có field. Slide video giữ
 * nguyên URL ngoài (framerusercontent.com), không thuộc phạm vi migrate.
 */
import { ImageIcon, Type } from 'lucide-react';

import { ScrollMattis } from '../../ScrollMattis';
import type { ScrollMattisContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: ScrollMattisContent = {
  portfolioLabel: 'PORTFOLIO',
  slide1ImageUrl:
    'https://d10zufojjcedud.cloudfront.net/uploads/4d265660-8757-4da1-875d-29b776737f57/scroll_mattis_m1.jpg',
  slide3ImageUrl:
    'https://d10zufojjcedud.cloudfront.net/uploads/05f6ad58-40dc-4c33-8ee2-5b199402fa0d/scroll_mattis_m2.webp',
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
    {
      key: 'slide1ImageUrl',
      label: 'Ảnh slide 1',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'slide3ImageUrl',
      label: 'Ảnh slide 3',
      icon: ImageIcon,
      fieldType: 'image',
    },
    { key: 'portfolioLabel', label: 'Nhãn góc', icon: Type, fieldType: 'text' },
  ],
};
