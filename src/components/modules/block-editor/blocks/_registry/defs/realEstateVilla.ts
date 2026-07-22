/**
 * BlockDef cho `real_estate_villa` — port section Framer `7. Biệt thự` của
 * template real-estate-1: eyebrow + tiêu đề canh giữa, dưới là carousel 4 slide
 * (ảnh ngang + tên loại hình + mô tả) kèm counter, dots và nút prev/next.
 * Component: `blocks/RealEstateVilla.tsx`. Path A.
 *
 * Default VI lấy nguyên văn từ `apps/real-estate-1/lib/blocks/Villa.tsx`
 * (DEFAULT_CONTENT), chỉ đổi `imageUrl` sang bản copy nội bộ trong
 * `public/real-estate/` — KHÔNG trỏ về CDN Framer gốc: PORTING.md ghi rõ một
 * lần republish là nguồn đổi thầm lặng. Tên file đặt theo ngữ nghĩa (không giữ
 * hash CDN), đúng tiền lệ của `realEstateOverview` / `realEstateHighlights`.
 *
 * CẶP SLIDE ↔ ẢNH ĐÃ ĐO, KHÔNG ĐOÁN. Bản apps render ép từng variant của slider
 * nguồn rồi xem ảnh nào lọt khung 322px — kết quả là REVERSE DOM ORDER, đúng cái
 * bẫy PORTING.md cảnh báo. Đừng "sửa lại cho thuận mắt":
 *   1/4 Nhà phố liền kề     → villa-townhouse        (2XRB9m…)
 *   2/4 Nhà phố liền kề lớn → villa-townhouse-large  (d834Th…)
 *   3/4 Biệt thự song lập   → villa-duplex           (UN0Fn…)
 *   4/4 Biệt thự đơn lập    → villa-single           (EIVbjQ…)
 *
 * KHÔNG có mục list manager kiểu `realEstateHero` (`{ key: 'stats' }` → tái
 * dùng `StatsControls`): control đó generic trên `{value,label}[]`, không khớp
 * `{title,description,imageUrl}`. Số slide cố định 4 như nguồn.
 */
import { Image as ImageIcon, Palette, Pilcrow, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  RealEstateVillaContent,
  RealEstateVillaSlide,
} from '../../../types';
import type { BlockDef } from '../types';

const IMG = (name: string) => `/real-estate/villa-${name}.jpg`;

const VI_SLIDES: RealEstateVillaSlide[] = [
  {
    title: 'Nhà phố liền kề',
    description:
      'Với tổng diện tích sàn xây dựng lên tới 227m2, kết cấu 4 tầng, và có thể bố trí 4+ phòng ngủ, các căn nhà này mang đến không gian rộng rãi cho một gia đình từ 2 đến 3 thế hệ để tận hưởng cuộc sống hàng ngày trọn vẹn.',
    imageUrl: IMG('townhouse'),
  },
  {
    title: 'Nhà phố liền kề lớn',
    description:
      'Gồm 48 căn tại các góc phố có vị trí đẹp đối diện công viên và trường học. Với thiết kế 4 tầng, tổng diện tích sàn từ 272m2 - 298m2, các căn nhà này là lựa chọn lý tưởng cho khách hàng đầu tư ưa thích tầm nhìn đẹp và không gian xanh.',
    imageUrl: IMG('townhouse-large'),
  },
  {
    title: 'Biệt thự song lập',
    description:
      'Biệt thự song lập sẽ là sự lựa chọn lý tưởng cho những gia đình yêu thích sự sang trọng và không gian sống rộng rãi, tiện nghi.',
    imageUrl: IMG('duplex'),
  },
  {
    title: 'Biệt thự đơn lập',
    description:
      'Cho phép thiết kế sân vườn hoặc hồ bơi. Với thiết kế 4 tầng trên diện tích sàn 490m2, các biệt thự này mang đến không gian sống sang trọng, rộng rãi, tiện nghi, lý tưởng và đẳng cấp cho gia chủ.',
    imageUrl: IMG('single'),
  },
];

const EN_SLIDES: RealEstateVillaSlide[] = [
  {
    title: 'Terraced townhouses',
    description:
      'With up to 227m2 of built floor area across four storeys and room for 4+ bedrooms, these homes give a two- or three-generation family the space to live a full daily life together.',
    imageUrl: IMG('townhouse'),
  },
  {
    title: 'Large terraced townhouses',
    description:
      '48 homes on prime corner plots facing the park and the school. Four storeys and 272m2 - 298m2 of floor area make these an ideal choice for investors who value a fine outlook and green surroundings.',
    imageUrl: IMG('townhouse-large'),
  },
  {
    title: 'Semi-detached villas',
    description:
      'Semi-detached villas are the natural choice for families who want elegance together with generous, well-appointed living space.',
    imageUrl: IMG('duplex'),
  },
  {
    title: 'Detached villas',
    description:
      'Room for a private garden or a pool. Four storeys across 490m2 of floor area deliver living space that is spacious, refined and genuinely in a class of its own.',
    imageUrl: IMG('single'),
  },
];

const VI: RealEstateVillaContent = {
  eyebrow: 'BIỆT THỰ',
  title: 'Hạ tầng khu biệt thự thiết kế bài bản & chỉn chu',
  slides: VI_SLIDES,
};

const EN: RealEstateVillaContent = {
  eyebrow: 'VILLAS',
  title: 'A villa quarter laid out with rigour and care',
  slides: EN_SLIDES,
};

/**
 * Layers folders — 1 group / slide. Dùng chung giữa BlockDef (4 slide mặc định)
 * và `LayersPanel.elementsForType` (nội dung thật trong content).
 *
 * Fallback về VI_SLIDES khi mảng rỗng để panel Lớp không trống trơn.
 */
export const realEstateVillaSlideElements = (
  slides: RealEstateVillaSlide[]
): LayerElement[] => {
  const list = slides.length > 0 ? slides : VI_SLIDES;
  return list.flatMap((slide, i) => {
    const groupId = `slide${i}`;
    const groupLabel =
      (slide.title ?? '').trim().slice(0, 40) || `Slide ${i + 1}`;
    return [
      {
        key: `slides[${i}].imageUrl`,
        label: 'Ảnh',
        groupId,
        groupLabel,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `slides[${i}].title`,
        label: 'Tên loại hình',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `slides[${i}].description`,
        label: 'Mô tả',
        groupId,
        icon: Pilcrow,
        fieldType: 'textarea' as const,
      },
    ];
  });
};

export const realEstateVillaDef: BlockDef<RealEstateVillaContent> = {
  type: 'real_estate_villa',
  meta: {
    type: 'real_estate_villa',
    label: 'Real Estate - Biệt thự',
    accent: '#009336',
    adminLabel: 'Real Estate - Biệt thự',
    gradient: 'from-amber-50 to-emerald-700',
    defaultName: 'Real Estate - Biệt thự',
    aiLabelVi:
      'section các loại hình biệt thự: eyebrow và tiêu đề canh giữa, dưới là carousel ảnh kèm tên loại hình, mô tả, counter và nút chuyển slide',
    aiLabelEn:
      'villa typologies section: a centred eyebrow and title above an image carousel with the typology name, description, a slide counter and prev/next controls',
  },
  // dynamic để webpack tách chunk per-block (audit FE 2026-07-04 P1).
  component: dynamic(() =>
    import('../../RealEstateVilla').then(m => m.RealEstateVilla)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Nhãn nhỏ', icon: Type, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    // Style-only (kind `fill`, không có fieldType) như `contentSurface` của
    // realEstateHighlights: nền thẻ, chỉ có màu chứ không có nội dung. MỘT key
    // dùng chung cho cả 4 thẻ — đổi màu là đổi đồng loạt. Nền NGOÀI là
    // background của block, sửa ở mục "Nền" sẵn có.
    { key: 'cardSurface', label: 'Nền thẻ', icon: Palette },
    ...realEstateVillaSlideElements(VI_SLIDES),
  ],
};
