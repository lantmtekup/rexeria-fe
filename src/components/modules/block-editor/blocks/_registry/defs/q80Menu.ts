/**
 * BlockDef cho `q80_menu` — chrome cố định quadplex80 (logo + MENU overlay
 * vàng + INQUIRE). Component: `blocks/Q80Menu.tsx`. Đăng ký Path A.
 */
import { Image as ImageIcon, Link2, Menu, Phone, Type } from 'lucide-react';

import { Q80Menu } from '../../Q80Menu';
import { Q80_MENU_CONTENT } from './q80Content';
import type { Q80MenuContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: Q80MenuContent = Q80_MENU_CONTENT;
const EN: Q80MenuContent = { ...VI };

export const q80MenuDef: BlockDef<Q80MenuContent> = {
  type: 'q80_menu',
  meta: {
    type: 'q80_menu',
    label: 'Menu - Fullscreen Gold',
    accent: '#7c7262',
    adminLabel: 'Menu - Fullscreen Gold',
    gradient: 'from-amber-100 to-stone-200',
    defaultName: 'Menu - Fullscreen Gold',
    aiLabelVi:
      'chrome cố định: logo serif + nút menu mở overlay vàng fullscreen (ảnh + link đánh số) + nút inquire',
    aiLabelEn:
      'fixed chrome: serif logo + hamburger opening gold fullscreen overlay (image + numbered links) + inquire button',
  },
  component: Q80Menu,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'logoText', label: 'Logo (chữ)', icon: Type, fieldType: 'textarea' },
    { key: 'menuLabel', label: 'Nhãn Menu', icon: Menu, fieldType: 'text' },
    { key: 'closeLabel', label: 'Nhãn Close', icon: Type, fieldType: 'text' },
    {
      key: 'inquireLabel',
      label: 'Nhãn Inquire',
      icon: Link2,
      fieldType: 'text',
    },
    {
      key: 'menuImageUrl',
      label: 'Ảnh menu',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'mainSiteLabel',
      label: 'Nhãn main site',
      icon: Link2,
      fieldType: 'text',
    },
    {
      key: 'creditsTitle',
      label: 'Credits - Tiêu đề',
      icon: Type,
      fieldType: 'textarea',
    },
    { key: 'phone', label: 'Điện thoại', icon: Phone, fieldType: 'text' },
  ],
};
