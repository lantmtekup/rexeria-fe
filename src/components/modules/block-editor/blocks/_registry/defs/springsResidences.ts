/**
 * BlockDef cho `springs_residences` — gallery "Residences" của
 * springs-estate-clone (section `.l-residences`, dòng 5717-6604 index.html):
 * heading + mô tả ngắn + slideshow pin 3 nhịp (ảnh + caption loại căn hộ,
 * gốc `.l-residences__caption__type`: "Flats" / "Townhouses" / "Penthouses").
 * Component: `blocks/SpringsResidences.tsx`.
 */
import { Heading, Pilcrow } from 'lucide-react';

import { SpringsResidences } from '../../SpringsResidences';
import type { SpringsResidencesContent } from '../../../types';
import type { BlockDef } from '../types';

/** Ảnh render toà nhà residence gốc (`assets/images/media/landing/7.residence`,
 *  qua cache preset `homepage_residences_slider_xxl` — bản @xxxl chất lượng cao
 *  nhất mà preset này phục vụ). */
const RESIDENCE_IMAGES = [
  'https://springs.estate/media/cache/homepage_residences_slider_xxl/assets/images/media/landing/7.residence/residence-1@xxxl.webp',
  'https://springs.estate/media/cache/homepage_residences_slider_xxl/assets/images/media/landing/7.residence/residence-2@xxxl.webp',
  'https://springs.estate/media/cache/homepage_residences_slider_xxl/assets/images/media/landing/7.residence/residence-3@xxxl.webp',
];

const VI: SpringsResidencesContent = {
  heading: 'Residences',
  description:
    'Căn hộ, nhà phố sân vườn và penthouse duplex trong một khu dân cư yên tĩnh, phủ đầy màu xanh.',
  images: RESIDENCE_IMAGES,
  captions: ['Căn hộ', 'Nhà phố liền kề', 'Penthouse'],
};

const EN: SpringsResidencesContent = {
  heading: 'Residences',
  description:
    'Apartments, terraced townhouses, and duplex penthouses in a quiet, green neighborhood.',
  images: RESIDENCE_IMAGES,
  captions: ['Flats', 'Townhouses', 'Penthouses'],
};

export const springsResidencesDef: BlockDef<SpringsResidencesContent> = {
  type: 'springs_residences',
  meta: {
    type: 'springs_residences',
    label: 'Springs - Residences',
    accent: '#173620',
    adminLabel: 'Springs - Residences',
    gradient: 'from-stone-700 to-stone-400',
    defaultName: 'Springs - Residences',
    aiLabelVi:
      'sticky pin slideshow 3 nhịp: ảnh phối cảnh crossfade + caption loại căn hộ + progress bar',
    aiLabelEn:
      'sticky pin 3-beat slideshow: crossfading render images + unit-type caption + progress bar',
  },
  component: SpringsResidences,
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'heading',
      label: 'Tiêu đề',
      icon: Heading,
      fieldType: 'text',
    },
    {
      key: 'description',
      label: 'Mô tả',
      icon: Pilcrow,
      fieldType: 'textarea',
    },
    // `images` KHÔNG có entry ở đây: đây là content data (mảng URL render
    // toà nhà), không phải 1 element chọn được riêng trên canvas — khớp với
    // việc component không gắn `data-element-key='images'` cho dải ảnh.
  ],
};
