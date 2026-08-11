/**
 * BlockDef cho `cg_page_transitions` — port Codegrid
 * `cg-js-page-transitions` (discord 206): màn phủ 2×5 block scaleY +
 * nav đổi "trang" (Index / About / Contact) trong cùng block.
 */
import { ListChecks, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  CgPageTransitionsContent,
  CgPageTransitionsPage,
} from '../../../types';
import type { BlockDef } from '../types';

export const CG_PAGE_TRANSITIONS_DEFAULT_PAGES: CgPageTransitionsPage[] = [
  { navLabel: 'Home', title: 'Index' },
  { navLabel: 'About', title: 'About' },
  { navLabel: 'Contact', title: 'Contact' },
];

export const CG_PAGE_TRANSITIONS_DEFAULTS = {
  logoText: 'Codegrid',
  pages: CG_PAGE_TRANSITIONS_DEFAULT_PAGES,
} as const satisfies CgPageTransitionsContent;

const VI: CgPageTransitionsContent = {
  logoText: CG_PAGE_TRANSITIONS_DEFAULTS.logoText,
  pages: CG_PAGE_TRANSITIONS_DEFAULT_PAGES.map(p => ({ ...p })),
};

const EN: CgPageTransitionsContent = {
  logoText: CG_PAGE_TRANSITIONS_DEFAULTS.logoText,
  pages: CG_PAGE_TRANSITIONS_DEFAULT_PAGES.map(p => ({ ...p })),
};

export const resolveCgPageTransitionsPages = (
  content: CgPageTransitionsContent | null | undefined
): CgPageTransitionsPage[] => {
  const raw = content?.pages;
  if (!Array.isArray(raw) || raw.length === 0) {
    return CG_PAGE_TRANSITIONS_DEFAULT_PAGES.map(p => ({ ...p }));
  }
  return raw.filter(it => it && typeof it === 'object');
};

export const cgPageTransitionsPageElements = (
  pages: CgPageTransitionsPage[]
): LayerElement[] => {
  const list = pages.length > 0 ? pages : CG_PAGE_TRANSITIONS_DEFAULT_PAGES;
  return list.flatMap((page, i) => {
    const groupId = `page${i}`;
    const groupLabel =
      (page.navLabel ?? page.title ?? '').trim().slice(0, 40) ||
      `Trang ${i + 1}`;
    return [
      {
        key: `pages[${i}].navLabel`,
        label: 'Nav',
        groupId,
        groupLabel,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `pages[${i}].title`,
        label: 'Tiêu đề hero',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
    ];
  });
};

export const cgPageTransitionsDef: BlockDef<CgPageTransitionsContent> = {
  type: 'cg_page_transitions',
  meta: {
    type: 'cg_page_transitions',
    category: 'hero',
    style: 'modern',
    tags: [
      'hero',
      'nav',
      'transition',
      'animation',
      'codegrid',
      'page-transition',
    ],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-08-07',
    label: 'Page Transitions',
    accent: '#746df8',
    adminLabel: 'Page Transitions',
    gradient: 'from-violet-400 to-indigo-600',
    defaultName: 'Page Transitions',
    aiLabelVi:
      'nav + hero tiêu đề lớn; màn phủ 2 hàng × 5 cột block tím scaleY khi đổi trang (reveal / cover)',
    aiLabelEn:
      'nav + large hero title; 2×5 purple block curtain scales Y on page change (reveal / cover)',
  },
  component: dynamic(() =>
    import('../../CgPageTransitions').then(m => m.CgPageTransitions)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'logoText',
      label: 'Logo',
      icon: Type,
      fieldType: 'text',
      groupId: 'brand',
      groupLabel: 'Brand',
    },
    ...cgPageTransitionsPageElements(CG_PAGE_TRANSITIONS_DEFAULT_PAGES),
    {
      key: 'pages',
      label: 'Thêm / quản lý trang',
      icon: ListChecks,
    },
  ],
};
