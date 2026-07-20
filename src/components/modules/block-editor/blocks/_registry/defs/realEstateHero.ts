/**
 * BlockDef cho `real_estate_hero` — port section Framer `1. Banner` của template
 * real-estate-1: ảnh full-bleed trôi parallax, gradient đen từ đáy, ba cặp
 * thông số canh giữa sát đáy. Component: `blocks/RealEstateHero.tsx`. Path A.
 *
 * Default VI lấy nguyên văn từ `apps/real-estate-1/lib/blocks/Hero.tsx`
 * (DEFAULT_CONTENT). Asset là bản copy nội bộ trong `public/real-estate/` —
 * KHÔNG trỏ về CDN Framer gốc: PORTING.md ghi rõ một lần republish là nguồn
 * đổi thầm lặng.
 */
import { Image as ImageIcon, ListChecks, Tag, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type { RealEstateHeroContent, RealEstateHeroStat } from '../../../types';
import type { BlockDef } from '../types';

const VI_STATS: RealEstateHeroStat[] = [
  { label: 'VỊ TRÍ', value: 'ĐẮC ĐỊA' },
  { label: 'KIẾN TRÚC', value: 'CHÂU ÂU' },
  { label: 'PHÁP LÝ', value: 'SỔ HỒNG' },
];

const EN_STATS: RealEstateHeroStat[] = [
  { label: 'LOCATION', value: 'PRIME' },
  { label: 'ARCHITECTURE', value: 'EUROPEAN' },
  { label: 'OWNERSHIP', value: 'FREEHOLD' },
];

const IMAGE = '/real-estate/UpyeUjJrwggTUEjg6PVgsF8vps.jpg';

const VI: RealEstateHeroContent = { imageUrl: IMAGE, stats: VI_STATS };
const EN: RealEstateHeroContent = { imageUrl: IMAGE, stats: EN_STATS };

/**
 * Layers folders — 1 group / cặp thông số. Dùng chung giữa BlockDef (default 3
 * cặp) và `LayersPanel.elementsForType` (số cặp thật trong content, vì user
 * thêm/xoá được qua list manager `stats`).
 *
 * Fallback về VI_STATS khi mảng rỗng để panel Lớp không trống trơn.
 */
export const realEstateHeroStatElements = (
  stats: RealEstateHeroStat[]
): LayerElement[] => {
  const list = stats.length > 0 ? stats : VI_STATS;
  return list.flatMap((stat, i) => {
    const groupId = `stat${i}`;
    const groupLabel = stat.value?.trim() || `Thông số ${i + 1}`;
    return [
      {
        key: `stats[${i}].label`,
        label: 'Nhãn (dòng trên)',
        groupId,
        groupLabel,
        icon: Tag,
        fieldType: 'text' as const,
      },
      {
        key: `stats[${i}].value`,
        label: 'Giá trị (dòng dưới)',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
    ];
  });
};

export const realEstateHeroDef: BlockDef<RealEstateHeroContent> = {
  type: 'real_estate_hero',
  meta: {
    type: 'real_estate_hero',
    label: 'Real Estate - Banner',
    accent: '#009336',
    adminLabel: 'Real Estate - Banner',
    gradient: 'from-amber-50 to-emerald-700',
    defaultName: 'Real Estate - Banner',
    aiLabelVi:
      'banner mở đầu: ảnh full-bleed trôi parallax nhẹ khi cuộn, phủ gradient đen từ đáy, ba cặp thông số (nhãn + giá trị) canh giữa sát đáy',
    aiLabelEn:
      'opening banner: full-bleed image drifting with subtle scroll parallax, black bottom gradient scrim, three centred label/value stat pairs near the bottom',
  },
  // dynamic để webpack tách chunk per-block (audit FE 2026-07-04 P1).
  component: dynamic(() =>
    import('../../RealEstateHero').then(m => m.RealEstateHero)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'imageUrl',
      label: 'Ảnh banner',
      icon: ImageIcon,
      fieldType: 'image',
    },
    ...realEstateHeroStatElements(VI_STATS),
    // KHÔNG đặt fieldType: để trống thì resolveKind trả kind 'stats' → dùng lại
    // StatsControls sẵn có (hero_split), vốn generic trên {value,label}[].
    { key: 'stats', label: 'Thêm / quản lý thông số', icon: ListChecks },
  ],
};
