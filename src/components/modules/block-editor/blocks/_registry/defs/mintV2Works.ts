/**
 * BlockDef cho `mintv2_works` — gallery hover-morph zigzag + lightbox.
 * Port từ apps/mintcoin-v2 WorksSection. Path A registry.
 */
import { Image as ImageIcon, ListChecks, Palette, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import { IMG as MINT_IMG } from '@/templates/mint-coint/lib/image-cdn';

import type { LayerElement } from '../../../LayersPanel';
import type { MintV2WorkCard, MintV2WorksContent } from '../../../types';
import type { BlockDef } from '../types';

const MINTV2_CDN = 'https://d10zufojjcedud.cloudfront.net/coin-nextjs';
const mintv2Frame = (n: number) =>
  `${MINTV2_CDN}/frames/frame-${String(n).padStart(3, '0')}.webp`;

const VI_CARDS: MintV2WorkCard[] = [
  {
    key: 'w1',
    number: '01',
    jpLabel: 'I',
    category: 'Engraving Detail',
    title: 'LONE PINE',
    hero: MINT_IMG.coinObverse,
    backdrop: MINT_IMG.coinObverse,
    thumbs: [
      MINT_IMG.coinObverse,
      mintv2Frame(12),
      mintv2Frame(36),
      MINT_IMG.painting,
    ],
    bgColor: '#efe9dc',
  },
  {
    key: 'w2',
    number: '02',
    jpLabel: 'II',
    category: 'Polish Finish',
    title: 'SKY & WATER',
    hero: MINT_IMG.coinReverse,
    backdrop: MINT_IMG.coinReverse,
    thumbs: [
      MINT_IMG.coinReverse,
      mintv2Frame(48),
      mintv2Frame(72),
      MINT_IMG.painting,
    ],
    bgColor: '#efe9dc',
  },
  {
    key: 'w3',
    number: '03',
    jpLabel: 'III',
    category: 'Die Geometry',
    title: 'SERRATED EDGE',
    hero: mintv2Frame(84),
    backdrop: MINT_IMG.painting,
    thumbs: [
      mintv2Frame(6),
      mintv2Frame(28),
      mintv2Frame(84),
      MINT_IMG.coinPackaging,
    ],
    bgColor: '#efe9dc',
  },
  {
    key: 'w4',
    number: '04',
    jpLabel: 'IV',
    category: 'Effigy Portrait',
    title: 'CHARLES III',
    hero: MINT_IMG.coinPackaging,
    backdrop: MINT_IMG.coinPackaging,
    thumbs: [
      MINT_IMG.coinPackaging,
      MINT_IMG.coinObverse,
      mintv2Frame(96),
      MINT_IMG.heroStorefront,
    ],
    bgColor: '#efe9dc',
  },
];

const VI: MintV2WorksContent = {
  eyebrow: 'The Details',
  title: 'Forged in Gold',
  cards: VI_CARDS,
};

/** Layers folders — 1 group / card. */
export const mintV2WorksCardElements = (
  cards: MintV2WorkCard[]
): LayerElement[] => {
  const list = cards.length > 0 ? cards : VI_CARDS;
  return list.flatMap((c, i) => {
    const groupId = `card${i}`;
    const groupLabel = c.title?.trim() || `Card ${i + 1}`;
    const thumbs = (c.thumbs ?? []).slice(0, 4);
    const thumbSlots =
      thumbs.length > 0
        ? thumbs
        : [
            MINT_IMG.coinObverse,
            MINT_IMG.coinObverse,
            MINT_IMG.coinObverse,
            MINT_IMG.coinObverse,
          ];

    return [
      {
        key: `cards[${i}].jpLabel`,
        label: 'Nhãn JP',
        groupId,
        groupLabel,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `cards[${i}].category`,
        label: 'Category',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `cards[${i}].title`,
        label: 'Tiêu đề',
        groupId,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `cards[${i}].bgColor`,
        label: 'Màu nền',
        groupId,
        icon: Palette,
        fieldType: 'text' as const,
      },
      {
        key: `cards[${i}].hero`,
        label: 'Ảnh hero',
        groupId,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      {
        key: `cards[${i}].backdrop`,
        label: 'Ảnh backdrop',
        groupId,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
      ...thumbSlots.map((_, ti) => ({
        key: `cards[${i}].thumbs[${ti}]`,
        label: `Thumb ${ti + 1}`,
        groupId,
        icon: ImageIcon,
        fieldType: 'image' as const,
      })),
    ];
  });
};

export const mintV2WorksDef: BlockDef<MintV2WorksContent> = {
  type: 'mintv2_works',
  meta: {
    type: 'mintv2_works',
    category: 'portfolio',
    style: 'modern',
    tags: ['mint', 'works'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-05',
    label: 'MintV2 · Works',
    accent: '#c79119',
    adminLabel: 'MintV2 Works',
    gradient: 'from-amber-500 to-yellow-800',
    defaultName: 'Works',
    aiLabelVi: 'gallery card hover-morph (thumb bay vào) + lightbox',
    aiLabelEn: 'hover-morph gallery cards (fly-in thumbs) + lightbox',
  },
  component: dynamic(() =>
    import('../../MintV2Works').then(m => m.MintV2Works)
  ),
  defaultContent: { vi: VI, en: VI },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Type, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề lớn', icon: Type, fieldType: 'text' },
    ...mintV2WorksCardElements(VI_CARDS),
    {
      key: 'cards',
      label: 'Thêm / quản lý card',
      icon: ListChecks,
    },
  ],
};
