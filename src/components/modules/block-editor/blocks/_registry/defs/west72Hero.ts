/**
 * BlockDef cho `west72_hero` — hero 212 West 72nd + panel "Designed For New
 * Yorkers" trượt vào. Port từ apps/212-west HeroStage. Path A registry.
 */
import {
  AlignLeft,
  Heading1,
  Image as ImageIcon,
  Link2,
  ListChecks,
  Phone,
  Tag,
  Type,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { West72HeroContent, West72NavLink } from '../../../types';
import type { BlockDef } from '../types';

const DEFAULT_NAV: West72NavLink[] = [
  { label: 'THE BUILDING', href: '#' },
  { label: 'RESIDENCES', href: '#' },
  { label: 'AMENITIES', href: '#' },
  { label: 'VIEWS', href: '#' },
  { label: 'NEIGHBORHOOD', href: '#' },
  { label: 'AVAILABILITY', href: '#' },
  { label: 'NEWS & PRESS', href: '#' },
];

const VI: West72HeroContent = {
  logoUrl: '/212-west/logo.svg',
  logoAlt: '212 West 72nd',
  logoHref: '',
  navLinks: DEFAULT_NAV.map(l => ({ ...l })),
  contactLabel: 'CONTACT',
  contactHref: '',
  phoneLabel: 'Call 212 West 72nd',
  phoneHref: 'tel:+12127211200',
  heroImageUrl: '/212-west/background-hero.jpg',
  heroImageAlt: '',
  title: 'Light-Filled Interiors',
  designedTitle: 'Designed For\nNew Yorkers',
  designedVertical: 'By New Yorkers',
  designedBody:
    'CetraRuddy’s principals and lead designers understand the way New Yorkers live because this is their city too. They know space and light are among the most sought-after residential luxuries and thoughtfully conceived floor plans elevate',
  designedImageUrl: '/212-west/designed-for-new-yorkers.jpg',
  designedImageAlt: 'Light-filled living room at 212 West 72nd',
};

const EN: West72HeroContent = {
  ...VI,
  navLinks: DEFAULT_NAV.map(l => ({ ...l })),
};

export const west72HeroDef: BlockDef<West72HeroContent> = {
  type: 'west72_hero',
  meta: {
    type: 'west72_hero',
    category: 'hero',
    style: 'luxury',
    tags: ['clone', '212-west', 'real-estate', 'residence', 'wipe'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-09-07',
    label: '212 West · Hero',
    accent: '#763718',
    adminLabel: '212 West Hero',
    gradient: 'from-stone-900 to-neutral-950',
    defaultName: '212 West Hero',
    aiLabelVi:
      'hero bất động sản 212 West: ảnh full màn + header + tiêu đề, panel "Designed For New Yorkers" trượt vào khi cuộn',
    aiLabelEn:
      'residential hero: full-bleed photo + header + title, "Designed For New Yorkers" panel wipes in on scroll',
  },
  component: dynamic(() => import('../../West72Hero').then(m => m.West72Hero)),
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
      key: 'contactLabel',
      label: 'Nhãn CONTACT',
      icon: Type,
      fieldType: 'text',
      groupId: 'contact',
      groupLabel: 'Nút Contact',
    },
    {
      key: 'contactHref',
      label: 'Link Contact',
      icon: Link2,
      fieldType: 'link',
      groupId: 'contact',
    },
    {
      key: 'phoneLabel',
      label: 'Aria-label nút gọi',
      icon: Tag,
      fieldType: 'text',
      groupId: 'phone',
      groupLabel: 'Nút gọi (mobile)',
    },
    {
      key: 'phoneHref',
      label: 'Link gọi (tel:)',
      icon: Phone,
      fieldType: 'link',
      groupId: 'phone',
    },
    {
      key: 'heroImageUrl',
      label: 'Ảnh hero',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'hero',
      groupLabel: 'Hero',
    },
    {
      key: 'heroImageAlt',
      label: 'Alt ảnh hero',
      icon: Tag,
      fieldType: 'text',
      groupId: 'hero',
    },
    {
      key: 'title',
      label: 'Tiêu đề hero',
      icon: Heading1,
      fieldType: 'text',
      groupId: 'hero',
    },
    {
      key: 'designedTitle',
      label: 'Tiêu đề (mỗi dòng 1 hàng)',
      icon: Heading1,
      fieldType: 'textarea',
      groupId: 'designed',
      groupLabel: 'Panel Designed',
    },
    {
      key: 'designedVertical',
      label: 'Chữ dọc',
      icon: Type,
      fieldType: 'text',
      groupId: 'designed',
    },
    {
      key: 'designedBody',
      label: 'Đoạn mô tả',
      icon: AlignLeft,
      fieldType: 'textarea',
      groupId: 'designed',
    },
    {
      key: 'designedImageUrl',
      label: 'Ảnh panel',
      icon: ImageIcon,
      fieldType: 'image',
      groupId: 'designed',
    },
    {
      key: 'designedImageAlt',
      label: 'Alt ảnh panel',
      icon: Tag,
      fieldType: 'text',
      groupId: 'designed',
    },
    {
      key: 'navLinks',
      label: 'Danh sách nav',
      icon: ListChecks,
      fieldType: 'text',
    },
  ],
};
