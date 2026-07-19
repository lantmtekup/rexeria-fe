/**
 * BlockDef cho `real_estate_info` — port section Framer `1.1 Intro` của
 * template real-estate-1: icon trang trí + tiêu đề + mô tả canh giữa.
 * Component: `blocks/RealEstateInfo.tsx`. Path A.
 *
 * Default VI lấy nguyên văn từ `apps/real-estate-1/lib/blocks/Info.tsx`
 * (DEFAULT_CONTENT). Asset là bản copy nội bộ trong `public/real-estate/` —
 * KHÔNG trỏ về CDN Framer gốc: PORTING.md ghi rõ một lần republish là nguồn
 * đổi thầm lặng.
 *
 * `intro-sunburst.svg` là hằng ICON_SVG của bản apps đã strip `<defs>` +
 * `clip-path` (rect 60x60 trùng đúng viewBox nên là no-op). Nhờ vậy file không
 * còn `id` nào — thả 2 block Info lên cùng một trang không đụng nhau nữa.
 */
import { Image as ImageIcon, Pilcrow, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { RealEstateInfoContent } from '../../../types';
import type { BlockDef } from '../types';

const ICON = '/real-estate/intro-sunburst.svg';

const VI: RealEstateInfoContent = {
  iconUrl: ICON,
  title: 'Real Estates',
  description:
    'Dự án đầu tư xây dựng mới khu nhà ở thấp tầng, tạo nên một khu dân cư có hệ thống hạ tầng kỹ thuật, xã hội đồng bộ và các công trình nhà ở với kiến trúc hiện đại.',
};

const EN: RealEstateInfoContent = {
  iconUrl: ICON,
  title: 'Real Estates',
  description:
    'A new low-rise residential development, forming a neighbourhood with complete technical and social infrastructure alongside homes of contemporary architecture.',
};

export const realEstateInfoDef: BlockDef<RealEstateInfoContent> = {
  type: 'real_estate_info',
  meta: {
    type: 'real_estate_info',
    label: 'Real Estate - Giới thiệu',
    accent: '#009336',
    adminLabel: 'Real Estate - Giới thiệu',
    gradient: 'from-amber-50 to-emerald-700',
    defaultName: 'Real Estate - Giới thiệu',
    aiLabelVi:
      'section giới thiệu ngắn: icon trang trí + tiêu đề + đoạn mô tả canh giữa; ba khối fade-up lần lượt khi cuộn tới',
    aiLabelEn:
      'short intro section: decorative icon above a centred title and description; the three blocks fade up in sequence on scroll',
  },
  // dynamic để webpack tách chunk per-block (audit FE 2026-07-04 P1).
  component: dynamic(() =>
    import('../../RealEstateInfo').then(m => m.RealEstateInfo)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'iconUrl', label: 'Icon', icon: ImageIcon, fieldType: 'image' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    {
      key: 'description',
      label: 'Mô tả',
      icon: Pilcrow,
      fieldType: 'textarea',
    },
  ],
};
