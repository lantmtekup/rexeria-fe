/**
 * BlockDef cho `westly_residences` — tabs các căn cuối: bản vẽ floor plan có
 * hotspot bung card spec + zoom vào phòng, cột INFORMATION, veil bàn giao.
 * Port từ apps/the-westly FinalResidences.tsx. Path A registry.
 *
 * `residences[]` expand động trong LayersPanel.elementsForType (v1 + v2) —
 * mỗi căn: title / planUrl / listingUrl / floorPlanUrl. details + hotspots là
 * content JSON, sửa qua AI edit.
 */
import { AlignLeft, Palette, Tag, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { WestlyResidencesContent } from '../../../types';
import { WESTLY_DEFAULT_RESIDENCES } from '../../westlyResidencesData';
import type { BlockDef } from '../types';

const VI: WestlyResidencesContent = {
  eyebrow: 'Detailed Specifications',
  title: 'The Final Residences.',
  subtitle:
    '49 of 52 homes at The Westly have found owners. These are the last three.',
  residences: WESTLY_DEFAULT_RESIDENCES,
  bgColor: '#F3F1EA',
  veilColor: '#ffffff',
};

const EN: WestlyResidencesContent = { ...VI };

export const westlyResidencesDef: BlockDef<WestlyResidencesContent> = {
  type: 'westly_residences',
  meta: {
    type: 'westly_residences',
    label: 'The Westly · Residences',
    accent: '#6E7A6F',
    adminLabel: 'The Westly Residences',
    gradient: 'from-stone-200 to-stone-400',
    defaultName: 'The Westly Residences',
    aiLabelVi:
      'residences The Westly: tabs các căn hộ, bản vẽ floor plan có hotspot bung card thông số + zoom vào phòng, cột INFORMATION, veil bàn giao',
    aiLabelEn:
      'The Westly residences: apartment tabs, floor plan with hotspots opening spec cards + room zoom, INFORMATION column, veil hand-off',
  },
  component: dynamic(() =>
    import('../../WestlyResidences').then(m => m.WestlyResidences)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'eyebrow',
      label: 'Eyebrow',
      icon: Tag,
      fieldType: 'text',
      groupId: 'copy',
      groupLabel: 'Header',
    },
    {
      key: 'title',
      label: 'Tiêu đề',
      icon: Type,
      fieldType: 'text',
      groupId: 'copy',
    },
    {
      key: 'subtitle',
      label: 'Mô tả',
      icon: AlignLeft,
      fieldType: 'text',
      groupId: 'copy',
    },
    {
      key: 'bgColor',
      label: 'Màu nền',
      icon: Palette,
      fieldType: 'text',
      groupId: 'colors',
      groupLabel: 'Màu bàn giao',
    },
    {
      key: 'veilColor',
      label: 'Màu veil bàn giao',
      icon: Palette,
      fieldType: 'text',
      groupId: 'colors',
    },
  ],
};
