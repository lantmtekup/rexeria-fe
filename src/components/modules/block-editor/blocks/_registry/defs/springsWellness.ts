/**
 * BlockDef cho `springs_wellness` — section "Wellness" của
 * springs-estate-clone: heading serif "Wellness", mô tả ngắn, và dải ảnh
 * lifestyle (spa/nước/cây xanh) cuộn ngang trên nền gradient wash xanh
 * rêu/teal (thay canvas WebGL gốc). Component: `blocks/SpringsWellness.tsx`.
 * Path A.
 *
 * Copy + ảnh mặc định lấy từ bản gốc (heading "Wellness", đoạn mô tả trong
 * `.l-wellness__webgl-caption`, 4 ảnh `wellness-slider-md-1..4`).
 */
import { Image as ImageIcon, Pilcrow, Type } from 'lucide-react';

import { SpringsWellness } from '../../SpringsWellness';
import type { SpringsWellnessContent } from '../../../types';
import type { BlockDef } from '../types';

const WELLNESS_IMAGES = [1, 2, 3, 4].map(
  n =>
    `https://springs.estate/media/cache/homepage_wellness_slider_xxl/assets/images/media/landing/2.wellness/wellness-slider-md-${n}@xxxl.webp`
);

const VI: SpringsWellnessContent = {
  tagline: 'Tinh hoa của sự chăm sóc bản thân',
  heading: 'Wellness',
  description:
    'Springs mang sự chăm sóc bản thân về ngay trong ngôi nhà của bạn. Với hạ tầng thư giãn được thiết kế chu đáo, không gian này giúp bạn tái tạo năng lượng cho cả cơ thể lẫn tâm trí, để lại cảm giác tươi mới và cân bằng trọn vẹn.',
  images: WELLNESS_IMAGES,
};

const EN: SpringsWellnessContent = {
  tagline: 'Essence of Self-Care',
  heading: 'Wellness',
  description:
    'Springs brings wellness right into your home. With a thoughtfully designed infrastructure for relaxation, it rejuvenates your body and mind, leaving you refreshed and perfectly balanced.',
  images: WELLNESS_IMAGES,
};

export const springsWellnessDef: BlockDef<SpringsWellnessContent> = {
  type: 'springs_wellness',
  meta: {
    type: 'springs_wellness',
    label: 'Springs - Wellness',
    accent: '#2d8c85',
    adminLabel: 'Springs - Wellness',
    gradient: 'from-emerald-900 to-teal-950',
    defaultName: 'Springs - Wellness',
    aiLabelVi:
      'section wellness: eyebrow + heading serif canh phải, dải ảnh spa/thư giãn với clip-path reveal riêng từng ảnh, nền gradient xanh rêu/teal',
    aiLabelEn:
      'wellness section: right-aligned eyebrow + serif heading, spa/lifestyle image strip with per-image clip-path reveal, green/teal gradient wash',
  },
  component: SpringsWellness,
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'tagline',
      label: 'Dòng nhỏ (eyebrow)',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'heading',
      label: 'Tiêu đề',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'description',
      label: 'Mô tả',
      icon: Pilcrow,
      fieldType: 'textarea',
    },
    {
      key: 'images',
      label: 'Dải ảnh (không sửa từng ảnh)',
      icon: ImageIcon,
    },
  ],
};
