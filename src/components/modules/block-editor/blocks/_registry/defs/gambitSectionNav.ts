/**
 * BlockDef cho `gambit_section_nav` — port `ProductSectionNav` của
 * apps/gambit-delvaux: thanh điều hướng dán đáy khung nhìn, mục đang xem có
 * chấm tròn ở trước. Path A.
 *
 * Layers: mỗi mục = 1 folder (chữ + link), cộng manager `navLinks` (thêm-xoá
 * mục qua ElementToolbar — dùng chung control `aesthaNavLinks` với
 * `aestha_nav` / `belgo_header` vì cùng shape `{ label, href }`).
 *
 * Link mặc định để RỖNG: id section của bản app (`#overview`, `#buy`…) không
 * tồn tại trong landing của host — người dựng trang chọn "Cuộn tới block" trong
 * link picker để trỏ đúng block.
 */
import { Link as LinkIcon, List, Type } from 'lucide-react';

import dynamic from 'next/dynamic';
import type { LayerElement } from '../../../LayersPanel';
import type {
  GambitSectionNavContent,
  GambitSectionNavItem,
} from '../../../types';
import type { BlockDef } from '../types';

const DEFAULT_NAV_LINKS: GambitSectionNavItem[] = [
  { label: 'Overview', href: '' },
  { label: 'Buy Brillant Mini', href: '' },
  { label: '1829 (Brand)', href: '' },
  { label: 'You Might Also Like', href: '' },
];

/**
 * Mục hợp lệ từ content (block + Lớp + toolbar dùng CHUNG hàm này để không
 * lệch nhau); rỗng/sai shape → danh sách mặc định.
 */
export function resolveGambitSectionNavLinks(
  content: GambitSectionNavContent | undefined
): GambitSectionNavItem[] {
  const raw = content?.navLinks;
  const list = Array.isArray(raw)
    ? raw.filter(
        (item): item is GambitSectionNavItem =>
          !!item && typeof item === 'object' && typeof item.label === 'string'
      )
    : [];
  return list.length > 0 ? list : DEFAULT_NAV_LINKS;
}

/** Layers folders — 1 group / mục nav. */
export const gambitSectionNavLinkElements = (
  links: GambitSectionNavItem[]
): LayerElement[] => {
  const list = links.length > 0 ? links : DEFAULT_NAV_LINKS;
  return list.flatMap((link, i) => {
    const groupId = `navLink${i}`;
    const groupLabel = link.label?.trim()
      ? `${i + 1}. ${link.label.trim().slice(0, 32)}`
      : `Mục ${i + 1}`;

    return [
      {
        key: `navLinks[${i}].label`,
        label: 'Chữ',
        groupId,
        groupLabel,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `navLinks[${i}].href`,
        label: 'Link',
        groupId,
        icon: LinkIcon,
        fieldType: 'link' as const,
      },
    ];
  });
};

const VI: GambitSectionNavContent = { navLinks: DEFAULT_NAV_LINKS };
const EN: GambitSectionNavContent = { navLinks: DEFAULT_NAV_LINKS };

export const gambitSectionNavDef: BlockDef<GambitSectionNavContent> = {
  type: 'gambit_section_nav',
  meta: {
    type: 'gambit_section_nav',
    label: 'Nav - Bottom Section Bar',
    accent: '#111111',
    adminLabel: 'Nav - Bottom Section Bar',
    gradient: 'from-neutral-100 to-white',
    defaultName: 'Nav - Bottom Section Bar',
    aiLabelVi:
      'thanh nav dán đáy khung nhìn: các mục cuộn tới từng phần của trang, mục đang xem có chấm tròn phía trước, cuộn ngang được trên máy nhỏ',
    aiLabelEn:
      'section nav bar pinned to the viewport bottom: anchor items scroll to page sections, the active item shows a leading dot, scrolls horizontally on small screens',
  },
  // dynamic để webpack tách chunk per-block (audit FE 2026-07-04 P1).
  component: dynamic(() =>
    import('../../GambitSectionNav').then(m => m.GambitSectionNav)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    ...gambitSectionNavLinkElements(DEFAULT_NAV_LINKS),
    {
      key: 'navLinks',
      label: 'Thêm / quản lý mục',
      icon: List,
    },
  ],
};
