/**
 * BlockDef cho `springs_header` — thanh nav dán trên cùng (section
 * `.header.header--sticky` của springs-estate-clone): logo căn giữa, "MENU"
 * trái, "Residences" + "Contact us" + tim yêu thích phải.
 *
 * Component: `blocks/SpringsHeader.tsx`. Đăng ký Path A.
 */
import { Link2, Menu, MousePointerClick, Type } from 'lucide-react';

import { SpringsHeader } from '../../SpringsHeader';
import type { SpringsHeaderContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: SpringsHeaderContent = {
  logoText: 'Springs',
  menuLabel: 'Menu',
  residencesLabel: 'Residences',
  contactLabel: 'Contact us',
  navLinks: [
    { label: 'Residences', href: '#residences' },
    { label: 'Design', href: '#design' },
    { label: 'Location', href: '#location' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'About', href: '#about' },
  ],
};

const EN: SpringsHeaderContent = {
  ...VI,
  navLinks: VI.navLinks.map(l => ({ ...l })),
};

export const springsHeaderDef: BlockDef<SpringsHeaderContent> = {
  type: 'springs_header',
  meta: {
    type: 'springs_header',
    label: 'Springs - Header',
    accent: '#173620',
    adminLabel: 'Springs - Header',
    gradient: 'from-emerald-950 to-emerald-800',
    defaultName: 'Springs - Header',
    aiLabelVi:
      'header bất động sản: logo giữa, menu + residences + contact us, icon yêu thích',
    aiLabelEn:
      'real-estate sticky header: centered logo, menu trigger, residences + contact us links, favourite icon',
  },
  component: SpringsHeader,
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'logoText',
      label: 'Logo (chữ, a11y)',
      icon: Type,
      fieldType: 'text',
    },
    { key: 'menuLabel', label: 'Nhãn nút Menu', icon: Menu, fieldType: 'text' },
    {
      key: 'residencesLabel',
      label: 'Link "Residences"',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'contactLabel',
      label: 'Link "Contact us"',
      icon: MousePointerClick,
      fieldType: 'text',
    },
    {
      key: 'navLinks',
      label: 'Danh sách menu',
      icon: Link2,
      fieldType: 'text',
    },
  ],
};
