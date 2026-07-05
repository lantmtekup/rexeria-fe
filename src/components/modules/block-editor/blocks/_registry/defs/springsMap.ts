/**
 * BlockDef cho `springs_map` — bản rút gọn tĩnh của section `.l-map`
 * (`#l-map-sticky`) springs-estate-clone: ảnh bản đồ vị trí dự án full-bleed
 * + heading/description overlay + icon "scroll" nhỏ. Không sticky-scroll
 * parallax phức tạp như bản gốc. Component: `blocks/SpringsMap.tsx`.
 *
 * Ảnh dùng đúng asset gốc (`5.map/map-eng@xxl.webp` — bản có label tiếng Anh,
 * bản `map-bg@xxl.webp` là lớp nền không chữ) tại origin `springs.estate`.
 */
import { Image as ImageIcon, Pilcrow, Type } from 'lucide-react';

import { SpringsMap } from '../../SpringsMap';
import type { SpringsMapContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: SpringsMapContent = {
  heading: 'Dễ dàng đến Công viên Thiên nhiên.',
  description:
    'Những khung cảnh dịu dàng như tranh màu nước, chỉ thuộc về riêng bạn.',
  mapImage:
    'https://springs.estate/assets/images/media/landing/5.map/map-eng@xxl.webp',
};

const EN: SpringsMapContent = {
  heading: 'Easy access to Nature Park.',
  description: 'Landscapes of watercolor tenderness that belong only to you.',
  mapImage:
    'https://springs.estate/assets/images/media/landing/5.map/map-eng@xxl.webp',
};

export const springsMapDef: BlockDef<SpringsMapContent> = {
  type: 'springs_map',
  meta: {
    type: 'springs_map',
    label: 'Springs - Map',
    accent: '#173620',
    adminLabel: 'Springs - Map',
    gradient: 'from-emerald-950 to-emerald-700',
    defaultName: 'Springs - Map',
    aiLabelVi: 'bản đồ vị trí dự án + caption',
    aiLabelEn: 'project location map + caption',
  },
  component: SpringsMap,
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'mapImage',
      label: 'Ảnh bản đồ',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'heading',
      label: 'Tiêu đề',
      icon: Type,
      fieldType: 'textarea',
    },
    {
      key: 'description',
      label: 'Mô tả',
      icon: Pilcrow,
      fieldType: 'textarea',
    },
  ],
};
