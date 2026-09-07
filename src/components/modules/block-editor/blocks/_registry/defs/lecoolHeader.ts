/**
 * BlockDef cho `lecool_header` — thanh dính đỉnh 72px của Le Cool Move.
 * Port từ apps/ecommerce-landing Header.tsx. Path A registry.
 *
 * `navItems[i].*` và `actions[i].iconUrl` expand trong
 * LayersPanel.elementsForType.
 */
import {
  Image as ImageIcon,
  Link2,
  Search,
  TextCursorInput,
} from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LecoolHeaderContent } from '../../../types';
import {
  DEFAULT_HEADER_ACTIONS,
  DEFAULT_HEADER_NAV,
} from '../../lecoolHeaderData';
import type { BlockDef } from '../types';

const VI: LecoolHeaderContent = {
  logoUrl: '/lecool/header/logo.png',
  logoAlt: 'Le Cool Move',
  logoHref: '',
  navItems: DEFAULT_HEADER_NAV.map(item => ({ ...item })),
  searchIconUrl: '/lecool/header/icon-search.svg',
  searchPlaceholder: 'Search',
  actions: DEFAULT_HEADER_ACTIONS.map(action => ({ ...action })),
};

const EN: LecoolHeaderContent = { ...VI };

export const lecoolHeaderDef: BlockDef<LecoolHeaderContent> = {
  type: 'lecool_header',
  meta: {
    type: 'lecool_header',
    label: 'Le Cool Move · Header',
    accent: '#B68D45',
    adminLabel: 'Le Cool Move Header',
    gradient: 'from-white to-neutral-400',
    defaultName: 'Le Cool Move Header',
    aiLabelVi:
      'header Le Cool Move: thanh dính đỉnh cao 72px với logo, nav ngang, ô tìm kiếm và 3 nút icon; khổ hẹp thu về hamburger mở nav xổ xuống',
    aiLabelEn:
      'Le Cool Move header: a 72px sticky bar with logo, inline nav, search field and three icon buttons; narrow widths collapse to a hamburger with a drop-down nav',
  },
  component: dynamic(() =>
    import('../../LecoolHeader').then(m => m.LecoolHeader)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'logoUrl',
      label: 'Ảnh logo',
      groupId: 'logo',
      groupLabel: 'Logo',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'logoHref',
      label: 'Đích đến',
      groupId: 'logo',
      icon: Link2,
      fieldType: 'link',
    },
    {
      key: 'searchIconUrl',
      label: 'Icon kính lúp',
      groupId: 'search',
      groupLabel: 'Ô tìm kiếm',
      icon: Search,
      fieldType: 'image',
    },
    {
      key: 'searchPlaceholder',
      label: 'Placeholder',
      groupId: 'search',
      icon: TextCursorInput,
      fieldType: 'text',
    },
    // navItems[i].* + actions[i].iconUrl expand in LayersPanel
  ],
};
