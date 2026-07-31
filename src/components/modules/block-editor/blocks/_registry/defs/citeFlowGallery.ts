import { Image as ImageIcon, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { CiteFlowGalleryContent } from '../../../types';
import type { BlockDef } from '../types';

const CONTENT: CiteFlowGalleryContent = {
  image1Url: '/cite-flow/stats-bg.jpg',
  image1Alt: 'Ecopark Onsen garden walkway',
  image2Url: '/cite-flow/contact-spa.webp',
  image2Alt: 'Ecopark Onsen wellness lounge by the pool',
};

export const citeFlowGalleryDef: BlockDef<CiteFlowGalleryContent> = {
  type: 'cite_flow_gallery',
  meta: {
    type: 'cite_flow_gallery',
    label: 'Cite Flow Gallery',
    accent: '#3f6b4f',
    adminLabel: 'Cite Flow Gallery',
    gradient: 'from-emerald-800 to-neutral-900',
    defaultName: 'Cite Flow Gallery',
    aiLabelVi: '2 ảnh cạnh nhau, bo góc',
    aiLabelEn: 'two rounded images side by side',
  },
  component: dynamic(() =>
    import('../../CiteFlowGallery').then(m => m.CiteFlowGallery)
  ),
  defaultContent: { vi: CONTENT, en: CONTENT },
  elements: [
    {
      key: 'image1Url',
      label: 'Ảnh 1',
      groupId: 'image1',
      groupLabel: 'Ảnh 1',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'image1Alt',
      label: 'Alt',
      groupId: 'image1',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'image2Url',
      label: 'Ảnh 2',
      groupId: 'image2',
      groupLabel: 'Ảnh 2',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'image2Alt',
      label: 'Alt',
      groupId: 'image2',
      icon: Type,
      fieldType: 'text',
    },
  ],
};
