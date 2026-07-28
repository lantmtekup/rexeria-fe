import { Image as ImageIcon, Palette, Type, Wallpaper } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type {
  RolexCollectionWorkContent,
  RolexCollectionWorkStage,
} from '../../../types';
import type { BlockDef } from '../types';

const VI_STAGES: RolexCollectionWorkStage[] = [
  { title: 'OYSTER', imageUrl: '/rolex-collection/watch-oyster.webp' },
  {
    title: 'PERPETUAL',
    backgroundColor: '#cc1d1d',
    imageUrl: '/rolex-collection/watch-perpetual.webp',
  },
  {
    title: 'DAYTONA',
    backgroundColor: '#743dff',
    imageUrl: '/rolex-collection/watch-daytona.webp',
  },
  {
    title: 'SUBMARINER',
    backgroundColor: '#1bcc82',
    imageUrl: '/rolex-collection/watch-submariner.webp',
  },
  {
    title: 'SEA DWELER',
    backgroundColor: '#ff8e3d',
    imageUrl: '/rolex-collection/watch-seadweller.webp',
  },
  {
    title: 'DEEP SEA',
    backgroundColor: '#ff8080',
    imageUrl: '/rolex-collection/watch-deepsea.webp',
  },
  {
    title: 'GMT MASTER',
    backgroundColor: '#1d45cc',
    imageUrl: '/rolex-collection/watch-gmtmaster.webp',
  },
];

const VI: RolexCollectionWorkContent = {
  introBackgroundUrl: '/rolex-collection/work-bg.webp',
  ctaLabel: 'Click to Explore',
  stages: VI_STAGES,
};

const EN: RolexCollectionWorkContent = {
  ...VI,
  stages: VI_STAGES,
};

export const rolexCollectionWorkStageElements = (
  stages: RolexCollectionWorkStage[]
): LayerElement[] => {
  const list = stages.length > 0 ? stages : VI_STAGES;
  return list.flatMap((stage, i) => {
    const groupId = `stage${i}`;
    const groupLabel = stage.title || `Giai đoạn ${i + 1}`;
    return [
      {
        key: `stages[${i}].imageUrl`,
        label: 'Ảnh đồng hồ',
        groupId,
        groupLabel,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `stages[${i}].title`,
        label: 'Tiêu đề',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `stages[${i}].backgroundColor`,
        label: 'Màu nền (hex)',
        groupId,
        icon: Palette,
        fieldType: 'text' as const,
      },
      {
        key: `stages[${i}].backgroundImageUrl`,
        label: 'Ảnh nền (thay cho màu)',
        groupId,
        icon: Wallpaper,
        fieldType: 'image' as const,
      },
    ];
  });
};

export const rolexCollectionWorkDef: BlockDef<RolexCollectionWorkContent> = {
  type: 'rolex_collection_work',
  meta: {
    type: 'rolex_collection_work',
    label: 'Rolex Collection Work',
    accent: '#ffffff',
    adminLabel: 'Rolex Collection Work',
    gradient: 'from-neutral-900 to-black',
    defaultName: 'Rolex Collection Work',
    aiLabelVi:
      'showcase pin-scroll 7 model đồng hồ Rolex: mỗi giai đoạn đổi màu nền + tiêu đề chữ lớn + ảnh đồng hồ lật 3D (Oyster/Perpetual/Daytona/Submariner/Sea Dweler/Deep Sea/GMT Master)',
    aiLabelEn:
      'scroll-pinned 7-stage Rolex watch showcase: each stage swaps background color + large title + 3D-flip watch image (Oyster/Perpetual/Daytona/Submariner/Sea Dweler/Deep Sea/GMT Master)',
  },
  component: dynamic(() =>
    import('../../RolexCollectionWork').then(m => m.RolexCollectionWork)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    {
      key: 'introBackgroundUrl',
      label: 'Ảnh nền intro',
      icon: ImageIcon,
      fieldType: 'image',
    },
    { key: 'ctaLabel', label: 'CTA', icon: Type, fieldType: 'text' },
    ...rolexCollectionWorkStageElements(VI_STAGES),
  ],
};
