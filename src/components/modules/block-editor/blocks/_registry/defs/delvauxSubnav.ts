/**
 * BlockDef cho `delvaux_subnav` — thanh `.sticky-menu` của delvaux-clone: pill
 * trắng nổi dán đáy viewport gồm anchor link tới section (description /
 * discover / information — trùng id gắn sẵn trên DelvauxDetails/Product/
 * Variant) + nút "Book" + nút "BUY NOW" đen.
 *
 * Trên /p pill là position fixed (portal ra body); trong editor render in-flow
 * như một dải preview. Component: `blocks/DelvauxSubnav.tsx`. Path A.
 */
import { Link2, MousePointerClick, Type } from 'lucide-react';

import { DelvauxSubnav } from '../../DelvauxSubnav';
import type { DelvauxSubnavContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: DelvauxSubnavContent = {
  links: [
    { label: 'Description', targetId: 'description' },
    { label: 'Discover', targetId: 'discover' },
    { label: 'Information', targetId: 'information' },
  ],
  bookLabel: 'Book an appointment',
  bookUrl: '',
  buyLabel: 'buy now',
  buyUrl: '',
};

const EN: DelvauxSubnavContent = { ...VI };

export const delvauxSubnavDef: BlockDef<DelvauxSubnavContent> = {
  type: 'delvaux_subnav',
  meta: {
    type: 'delvaux_subnav',
    label: 'Sub-nav - Floating Pill',
    accent: '#111111',
    adminLabel: 'Sub-nav - Floating Pill',
    gradient: 'from-white to-neutral-200',
    defaultName: 'Sub-nav - Floating Pill',
    aiLabelVi:
      'thanh điều hướng pill trắng nổi dán đáy màn hình: anchor link tới section + nút mua hàng',
    aiLabelEn:
      'floating white pill sub-nav pinned to viewport bottom: section anchors + buy button',
  },
  component: DelvauxSubnav,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'links', label: 'Anchor links', icon: Link2, fieldType: 'text' },
    { key: 'bookLabel', label: 'Nút đặt lịch', icon: Type, fieldType: 'text' },
    {
      key: 'buyLabel',
      label: 'Nút mua ngay',
      icon: MousePointerClick,
      fieldType: 'text',
    },
  ],
};
