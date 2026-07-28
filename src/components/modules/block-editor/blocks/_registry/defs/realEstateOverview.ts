/**
 * BlockDef cho `real_estate_overview` — port section Framer `5. Tổng quan dự án`
 * của template real-estate-1: tiêu đề 2 dòng canh giữa, dưới là lưới 2 cột × 3
 * hàng gồm 6 icon tròn, mỗi icon kèm một dòng thông số.
 * Component: `blocks/RealEstateOverview.tsx`. Path A.
 *
 * Default VI lấy nguyên văn từ `apps/real-estate-1/lib/blocks/Overview.tsx`
 * (DEFAULT_CONTENT), ghép thêm `iconUrl`. Asset là bản copy nội bộ trong
 * `public/real-estate/` — KHÔNG trỏ về CDN Framer gốc: PORTING.md ghi rõ một
 * lần republish là nguồn đổi thầm lặng.
 *
 * KHÔNG có mục list manager kiểu `realEstateHero` (`{ key: 'stats' }` → tái
 * dùng `StatsControls`): control đó generic trên `{value,label}[]`, không khớp
 * `{iconUrl,text}`. Số hạng mục cố định 6 như nguồn.
 */
import { Image as ImageIcon, Pilcrow, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  RealEstateOverviewContent,
  RealEstateOverviewStat,
} from '../../../types';
import type { BlockDef } from '../types';

const ICON = (name: string) => `/real-estate/overview-${name}.svg`;

const VI_STATS: RealEstateOverviewStat[] = [
  { iconUrl: ICON('scale'), text: 'QUY MÔ\nDỰ ÁN 7,2 HA' },
  { iconUrl: ICON('townhouse'), text: '240 CĂN\nNHÀ PHỐ LIỀN KỀ' },
  { iconUrl: ICON('duplex'), text: '83 CĂN BIỆT THỰ\nSONG LẬP' },
  { iconUrl: ICON('villa'), text: '10 CĂN BIỆT THỰ\nĐƠN LẬP' },
  { iconUrl: ICON('handover'), text: 'THỜI HẠN BÀN GIAO\nQ3/2026' },
  // Một dòng trong nguồn — nó tự wrap trong cột.
  { iconUrl: ICON('developer'), text: 'CHỦ ĐẦU TƯ CT TNHH MTV VŨ VIỆT' },
];

const EN_STATS: RealEstateOverviewStat[] = [
  { iconUrl: ICON('scale'), text: 'PROJECT\nSCALE 7.2 HA' },
  { iconUrl: ICON('townhouse'), text: '240\nTERRACED HOUSES' },
  { iconUrl: ICON('duplex'), text: '83 SEMI-DETACHED\nVILLAS' },
  { iconUrl: ICON('villa'), text: '10 DETACHED\nVILLAS' },
  { iconUrl: ICON('handover'), text: 'HANDOVER\nQ3/2026' },
  { iconUrl: ICON('developer'), text: 'DEVELOPER VU VIET CO., LTD' },
];

const VI: RealEstateOverviewContent = {
  title: 'Tổng quan\ndự án',
  stats: VI_STATS,
};

const EN: RealEstateOverviewContent = {
  title: 'Project\noverview',
  stats: EN_STATS,
};

/**
 * Layers folders — 1 group / hạng mục. Dùng chung giữa BlockDef (6 hạng mục
 * mặc định) và `LayersPanel.elementsForType` (nội dung thật trong content).
 *
 * Fallback về VI_STATS khi mảng rỗng để panel Lớp không trống trơn.
 */
export const realEstateOverviewStatElements = (
  stats: RealEstateOverviewStat[]
): LayerElement[] => {
  const list = stats.length > 0 ? stats : VI_STATS;
  return list.flatMap((stat, i) => {
    const groupId = `stat${i}`;
    // Chữ có `\n`; lấy dòng đầu làm tên folder cho gọn.
    const groupLabel = stat.text?.split('\n')[0]?.trim() || `Hạng mục ${i + 1}`;
    return [
      {
        key: `stats[${i}].iconUrl`,
        label: 'Icon',
        groupId,
        groupLabel,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `stats[${i}].text`,
        label: 'Nội dung',
        groupId,
        icon: Pilcrow,
        fieldType: 'textarea' as const,
      },
    ];
  });
};

export const realEstateOverviewDef: BlockDef<RealEstateOverviewContent> = {
  type: 'real_estate_overview',
  meta: {
    type: 'real_estate_overview',
    label: 'Real Estate - Tổng quan',
    accent: '#009336',
    adminLabel: 'Real Estate - Tổng quan',
    gradient: 'from-amber-50 to-emerald-700',
    defaultName: 'Real Estate - Tổng quan',
    aiLabelVi:
      'section tổng quan dự án: tiêu đề 2 dòng canh giữa, dưới là lưới 2 cột × 3 hàng gồm 6 icon tròn, mỗi icon kèm một dòng thông số; tiêu đề rồi từng ô fade-up lần lượt khi cuộn tới',
    aiLabelEn:
      'project overview section: a centred two-line title above a 2×3 grid of six circular icons, each captioned with one project figure; title then each cell fades up in sequence on scroll',
  },
  // dynamic để webpack tách chunk per-block (audit FE 2026-07-04 P1).
  component: dynamic(() =>
    import('../../RealEstateOverview').then(m => m.RealEstateOverview)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    ...realEstateOverviewStatElements(VI_STATS),
  ],
};
