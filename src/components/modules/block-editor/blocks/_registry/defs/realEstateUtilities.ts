/**
 * BlockDef cho `real_estate_utilities` — port section Framer `8. Nội khu` của
 * template real-estate-1: tiêu đề canh giữa, dưới là lưới 2 cột × 3 hàng gồm 6
 * icon line art nâu, mỗi icon kèm tên tiện ích 2 dòng.
 * Component: `blocks/RealEstateUtilities.tsx`. Path A.
 *
 * Default VI lấy nguyên văn từ `apps/real-estate-1/lib/blocks/Utilities.tsx`
 * (DEFAULT_CONTENT), ghép thêm `iconUrl`. Asset là bản copy nội bộ trong
 * `public/real-estate/` — KHÔNG trỏ về CDN Framer gốc: PORTING.md ghi rõ một
 * lần republish là nguồn đổi thầm lặng.
 *
 * KHÔNG có mục list manager kiểu `realEstateHero` (`{ key: 'stats' }` → tái
 * dùng `StatsControls`): control đó generic trên `{value,label}[]`, không khớp
 * `{iconUrl,label}`. Số ô cố định 6 như nguồn.
 */
import { Image as ImageIcon, Pilcrow, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  RealEstateUtilitiesContent,
  RealEstateUtilityItem,
} from '../../../types';
import type { BlockDef } from '../types';

const ICON = (name: string) => `/real-estate/utility-${name}.svg`;

const VI_ITEMS: RealEstateUtilityItem[] = [
  { iconUrl: ICON('park'), label: 'CÔNG VIÊN\nCÂY XANH' },
  { iconUrl: ICON('mall'), label: 'TRUNG TÂM\nTHƯƠNG MẠI' },
  { iconUrl: ICON('kindergarten'), label: 'TRƯỜNG\nMẦM NON' },
  { iconUrl: ICON('playground'), label: 'KHU VUI CHƠI\nTRẺ EM' },
  { iconUrl: ICON('bbq'), label: 'KHU BBQ\nNGOÀI TRỜI' },
  { iconUrl: ICON('gym'), label: 'PHÒNG TẬP\nTHỂ DỤC' },
];

const EN_ITEMS: RealEstateUtilityItem[] = [
  { iconUrl: ICON('park'), label: 'GREEN\nPARK' },
  { iconUrl: ICON('mall'), label: 'SHOPPING\nCENTRE' },
  { iconUrl: ICON('kindergarten'), label: 'KINDER-\nGARTEN' },
  { iconUrl: ICON('playground'), label: "KIDS'\nPLAYGROUND" },
  { iconUrl: ICON('bbq'), label: 'OUTDOOR\nBBQ AREA' },
  { iconUrl: ICON('gym'), label: 'FITNESS\nGYM' },
];

const VI: RealEstateUtilitiesContent = {
  // Nguồn để lại một dấu cách cuối ("Nội khu đa tiện ích "); bỏ vì là nhiễu.
  title: 'Nội khu đa tiện ích',
  items: VI_ITEMS,
};

const EN: RealEstateUtilitiesContent = {
  title: 'A neighbourhood full of amenities',
  items: EN_ITEMS,
};

/**
 * Layers folders — 1 group / ô. Dùng chung giữa BlockDef (6 ô mặc định) và
 * `LayersPanel.elementsForType` (nội dung thật trong content).
 *
 * Fallback về VI_ITEMS khi mảng rỗng để panel Lớp không trống trơn.
 */
export const realEstateUtilityItemElements = (
  items: RealEstateUtilityItem[]
): LayerElement[] => {
  const list = items.length > 0 ? items : VI_ITEMS;
  return list.flatMap((item, i) => {
    const groupId = `item${i}`;
    // Label có `\n`; lấy dòng đầu làm tên folder cho gọn.
    const groupLabel =
      item.label?.split('\n')[0]?.trim() || `Tiện ích ${i + 1}`;
    return [
      {
        key: `items[${i}].iconUrl`,
        label: 'Icon',
        groupId,
        groupLabel,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `items[${i}].label`,
        label: 'Nội dung',
        groupId,
        icon: Pilcrow,
        fieldType: 'textarea' as const,
      },
    ];
  });
};

export const realEstateUtilitiesDef: BlockDef<RealEstateUtilitiesContent> = {
  type: 'real_estate_utilities',
  meta: {
    type: 'real_estate_utilities',
    label: 'Real Estate - Nội khu tiện ích',
    accent: '#009336',
    adminLabel: 'Real Estate - Nội khu tiện ích',
    gradient: 'from-amber-50 to-emerald-700',
    defaultName: 'Real Estate - Nội khu tiện ích',
    aiLabelVi:
      'section nội khu tiện ích: tiêu đề canh giữa, dưới là lưới 2 cột × 3 hàng gồm 6 icon line art nâu, mỗi icon kèm tên tiện ích 2 dòng; tiêu đề rồi từng ô fade-up lần lượt khi cuộn tới',
    aiLabelEn:
      'on-site amenities section: a centred title above a 2×3 grid of six brown line-art icons, each captioned with a two-line amenity name; title then each cell fades up in sequence on scroll',
  },
  // dynamic để webpack tách chunk per-block (audit FE 2026-07-04 P1).
  component: dynamic(() =>
    import('../../RealEstateUtilities').then(m => m.RealEstateUtilities)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    ...realEstateUtilityItemElements(VI_ITEMS),
  ],
};
