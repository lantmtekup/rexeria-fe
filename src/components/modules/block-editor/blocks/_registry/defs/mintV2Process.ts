/**
 * BlockDef cho `mintv2_process` — timeline zigzag + đường giữa vẽ theo scroll.
 * Port từ apps/mintcoin-v2 ProcessSection. Path A registry.
 */
import { ListChecks, Palette, Pilcrow, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type { MintV2ProcessContent, MintV2ProcessStep } from '../../../types';
import type { BlockDef } from '../types';

const VI_STEPS: MintV2ProcessStep[] = [
  {
    key: 's1',
    no: '01',
    title: 'The Painting',
    body: 'Tom Thomson paints The Jack Pine at Algonquin Park, capturing a windswept tree above an Ontario lake (1916–17).',
  },
  {
    key: 's2',
    no: '02',
    title: 'Engraving Sketch',
    body: 'RCM master engravers translate the brushwork into millimetric relief — every needle, crag, and ripple plotted by hand.',
  },
  {
    key: 's3',
    no: '03',
    title: 'Die Cutting',
    body: "Reverse and obverse dies are CNC-cut to the engraver's spec, then hand-finished for proof-level polish and frost zones.",
  },
  {
    key: 's4',
    no: '04',
    title: 'The Strike',
    body: '1006.1 g of .99999 fine gold blanks are struck under specialised dies designed for kilo-scale coins. Multiple strikes ensure relief depth.',
  },
  {
    key: 's5',
    no: '05',
    title: 'Presentation',
    body: 'Each coin is encapsulated and presented in a Royal Canadian Mint–branded wooden case with black beauty box and serialised certificate.',
  },
];

const VI: MintV2ProcessContent = {
  eyebrow: 'The Making',
  title: 'From Brush to Strike',
  steps: VI_STEPS,
};

/** Layers folders — 1 group / process step. */
export const mintV2ProcessStepElements = (
  steps: MintV2ProcessStep[]
): LayerElement[] => {
  const list = steps.length > 0 ? steps : VI_STEPS;
  return list.flatMap((step, i) => {
    const groupId = `step${i}`;
    const groupLabel = step.title?.trim() || `Bước ${i + 1}`;
    return [
      {
        key: `steps[${i}].no`,
        label: 'Số bước',
        groupId,
        groupLabel,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `steps[${i}].title`,
        label: 'Tiêu đề',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `steps[${i}].body`,
        label: 'Mô tả',
        groupId,
        icon: Pilcrow,
        fieldType: 'textarea' as const,
      },
    ];
  });
};

export const mintV2ProcessDef: BlockDef<MintV2ProcessContent> = {
  type: 'mintv2_process',
  meta: {
    type: 'mintv2_process',
    category: 'progress',
    style: 'modern',
    tags: ['mint', 'process'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'MintV2 · Process',
    accent: '#c79119',
    adminLabel: 'MintV2 Process',
    gradient: 'from-yellow-600 to-amber-800',
    defaultName: 'Process',
    aiLabelVi: 'timeline các bước zigzag + đường giữa vẽ theo scroll',
    aiLabelEn: 'zigzag step timeline with scroll-drawn centre line',
  },
  component: dynamic(() =>
    import('../../MintV2Process').then(m => m.MintV2Process)
  ),
  defaultContent: { vi: VI, en: VI },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Type, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề lớn', icon: Type, fieldType: 'text' },
    { key: 'line', label: 'Đường timeline', icon: Palette },
    { key: 'dot', label: 'Chấm bước', icon: Palette },
    ...mintV2ProcessStepElements(VI_STEPS),
    {
      key: 'steps',
      label: 'Thêm / quản lý bước',
      icon: ListChecks,
    },
  ],
};
