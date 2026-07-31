/**
 * BlockDef cho `masterise_home_inside` — port từ framer-recon
 * `recon-masterise-park-place-tien-ich-trong-nha` (URL
 * `https://masterisehomes.com/the-global-city/masteri-park-place/`,
 * selector `section.util-indoor-section`).
 *
 * Section Masterise Park Place: heading 2 dòng cam #c64a26 ("Hệ tiện ích /
 * trong nhà", font Masteri 52.5px md+ / 31.5px mobile) + body mô tả
 * (Masteri Sans 14px, text-justify mobile / text-left md+, max-w-[40%]
 * md+) + Swiper carousel 5 slide ảnh nội khu (slidesPerView 1/1.2/2,
 * spaceBetween 20/30/44, loop) + 2 nút prev/next tròn viền cam.
 *
 * Component: `blocks/MasteriseHomeInside.tsx`. Entrance reveal (heading
 * words scale+blur stagger 0.1s, body fade-up y+blur, slide reveal
 * curtain + Ken Burns) đi qua `useBlockMotion` theo GSAP R1–R6.
 *
 * ⚠ Fonts: `Masteri` (serif) và `Masteri Sans` (sans) là foundry font
 * độc quyền — component dùng Google Fonts substitutes `Fraunces` /
 * `Plus Jakarta Sans` (xem component header). Image URLs từ site gốc
 * (masterisehomes.com wp-content/uploads) — production nên re-host qua
 * CMS.
 */
import { Image as ImageIcon, ListChecks, Pilcrow, Type } from 'lucide-react';

import { MasteriseHomeInside } from '../../MasteriseHomeInside';
import type { LayerElement } from '../../../LayersPanel';
import type {
  MasteriseHomeInsideContent,
  MasteriseHomeInsideSlide,
} from '../../../types';
import type { BlockDef } from '../types';

const IMG_1 =
  'https://masterisehomes.com/the-global-city/masteri-park-place/wp-content/uploads/2025/10/WEBSITE-CT5_sanh.jpg';
const IMG_2 =
  'https://masterisehomes.com/the-global-city/masteri-park-place/wp-content/uploads/2025/10/thu-vien.jpg';
const IMG_3 =
  'https://masterisehomes.com/the-global-city/masteri-park-place/wp-content/uploads/2025/10/WEBSITE-CT5_sanh-thang-may.jpg';
const IMG_4 =
  'https://masterisehomes.com/the-global-city/masteri-park-place/wp-content/uploads/2025/10/WEBSITE-CT5_thang-may.jpg';
const IMG_5 =
  'https://masterisehomes.com/the-global-city/masteri-park-place/wp-content/uploads/2025/10/WEBSITE-CT5_hanh-lang.jpg';

const VI: MasteriseHomeInsideContent = {
  headingLine1: 'Hệ tiện ích',
  headingLine2: 'trong nhà',
  body: 'Mỗi không gian đều được kiến tạo chỉn chu, chăm chút đến từng chi tiết để trải nghiệm thường nhật luôn trọn vẹn. Như một trạm sạc năng lượng tích cực, mở không gian kết nối định hình phong cách cư dân toàn cầu dẫn đầu của cộng đồng ưu tú.',
  slides: [
    { id: 's1', imageUrl: IMG_1, alt: 'Sảnh đón — Tiện ích nội khu 1' },
    { id: 's2', imageUrl: IMG_2, alt: 'Thư viện — Tiện ích nội khu 2' },
    {
      id: 's3',
      imageUrl: IMG_3,
      alt: 'Sảnh thang máy — Tiện ích nội khu 3',
    },
    { id: 's4', imageUrl: IMG_4, alt: 'Thang máy — Tiện ích nội khu 4' },
    { id: 's5', imageUrl: IMG_5, alt: 'Hành lang — Tiện ích nội khu 5' },
  ],
};

const EN: MasteriseHomeInsideContent = {
  headingLine1: 'Indoor',
  headingLine2: 'amenities',
  body: 'Every space is crafted with meticulous care down to the smallest detail, so that everyday experiences feel complete. Like a positive-energy charging station, it opens up a connected space that defines the lifestyle of pioneering global citizens in an elite community.',
  slides: [
    { id: 's1', imageUrl: IMG_1, alt: 'Lobby — Indoor amenity 1' },
    { id: 's2', imageUrl: IMG_2, alt: 'Library — Indoor amenity 2' },
    {
      id: 's3',
      imageUrl: IMG_3,
      alt: 'Elevator lobby — Indoor amenity 3',
    },
    { id: 's4', imageUrl: IMG_4, alt: 'Elevator — Indoor amenity 4' },
    { id: 's5', imageUrl: IMG_5, alt: 'Corridor — Indoor amenity 5' },
  ],
};

/**
 * Slides đã lọc — content từ BE có thể thiếu/lệch shape (slide null, thiếu
 * imageUrl). Dùng chung cho component, LayersPanel và ElementToolbar để 3 nơi
 * cùng index → key `slides[i].*` luôn trỏ đúng phần tử.
 */
export const resolveMasteriseHomeInsideSlides = (
  content: MasteriseHomeInsideContent
): MasteriseHomeInsideSlide[] => {
  const raw = content?.slides;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    s => s && typeof s === 'object' && typeof s.imageUrl === 'string'
  );
};

/** 1 folder Lớp / slide (ảnh + alt + caption). */
export const masteriseHomeInsideSlideElements = (
  slides: MasteriseHomeInsideSlide[]
): LayerElement[] =>
  slides.flatMap((s, i) => {
    const groupId = `slide${i}`;
    const groupLabel = s.alt?.trim() || `Slide ${i + 1}`;
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
        key: `slides[${i}].alt`,
        label: 'Alt (mô tả ảnh)',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `slides[${i}].caption`,
        label: 'Caption overlay',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
    ];
  });

export const masteriseHomeInsideDef: BlockDef<MasteriseHomeInsideContent> = {
  type: 'masterise_home_inside',
  meta: {
    type: 'masterise_home_inside',
    label: 'Masterise Home Inside',
    accent: '#c64a26',
    adminLabel: 'Masterise — Hệ tiện ích trong nhà',
    gradient: 'from-orange-100 to-orange-200',
    defaultName: 'Hệ tiện ích trong nhà',
    aiLabelVi:
      'section Masterise, heading 2 dòng cam #c64a26 ("Hệ tiện ích / trong nhà") + body mô tả + Swiper carousel 5 slide ảnh (slidesPerView 1/1.2/2) + 2 nút prev/next tròn viền cam',
    aiLabelEn:
      'Masterise section, 2-line orange #c64a26 heading ("Indoor amenities") + body description + Swiper 5-slide image carousel (1/1.2/2 slides per view) + 2 round prev/next buttons with orange border',
  },
  component: MasteriseHomeInside,
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'headingLine1',
      label: 'Heading — Dòng 1',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'headingLine2',
      label: 'Heading — Dòng 2',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'body',
      label: 'Mô tả',
      icon: Pilcrow,
      fieldType: 'textarea',
    },
    ...masteriseHomeInsideSlideElements(VI.slides),
    // List manager: thêm / xoá slide (kind `masteriseSlides`).
    // KHÔNG đặt fieldType — nếu không resolveKind sẽ trả 'text' và ghi string
    // đè cả mảng slides.
    {
      key: 'slides',
      label: 'Thêm / quản lý slide',
      icon: ListChecks,
    },
  ],
};
