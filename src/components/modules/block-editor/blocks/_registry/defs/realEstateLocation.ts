/**
 * BlockDef cho `real_estate_location` — port section Framer `3. Vị trí` +
 * `4. MaP` của template real-estate-1: eyebrow + tiêu đề + mô tả canh giữa,
 * dưới là video bản đồ full-bleed chạy loop. Component:
 * `blocks/RealEstateLocation.tsx`. Path A.
 *
 * Default VI lấy nguyên văn từ `apps/real-estate-1/lib/blocks/Location.tsx`
 * (DEFAULT_CONTENT). Asset là bản copy nội bộ trong `public/real-estate/` —
 * KHÔNG trỏ về CDN Framer gốc: PORTING.md ghi rõ một lần republish là nguồn
 * đổi thầm lặng.
 */
import { Film, Pilcrow, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { RealEstateLocationContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: RealEstateLocationContent = {
  eyebrow: 'VỊ TRÍ DỰ ÁN',
  title: 'Tọa độ chiến lược, tâm điểm kết nối',
  description:
    'Real Estates tọa lạc tại trái tim của sự phồn thịnh, nơi kết nối hiện đại và tiện ích hoàn hảo, sở hữu tiềm năng tịnh tiến giá trị theo thời gian hứa hẹn một cuộc sống đẳng cấp và tinh tế.',
  videoUrl: '/real-estate/t7e50y2uccMDXeGAEB79F8fx5s.mp4',
};

const EN: RealEstateLocationContent = {
  eyebrow: 'PROJECT LOCATION',
  title: 'A strategic address at the heart of every connection',
  description:
    'Real Estates sits at the heart of a thriving district, where modern connectivity meets complete amenities — an address built to appreciate over time and to hold a life of quiet refinement.',
  videoUrl: '/real-estate/t7e50y2uccMDXeGAEB79F8fx5s.mp4',
};

export const realEstateLocationDef: BlockDef<RealEstateLocationContent> = {
  type: 'real_estate_location',
  meta: {
    type: 'real_estate_location',
    label: 'Real Estate - Vị trí & Bản đồ',
    accent: '#009336',
    adminLabel: 'Real Estate - Vị trí & Bản đồ',
    gradient: 'from-amber-50 to-emerald-700',
    defaultName: 'Real Estate - Vị trí & Bản đồ',
    aiLabelVi:
      'section vị trí: eyebrow + tiêu đề + mô tả canh giữa, dưới là video bản đồ full-bleed chạy loop; chữ fade-up lần lượt khi cuộn tới',
    aiLabelEn:
      'location section: centered eyebrow + title + description above a full-bleed looping map video; text fades up in sequence on scroll',
  },
  // dynamic để webpack tách chunk per-block (audit FE 2026-07-04 P1).
  component: dynamic(() =>
    import('../../RealEstateLocation').then(m => m.RealEstateLocation)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Type, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'textarea' },
    {
      key: 'description',
      label: 'Mô tả',
      icon: Pilcrow,
      fieldType: 'textarea',
    },
    // fieldType 'text' vì LayerElement chỉ có text | textarea | image — chưa có
    // video picker. Cùng quy ước `delvaux_hero.videoUrl`.
    {
      key: 'videoUrl',
      label: 'Video bản đồ (URL mp4)',
      icon: Film,
      fieldType: 'text',
    },
  ],
};
