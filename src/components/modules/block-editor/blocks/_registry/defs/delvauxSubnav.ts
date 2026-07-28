/**
 * BlockDef cho `delvaux_subnav` — thanh `.sticky-menu` của delvaux-clone: pill
 * trắng nổi dán đáy viewport gồm anchor link tới section + nút Book + BUY NOW.
 *
 * Layers: expand links[i].label / targetId + managers; CTAs có URL riêng.
 */
import { Link2, ListChecks, MousePointerClick, Type } from 'lucide-react';

import dynamic from 'next/dynamic';
import type { LayerElement } from '../../../LayersPanel';
import type { DelvauxSubnavContent, DelvauxSubnavLink } from '../../../types';
import type { BlockDef } from '../types';

const DEFAULT_LINKS: DelvauxSubnavLink[] = [
  { label: 'Description', targetId: 'description' },
  { label: 'Discover', targetId: 'discover' },
  { label: 'Information', targetId: 'information' },
];

const VI: DelvauxSubnavContent = {
  links: DEFAULT_LINKS,
  bookLabel: 'Book an appointment',
  bookUrl: '',
  buyLabel: 'buy now',
  buyUrl: '',
};

const EN: DelvauxSubnavContent = { ...VI };

/** Layers folders — 1 group / anchor link. */
export const delvauxSubnavLinkElements = (
  links: DelvauxSubnavLink[]
): LayerElement[] => {
  const list = links.length > 0 ? links : DEFAULT_LINKS;
  return list.flatMap((link, i) => {
    const groupId = `link${i}`;
    const groupLabel = link.label?.trim() || `Link ${i + 1}`;
    return [
      {
        key: `links[${i}].label`,
        label: 'Nhãn',
        groupId,
        groupLabel,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `links[${i}].targetId`,
        label: 'Section id',
        groupId,
        icon: Link2,
        fieldType: 'text' as const,
      },
    ];
  });
};

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
  component: dynamic(() =>
    import('../../DelvauxSubnav').then(m => m.DelvauxSubnav)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    ...delvauxSubnavLinkElements(DEFAULT_LINKS),
    {
      key: 'links',
      label: 'Thêm / quản lý link',
      icon: ListChecks,
    },
    {
      key: 'bookLabel',
      label: 'Nút đặt lịch',
      icon: Type,
      fieldType: 'text',
      groupId: 'book',
      groupLabel: 'Book',
    },
    {
      key: 'bookUrl',
      label: 'URL đặt lịch',
      icon: Link2,
      fieldType: 'text',
      groupId: 'book',
    },
    {
      key: 'buyLabel',
      label: 'Nút mua ngay',
      icon: MousePointerClick,
      fieldType: 'text',
      groupId: 'buy',
      groupLabel: 'Buy',
    },
    {
      key: 'buyUrl',
      label: 'URL mua ngay',
      icon: Link2,
      fieldType: 'text',
      groupId: 'buy',
    },
  ],
};
