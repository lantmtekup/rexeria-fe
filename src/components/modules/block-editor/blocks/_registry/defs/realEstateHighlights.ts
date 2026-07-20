/**
 * BlockDef cho `real_estate_highlights` — port section Framer
 * `6. Điểm nổi trội dự án` của template real-estate-1: tiêu đề + mô tả canh
 * giữa, dưới là dãy 4 card (ảnh tròn + số lớn màu xanh + một dòng chữ) trượt
 * ngang theo tiến độ cuộn của chính section.
 * Component: `blocks/RealEstateHighlights.tsx`. Path A.
 *
 * Default VI lấy nguyên văn từ `apps/real-estate-1/lib/blocks/Highlights.tsx`
 * (DEFAULT_CONTENT), chỉ đổi `imageUrl` sang bản copy nội bộ trong
 * `public/real-estate/` — KHÔNG trỏ về CDN Framer gốc: PORTING.md ghi rõ một
 * lần republish là nguồn đổi thầm lặng. Tên file đặt theo ngữ nghĩa (không giữ
 * hash CDN), đúng tiền lệ icon của `realEstateOverview`.
 *
 * KHÔNG có mục list manager kiểu `realEstateHero` (`{ key: 'items' }` → tái
 * dùng `StatsControls`): control đó generic trên `{value,label}[]`, không khớp
 * `{number,text,imageUrl}`. Số card cố định 4 như nguồn.
 */
import { Hash, Image as ImageIcon, Palette, Pilcrow, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  RealEstateHighlightItem,
  RealEstateHighlightsContent,
} from '../../../types';
import type { BlockDef } from '../types';

const IMG = (name: string, ext = 'jpg') =>
  `/real-estate/highlight-${name}.${ext}`;

const VI_ITEMS: RealEstateHighlightItem[] = [
  {
    number: '1.',
    text: 'KHU NHÀ Ở AN NINH KHÉP KÍN ĐẦU TIÊN TẠI PHÚ MỸ',
    imageUrl: IMG('security'),
  },
  {
    number: '2.',
    text: 'ĐƠN VỊ PHÁT TRIỂN UY TÍN, CÓ NHIỀU GIẢI THƯỞNG QUỐC TẾ',
    imageUrl: IMG('developer', 'png'),
  },
  {
    number: '3.',
    text: 'VỊ TRÍ CHIẾN LƯỢC TRUNG TÂM PHÚ MỸ, KẾT NỐI THUẬN TIỆN',
    imageUrl: IMG('location'),
  },
  {
    number: '4.',
    text: 'ĐẶC QUYỀN CƯ DÂN SỬ DỤNG CÁC TIỆN ÍCH ĐẲNG CẤP',
    imageUrl: IMG('amenities'),
  },
];

const EN_ITEMS: RealEstateHighlightItem[] = [
  {
    number: '1.',
    text: 'THE FIRST FULLY GATED RESIDENTIAL ENCLAVE IN PHU MY',
    imageUrl: IMG('security'),
  },
  {
    number: '2.',
    text: 'A TRUSTED DEVELOPER WITH MULTIPLE INTERNATIONAL AWARDS',
    imageUrl: IMG('developer', 'png'),
  },
  {
    number: '3.',
    text: 'A STRATEGIC LOCATION IN CENTRAL PHU MY, EASILY CONNECTED',
    imageUrl: IMG('location'),
  },
  {
    number: '4.',
    text: 'RESIDENT PRIVILEGES ACROSS WORLD-CLASS AMENITIES',
    imageUrl: IMG('amenities'),
  },
];

const VI: RealEstateHighlightsContent = {
  title: 'Điểm nổi trội dự án',
  description:
    'Được thiết kế để tôn vinh những yếu tố đặc biệt làm nên sự độc đáo và hấp dẫn của dự án. Những yếu tố này không chỉ là đặc điểm nổi bật mà còn là lời cam kết của chúng tôi trong việc mang đến một môi trường sống và đầu tư lý tưởng tại Phú Mỹ.',
  items: VI_ITEMS,
};

const EN: RealEstateHighlightsContent = {
  title: 'Project highlights',
  description:
    'Designed to celebrate the particular qualities that make this project distinctive and compelling. These are not merely standout features — they are our commitment to delivering an ideal environment to live in and to invest in at Phu My.',
  items: EN_ITEMS,
};

/**
 * Layers folders — 1 group / card. Dùng chung giữa BlockDef (4 card mặc định)
 * và `LayersPanel.elementsForType` (nội dung thật trong content).
 *
 * Fallback về VI_ITEMS khi mảng rỗng để panel Lớp không trống trơn.
 */
export const realEstateHighlightItemElements = (
  items: RealEstateHighlightItem[]
): LayerElement[] => {
  const list = items.length > 0 ? items : VI_ITEMS;
  return list.flatMap((item, i) => {
    const groupId = `item${i}`;
    // Chữ trong card khá dài; ghép số + chữ rồi cắt cho tên folder gọn.
    const groupLabel =
      `${item.number ?? `${i + 1}.`} ${item.text ?? ''}`.trim().slice(0, 40) ||
      `Điểm nổi trội ${i + 1}`;
    return [
      {
        key: `items[${i}].imageUrl`,
        label: 'Ảnh',
        groupId,
        groupLabel,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `items[${i}].number`,
        label: 'Số thứ tự',
        groupId,
        icon: Hash,
        fieldType: 'text' as const,
      },
      {
        key: `items[${i}].text`,
        label: 'Nội dung',
        groupId,
        icon: Pilcrow,
        fieldType: 'textarea' as const,
      },
    ];
  });
};

export const realEstateHighlightsDef: BlockDef<RealEstateHighlightsContent> = {
  type: 'real_estate_highlights',
  meta: {
    type: 'real_estate_highlights',
    label: 'Real Estate - Điểm nổi trội',
    accent: '#009336',
    adminLabel: 'Real Estate - Điểm nổi trội',
    gradient: 'from-amber-50 to-emerald-700',
    defaultName: 'Real Estate - Điểm nổi trội',
    aiLabelVi:
      'section điểm nổi trội dự án: tiêu đề và mô tả canh giữa, dưới là dãy card ảnh tròn kèm số thứ tự lớn màu xanh, trượt ngang theo tiến độ cuộn của section',
    aiLabelEn:
      'project highlights section: a centred title and description above a row of cards with circular photos and large green ordinals, the row sliding horizontally as the section scrolls past',
  },
  // dynamic để webpack tách chunk per-block (audit FE 2026-07-04 P1).
  component: dynamic(() =>
    import('../../RealEstateHighlights').then(m => m.RealEstateHighlights)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    // Style-only (kind `fill`, không có fieldType) như `line`/`dot` của
    // mintv2_process: dải nền 372 chạy suốt chiều cao section. Nền NGOÀI là
    // background của block, sửa ở mục "Nền" sẵn có.
    { key: 'contentSurface', label: 'Nền cột nội dung', icon: Palette },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    {
      key: 'description',
      label: 'Mô tả',
      icon: Pilcrow,
      fieldType: 'textarea',
    },
    ...realEstateHighlightItemElements(VI_ITEMS),
  ],
};
