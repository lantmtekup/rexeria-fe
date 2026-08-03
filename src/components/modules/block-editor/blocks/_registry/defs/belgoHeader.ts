/**
 * BlockDef cho `belgo_header` — header cố định + off-canvas menu GSAP.
 * Port từ apps/belgo Header.tsx. Path A registry.
 */
import {
  Image as ImageIcon,
  Link2,
  ListChecks,
  Menu,
  Tag,
  Type,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { BelgoHeaderContent, BelgoNavLink } from '../../../types';
import type { LayerElement } from '../../../LayersPanel';
import type { BlockDef } from '../types';

const DEFAULT_NAV: BelgoNavLink[] = [
  { label: 'HOME', href: '#hero' },
  { label: 'ABOUT', href: '#about-product' },
  { label: 'BREWING', href: '#brewing-process' },
  { label: 'PRODUCTS', href: '#our-products' },
  { label: 'FLAVORS', href: '#more-flavors' },
  { label: 'CONTACT', href: '#footer' },
];

const VI: BelgoHeaderContent = {
  logoUrl: '/belgo/logo.svg',
  logoAlt: 'Belgő',
  logoHref: '#hero',
  menuLabel: 'MENU',
  menuCloseLabel: 'CLOSE',
  bookTableLabel: 'BOOK A TABLE',
  bookTableHref: '#',
  orderBeerLabel: 'ORDER BEER NOW',
  orderBeerHref: '#',
  menuTagline: 'BELGIAN CRAFT BEER\nHO CHI MINH CITY',
  navLinks: DEFAULT_NAV.map(l => ({ ...l })),
};

const EN: BelgoHeaderContent = {
  ...VI,
  navLinks: DEFAULT_NAV.map(l => ({ ...l })),
};

export const belgoNavLinkElements = (
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

export const belgoHeaderDef: BlockDef<BelgoHeaderContent> = {
  type: 'belgo_header',
  meta: {
    type: 'belgo_header',
    category: 'header',
    style: 'luxury',
    tags: ['clone', 'belgo', 'beer'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-08-03',
    label: 'Belgo · Header',
    accent: '#C9A24B',
    adminLabel: 'Belgo Header',
    gradient: 'from-amber-950 to-neutral-950',
    defaultName: 'Belgo Header',
    aiLabelVi:
      'header craft beer: logo giữa, menu off-canvas GSAP, CTA đặt bàn + order beer',
    aiLabelEn:
      'craft beer fixed header: centered logo, GSAP off-canvas menu, book table + order beer CTAs',
  },
  component: dynamic(() =>
    import('../../BelgoHeader').then(m => m.BelgoHeader)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'logoUrl',
      label: 'Logo',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'logo',
      groupLabel: 'Logo',
    },
    {
      key: 'logoAlt',
      label: 'Alt / aria-label',
      icon: Tag,
      fieldType: 'text',
      groupId: 'logo',
    },
    {
      key: 'logoHref',
      label: 'Link logo',
      icon: Link2,
      fieldType: 'link',
      groupId: 'logo',
    },
    {
      key: 'menuLabel',
      label: 'Nhãn mở menu',
      icon: Menu,
      fieldType: 'text',
      groupId: 'menu',
      groupLabel: 'Menu',
    },
    {
      key: 'menuCloseLabel',
      label: 'Nhãn đóng menu',
      icon: Menu,
      fieldType: 'text',
      groupId: 'menu',
    },
    {
      key: 'bookTableLabel',
      label: 'CTA đặt bàn',
      icon: Type,
      fieldType: 'text',
      groupId: 'bookTable',
      groupLabel: 'Đặt bàn',
    },
    {
      key: 'bookTableHref',
      label: 'Link đặt bàn',
      icon: Link2,
      fieldType: 'link',
      groupId: 'bookTable',
    },
    {
      key: 'orderBeerLabel',
      label: 'CTA order beer',
      icon: Type,
      fieldType: 'text',
      groupId: 'orderBeer',
      groupLabel: 'Order beer',
    },
    {
      key: 'orderBeerHref',
      label: 'Link order beer',
      icon: Link2,
      fieldType: 'link',
      groupId: 'orderBeer',
    },
    {
      key: 'menuTagline',
      label: 'Tagline menu',
      icon: Type,
      fieldType: 'textarea',
      groupId: 'tagline',
      groupLabel: 'Tagline menu',
    },
    {
      key: 'navLinks',
      label: 'Danh sách nav',
      icon: ListChecks,
      fieldType: 'text',
    },
  ],
};
