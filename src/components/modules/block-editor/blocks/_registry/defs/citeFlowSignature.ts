import { Image as ImageIcon, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { CiteFlowSignatureContent } from '../../../types';
import type { BlockDef } from '../types';

const CONTENT: CiteFlowSignatureContent = {
  titleTop: 'Explore a new paradigm',
  titleBottom: 'In Residential Wellness',
  serviceTitle: 'Signature Experiences',
  imageUrl: '/cite-flow/onsen-pools.webp',
  imageAlt: 'Ecopark Onsen wellness pavilion',
};

export const citeFlowSignatureDef: BlockDef<CiteFlowSignatureContent> = {
  type: 'cite_flow_signature',
  meta: {
    type: 'cite_flow_signature',
    label: 'Cite Flow Signature',
    accent: '#3f6b4f',
    adminLabel: 'Cite Flow Signature',
    gradient: 'from-emerald-800 to-neutral-900',
    defaultName: 'Cite Flow Signature',
    aiLabelVi:
      'section full-viewport: 4 tấm màn trắng mở dần khi cuộn để lộ ảnh nền, 2 dòng title trượt vào giữa rồi tách ra, cuối cùng lộ title dịch vụ',
    aiLabelEn:
      'full-viewport section: 4 white panels scrub open on scroll to reveal a background image, two title lines slide together then apart, ending with a service title reveal',
  },
  component: dynamic(() =>
    import('../../CiteFlowSignature').then(m => m.CiteFlowSignature)
  ),
  defaultContent: { vi: CONTENT, en: CONTENT },
  elements: [
    {
      key: 'imageUrl',
      label: 'Ảnh nền',
      groupId: 'image',
      groupLabel: 'Ảnh',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'imageAlt',
      label: 'Alt ảnh',
      groupId: 'image',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'titleTop',
      label: 'Tiêu đề — dòng trên',
      icon: Type,
      fieldType: 'textarea',
    },
    {
      key: 'titleBottom',
      label: 'Tiêu đề — dòng dưới',
      icon: Type,
      fieldType: 'textarea',
    },
    {
      key: 'serviceTitle',
      label: 'Tiêu đề dịch vụ',
      icon: Type,
      fieldType: 'text',
    },
  ],
};
