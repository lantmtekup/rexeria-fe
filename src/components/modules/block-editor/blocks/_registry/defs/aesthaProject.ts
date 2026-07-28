/**
 * BlockDef cho `aestha_project` — trang chi tiết dự án (cùng site RAMSA/Aestha
 * với `aestha_explore` / `aestha_studio` / `aestha_contact`). Cột trái sticky
 * (tiêu đề + nhãn "Concept" + đoạn mô tả) · cột phải stack ảnh cuộn dọc;
 * cuối stack panel "Concept" crossfade sang "See next project". Narrow (<900px):
 * xếp 1 cột. Port từ `ProjectView` trong `apps/real-estate/src/AesthaDemoPage.tsx`.
 * Path A registry.
 */
import { ImageIcon, Link2, Pilcrow, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type { AesthaProjectContent, AesthaProjectImage } from '../../../types';
import type { BlockDef } from '../types';

// Ảnh stack — giữ CDN framerusercontent.com theo asset rule của skill.
const IMAGES: AesthaProjectImage[] = [
  {
    src: 'https://framerusercontent.com/images/WPx9Zr4AV2b97ubrDEMcky10rwA.jpg?width=2364&height=1578',
    alt: 'Ba tòa tháp nhìn từ trên cao',
  },
  {
    src: 'https://framerusercontent.com/images/sb7lNvFscO86WspAS6g2Dbumdk4.jpg?width=2364&height=963',
    alt: 'Tháp đôi bên sông núi',
  },
  {
    src: 'https://framerusercontent.com/images/gx0JUIPtvSo4eMJgRkMoqx2HPc.jpg?width=2364&height=1576',
    alt: 'Ba tòa tháp giờ vàng',
  },
  {
    src: 'https://framerusercontent.com/images/FeVrkEA94CrUpaD629BKz29Pbs.jpg?width=2364&height=1280',
    alt: 'Cặp tháp đôi nhìn từ đường phố',
  },
];

// Nav (`navLinks`) đã tách sang block `aestha_nav` — không seed nữa; field chỉ
// còn optional để blueprint cũ không vỡ.

const BODY_VI = [
  'Epictower là tổ hợp căn hộ cao cấp tại trung tâm Cầu Giấy — 45 tầng, 4 block, 500+ căn hộ đa dạng từ 1 phòng ngủ đến penthouse duplex.',
  'Toạ lạc trên tuyến đường huyết mạch, dự án kết nối liền mạch với hồ Tây, sân bay Nội Bài và hệ thống trường quốc tế chỉ trong 15–20 phút di chuyển.',
  'Thiết kế Art Deco & Indochine kết hợp vật liệu cao cấp và công năng đương đại — một công trình kiến tạo để tồn tại qua nhiều thế hệ cư dân.',
];

const BODY_EN = [
  'Epictower is a premium residential complex in the heart of Cầu Giấy — 45 floors, 4 blocks, 500+ homes from one-bedroom units to duplex penthouses.',
  'Set on a main arterial road, the project connects seamlessly to West Lake, Nội Bài airport and international schools, all within 15–20 minutes.',
  'An Art Deco & Indochine design pairing premium materials with contemporary function — architecture built to endure across generations of residents.',
];

const VI: AesthaProjectContent = {
  title: 'TẦM NHÌN',
  conceptLabel: 'Concept',
  body: BODY_VI,
  images: IMAGES,
  nextHeading: 'Dự án tiếp theo',
  nextLabel: 'Kiến trúc',
  nextHref: '',
};

const EN: AesthaProjectContent = {
  title: 'VISION',
  conceptLabel: 'Concept',
  body: BODY_EN,
  images: IMAGES,
  nextHeading: 'See next project',
  nextLabel: 'Architecture',
  nextHref: '',
};

/**
 * `body` là mảng string động → không biểu diễn được trong `elements` tĩnh.
 * `LayersPanel.elementsForType` gọi helper này để expand `body[i]`
 * (pattern `aesthaExploreProjectElements`).
 */
export const aesthaProjectBodyElements = (body: string[]): LayerElement[] =>
  body.map((_, i) => ({
    key: `body[${i}]`,
    label: `Đoạn ${i + 1}`,
    icon: Pilcrow,
    fieldType: 'textarea' as const,
  }));

/** Ảnh stack — mảng động, expand `images[i]`. */
export const aesthaProjectImageElements = (
  images: AesthaProjectImage[]
): LayerElement[] =>
  images.flatMap((_, i) => [
    {
      key: `images[${i}].src`,
      label: 'Ảnh',
      groupId: `img${i}`,
      groupLabel: `Ảnh ${i + 1}`,
      icon: ImageIcon,
      fieldType: 'image' as const,
    },
    {
      key: `images[${i}].alt`,
      label: 'Alt',
      groupId: `img${i}`,
      icon: Type,
      fieldType: 'text' as const,
    },
  ]);

// `aesthaProjectNavLinkElements` đã bỏ cùng lúc nav tách thành block riêng
// `aestha_nav` (xem `defs/aesthaNav.ts`).

export const aesthaProjectDef: BlockDef<AesthaProjectContent> = {
  type: 'aestha_project',
  meta: {
    type: 'aestha_project',
    category: 'intro',
    style: 'luxury',
    tags: ['clone', 'framer', 'project'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-21',
    label: 'Aestha Project',
    accent: '#0F0F0F',
    adminLabel: 'Project detail (Aestha)',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Project',
    aiLabelVi:
      'trang chi tiết dự án: cột trái sticky (tiêu đề + mô tả) · cột phải stack ảnh cuộn, cuối trang đổi sang "dự án tiếp theo"',
    aiLabelEn:
      'project detail page: sticky left column (title + concept) · scrolling right image stack, swaps to "next project" at the end',
  },
  component: dynamic(() =>
    import('../../AesthaProject').then(m => m.AesthaProject)
  ),
  defaultContent: { vi: VI, en: EN },
  // Phần tĩnh. `body` / `images` được LayersPanel expand động qua
  // các helper trên — xem branch `aestha_project` ở đó.
  elements: [
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    {
      key: 'conceptLabel',
      label: 'Nhãn Concept',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'nextHeading',
      label: 'Nhãn "dự án tiếp theo"',
      groupId: 'next',
      groupLabel: 'Dự án tiếp theo',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'nextLabel',
      label: 'Tên dự án',
      groupId: 'next',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'nextHref',
      label: 'Link',
      groupId: 'next',
      icon: Link2,
      fieldType: 'link',
    },
  ],
};
