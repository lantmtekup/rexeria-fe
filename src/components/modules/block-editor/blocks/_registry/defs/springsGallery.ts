/**
 * BlockDef cho `springs_gallery` — port section `#l-gallery-sticky` gốc của
 * springs-estate-clone: preloader fade + pin 200vh 2 cột ảnh xoay chéo
 * crossfade tuần tự, đứng ngay sau Header, trước Hero. Component:
 * `blocks/SpringsGallery.tsx`. Path A.
 *
 * Ảnh dùng LIVE origin springs.estate (thư mục gốc `0.preloader/`, chưa tải
 * về repo — theo đúng convention `SpringsInteriors`/`SpringsResidences` khi
 * asset chưa self-host local).
 */
import { Image as ImageIcon } from 'lucide-react';

import { SpringsGallery } from '../../SpringsGallery';
import type { SpringsGalleryContent } from '../../../types';
import type { BlockDef } from '../types';

const BASE = 'https://springs.estate/assets/images/media/landing/0.preloader';

const GALLERY_IMAGES = [
  `${BASE}/preloader-left-1@xxl.webp`,
  `${BASE}/preloader-left-2@xxl.webp`,
  `${BASE}/preloader-left-3@xxl.webp`,
  `${BASE}/preloader-right-1@xxl.webp`,
  `${BASE}/preloader-right-2@xxl.webp`,
  `${BASE}/preloader-right-3@xxl.webp`,
];

const VI: SpringsGalleryContent = {
  images: GALLERY_IMAGES,
};

const EN: SpringsGalleryContent = {
  images: GALLERY_IMAGES,
};

export const springsGalleryDef: BlockDef<SpringsGalleryContent> = {
  type: 'springs_gallery',
  meta: {
    type: 'springs_gallery',
    label: 'Springs - Gallery Intro',
    accent: '#173620',
    adminLabel: 'Springs - Gallery Intro',
    gradient: 'from-emerald-950 to-emerald-800',
    defaultName: 'Springs - Gallery Intro',
    aiLabelVi:
      'intro gallery pin 200vh: preloader fade + 2 cột ảnh xoay chéo crossfade tuần tự trước khi vào Hero',
    aiLabelEn:
      'pinned 200vh intro gallery: preloader fade + 2 diagonally-rotated columns crossfading images before the Hero',
  },
  component: SpringsGallery,
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'images',
      label: 'Dải ảnh (2 cột x 3, không sửa từng ảnh)',
      icon: ImageIcon,
    },
  ],
};
