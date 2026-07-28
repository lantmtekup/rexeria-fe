/**
 * BlockDef cho `aestha_nav` — thanh nav dùng chung của họ block Aestha (RAMSA),
 * ghim cố định góc TRÁI DƯỚI.
 *
 * Thay cho nav nội bộ mà `framer_aestha_editorial` / `aestha_explore` /
 * `aestha_studio` / `aestha_contact` / `aestha_project` từng tự render. Mỗi
 * trang thả 1 block (Explore / Studio / Contact là các TRANG khác nhau của
 * cùng site — không có slot chrome cấp trang).
 *
 * Path A registry.
 */
import { Link2, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type { AesthaNavContent, AesthaNavItem } from '../../../types';
import type { BlockDef } from '../types';

// `href` để RỖNG có chủ đích — KHÔNG điền path demo (`/projects`): path đó 404
// trên site public (path thật là `/p/{rootSlug}/{slug}`). Author gán link qua
// link-picker của toolbar (`fieldType: 'link'`), hỗ trợ 3 case: cuộn tới section ·
// mở tab mới (URL ngoài) · chuyển trang trong template.
const LINKS_VI: AesthaNavItem[] = [
  { label: 'Dự án', href: '' },
  { label: 'Studio', href: '' },
  { label: 'Liên hệ', href: '' },
];

const LINKS_EN: AesthaNavItem[] = [
  { label: 'Projects', href: '' },
  { label: 'Studio', href: '' },
  { label: 'Contact', href: '' },
];

const VI: AesthaNavContent = { navLinks: LINKS_VI };

const EN: AesthaNavContent = { navLinks: LINKS_EN };

/**
 * `navLinks` là mảng động → không biểu diễn được trong `elements` tĩnh.
 * `LayersPanel.elementsForType` gọi helper này để expand `navLinks[i]`.
 *
 * Trước đây sống trong `framerAesthaEditorial.ts`; chuyển sang đây khi nav tách
 * thành block riêng.
 */
export const aesthaNavLinkElements = (
  links: Array<{ label: string; href: string }>
): LayerElement[] =>
  links.flatMap((_, i) => [
    {
      key: `navLinks[${i}].label`,
      label: 'Nhãn',
      groupId: `nav${i}`,
      groupLabel: `Nav ${i + 1}`,
      icon: Type,
      fieldType: 'text' as const,
    },
    {
      key: `navLinks[${i}].href`,
      label: 'Link',
      groupId: `nav${i}`,
      icon: Link2,
      fieldType: 'link' as const,
    },
  ]);

export const aesthaNavDef: BlockDef<AesthaNavContent> = {
  type: 'aestha_nav',
  meta: {
    type: 'aestha_nav',
    category: 'navigation',
    style: 'luxury',
    tags: ['clone', 'framer', 'nav'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-27',
    label: 'Aestha Nav',
    accent: '#0F0F0F',
    adminLabel: 'Nav (Aestha)',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Nav',
    aiLabelVi:
      'thanh nav Aestha ghim cố định góc trái dưới — dùng chung cho mọi trang RAMSA (Dự án / Studio / Liên hệ)',
    aiLabelEn:
      'Aestha nav pinned to the bottom-left corner — shared across all RAMSA pages (Projects / Studio / Contact)',
  },
  component: dynamic(() => import('../../AesthaNav').then(m => m.AesthaNav)),
  defaultContent: { vi: VI, en: EN },
  // Không có field tĩnh nào: toàn bộ nội dung là mảng `navLinks`, được
  // LayersPanel expand động qua helper trên — xem branch `aestha_nav` ở đó.
  elements: [],
};
