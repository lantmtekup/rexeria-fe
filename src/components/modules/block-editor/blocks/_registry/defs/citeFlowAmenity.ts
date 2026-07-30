import { ListChecks, Type, Video } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { CiteFlowAmenityContent } from '../../../types';
import type { LayerElement } from '../../../LayersPanel';
import type { BlockDef } from '../types';

const DEFAULT_LIST_ITEMS = [
  'Lush greenery, forested corridors, walking paths beside water.',
  'Views, fresh air, natural microclimate.',
];

const CONTENT: CiteFlowAmenityContent = {
  heading: 'Onsen & Wellness Pavilion',
  videoUrl: '/cite-flow/amenity-loop.mp4',
  listItems: DEFAULT_LIST_ITEMS,
};

export const citeFlowAmenityListElements = (
  items: string[]
): LayerElement[] => {
  const list = items.length > 0 ? items : DEFAULT_LIST_ITEMS;
  return list.map((_, i) => ({
    key: `listItems[${i}]`,
    label: `Mục ${i + 1}`,
    icon: Type,
    fieldType: 'text' as const,
  }));
};

export const citeFlowAmenityDef: BlockDef<CiteFlowAmenityContent> = {
  type: 'cite_flow_amenity',
  meta: {
    type: 'cite_flow_amenity',
    label: 'Cite Flow Amenity',
    accent: '#3f6b4f',
    adminLabel: 'Cite Flow Amenity',
    gradient: 'from-emerald-800 to-neutral-900',
    defaultName: 'Cite Flow Amenity',
    aiLabelVi: 'heading + video dính (sticky) bị cuộn đè lên + list bullet',
    aiLabelEn: 'heading + sticky video scrolling over it + bullet list',
  },
  component: dynamic(() =>
    import('../../CiteFlowAmenity').then(m => m.CiteFlowAmenity)
  ),
  defaultContent: { vi: CONTENT, en: CONTENT },
  elements: [
    { key: 'heading', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'videoUrl', label: 'Video', icon: Video, fieldType: 'image' },
    ...citeFlowAmenityListElements(DEFAULT_LIST_ITEMS),
    {
      key: 'listItems',
      label: 'Thêm / quản lý mục',
      icon: ListChecks,
    },
  ],
};
