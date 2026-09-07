/**
 * BlockDef cho `lecool_footer` — vương miện giữa hai gạch ngang, câu tuyên ngôn,
 * nút mua, dòng bản quyền. Port từ apps/ecommerce-landing Footer.tsx.
 * Path A registry.
 *
 * Không có mảng nào → `elements[]` khai đủ, LayersPanel không cần expand.
 */
import { Copyright, Crown, Link2, ShoppingBag, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LecoolFooterContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: LecoolFooterContent = {
  crownUrl: '/lecool/hero-emblem.png',
  headline: 'The Oldest Fine Leather Goods House in the World.',
  ctaLabel: 'Shop now',
  // Rỗng = "Không link" — author chọn trang / block đích bằng link picker.
  ctaHref: '',
  copyright: '© ReXeR Studio. 2026. All Rights Reserved.',
};

const EN: LecoolFooterContent = { ...VI };

export const lecoolFooterDef: BlockDef<LecoolFooterContent> = {
  type: 'lecool_footer',
  meta: {
    type: 'lecool_footer',
    label: 'Le Cool Move · Footer',
    accent: '#B68D45',
    adminLabel: 'Le Cool Move Footer',
    gradient: 'from-neutral-200 to-neutral-400',
    defaultName: 'Le Cool Move Footer',
    aiLabelVi:
      'footer Le Cool Move: vương miện giữa hai gạch ngang, một câu tuyên ngôn, nút mua viền đen và dòng bản quyền — canh giữa',
    aiLabelEn:
      'Le Cool Move footer: a crown between two hairlines, one statement line, an outlined shop button and a copyright line — all centred',
  },
  component: dynamic(() =>
    import('../../LecoolFooter').then(m => m.LecoolFooter)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'crownUrl', label: 'Vương miện', icon: Crown, fieldType: 'image' },
    {
      key: 'headline',
      label: 'Câu tuyên ngôn',
      icon: Type,
      fieldType: 'textarea',
    },
    {
      key: 'ctaLabel',
      label: 'Nhãn nút',
      groupId: 'cta',
      groupLabel: 'Nút mua',
      icon: ShoppingBag,
      fieldType: 'text',
    },
    {
      key: 'ctaHref',
      label: 'Đích đến',
      groupId: 'cta',
      icon: Link2,
      fieldType: 'link',
    },
    {
      key: 'copyright',
      label: 'Bản quyền',
      icon: Copyright,
      fieldType: 'text',
    },
  ],
};
