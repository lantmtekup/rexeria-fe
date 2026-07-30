import { Hash, Image as ImageIcon, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { CiteFlowStatsContent } from '../../../types';
import type { BlockDef } from '../types';

const CONTENT: CiteFlowStatsContent = {
  backgroundImageDesktopUrl: '/cite-flow/stats-bg.jpg',
  backgroundImageMobileUrl: '/cite-flow/stats-md-bg.avif',
  backgroundImageAlt: 'Ecopark Onsen garden boardwalk',
  stat1Value: '500',
  stat1Suffix: ' ha',
  stat1Label: 'The scale behind the project',
  stat2Value: '20',
  stat2Suffix: ' %+',
  stat2Label: 'Land devoted to water and greenery',
  stat3Value: '13',
  stat3Suffix: '',
  stat3Label: 'Therapeutic soaking pools',
  stat4Value: '8.2',
  stat4Suffix: '+ B USD',
  stat4Label: 'Financial investment for project',
};

export const citeFlowStatsDef: BlockDef<CiteFlowStatsContent> = {
  type: 'cite_flow_stats',
  meta: {
    type: 'cite_flow_stats',
    label: 'Cite Flow Stats',
    accent: '#3f6b4f',
    adminLabel: 'Cite Flow Stats',
    gradient: 'from-emerald-800 to-neutral-900',
    defaultName: 'Cite Flow Stats',
    aiLabelVi:
      'dải chỉ số "by the numbers": ảnh nền sticky scale-in + 4 số liệu (đếm lên khi compact, mask-wipe so le khi desktop)',
    aiLabelEn:
      '"by the numbers" stat band: sticky scale-in background + 4 stats (count-up on compact, staggered mask-wipe on desktop)',
  },
  component: dynamic(() =>
    import('../../CiteFlowStats').then(m => m.CiteFlowStats)
  ),
  defaultContent: { vi: CONTENT, en: CONTENT },
  elements: [
    {
      key: 'backgroundImageDesktopUrl',
      label: 'Ảnh nền (desktop)',
      groupId: 'background',
      groupLabel: 'Ảnh nền',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'backgroundImageMobileUrl',
      label: 'Ảnh nền (mobile)',
      groupId: 'background',
      icon: ImageIcon,
      fieldType: 'image',
    },
    {
      key: 'backgroundImageAlt',
      label: 'Alt ảnh nền',
      groupId: 'background',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'stat1Value',
      label: 'Số',
      groupId: 'stat1',
      groupLabel: 'Chỉ số 1',
      icon: Hash,
      fieldType: 'text',
    },
    {
      key: 'stat1Suffix',
      label: 'Hậu tố',
      groupId: 'stat1',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'stat1Label',
      label: 'Nhãn',
      groupId: 'stat1',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'stat2Value',
      label: 'Số',
      groupId: 'stat2',
      groupLabel: 'Chỉ số 2',
      icon: Hash,
      fieldType: 'text',
    },
    {
      key: 'stat2Suffix',
      label: 'Hậu tố',
      groupId: 'stat2',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'stat2Label',
      label: 'Nhãn',
      groupId: 'stat2',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'stat3Value',
      label: 'Số',
      groupId: 'stat3',
      groupLabel: 'Chỉ số 3',
      icon: Hash,
      fieldType: 'text',
    },
    {
      key: 'stat3Suffix',
      label: 'Hậu tố',
      groupId: 'stat3',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'stat3Label',
      label: 'Nhãn',
      groupId: 'stat3',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'stat4Value',
      label: 'Số',
      groupId: 'stat4',
      groupLabel: 'Chỉ số 4',
      icon: Hash,
      fieldType: 'text',
    },
    {
      key: 'stat4Suffix',
      label: 'Hậu tố',
      groupId: 'stat4',
      icon: Type,
      fieldType: 'text',
    },
    {
      key: 'stat4Label',
      label: 'Nhãn',
      groupId: 'stat4',
      icon: Type,
      fieldType: 'text',
    },
  ],
};
