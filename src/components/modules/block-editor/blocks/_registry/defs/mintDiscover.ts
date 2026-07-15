/**
 * BlockDef cho `mint_discover` — sticky scroll-sequence + hotspot drawer.
 * Port từ apps/mintcoin ProductDetailSection. Path A registry.
 */
import { Image as ImageIcon, Layers, ListChecks, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type { MintDiscoverContent, MintDiscoverTab } from '../../../types';
import { IMG as MINT_IMG } from '@/templates/mint-coint/lib/image-cdn';
import type { BlockDef } from '../types';

const VI_TABS: MintDiscoverTab[] = [
  {
    key: 'tab1',
    label: 'The Lone Pine',
    desc: "Tom Thomson's windswept jack pine, rising from rocky ground above a northern lake. The kilo-sized canvas allows the engraver to lift every needle, branch and crag from the painting into 99.99% pure gold relief.",
    img: MINT_IMG.coinReverse,
    dotX: 50,
    dotY: 30,
  },
  {
    key: 'tab2',
    label: 'Sky and Water',
    desc: "A monochromatic field of polished and frosted gold replaces the painting's sunset palette, deepening the impact of Thomson's dynamic composition.",
    img: MINT_IMG.coinReverse,
    dotX: 62,
    dotY: 62,
  },
  {
    key: 'tab3',
    label: 'Serrated Edge',
    desc: '101.6 mm in diameter with a serrated edge — a tactile signature of Royal Canadian Mint craftsmanship at this scale.',
    img: MINT_IMG.coinReverse,
    dotX: 38,
    dotY: 62,
  },
];

const EN_TABS: MintDiscoverTab[] = [
  {
    key: 'tab1',
    label: 'King Charles III Effigy',
    desc: 'The effigy of His Majesty King Charles III by Canadian artist Steven Rosati anchors the obverse — the contemporary face of Canadian numismatic art.',
    img: MINT_IMG.coinObverse,
    dotX: 50,
    dotY: 35,
  },
  {
    key: 'tab2',
    label: '99.99% Pure Gold',
    desc: '1006.1 g of .99999 fine gold, proof finish. Each strike is hand-inspected and serialised — only 75 will ever exist.',
    img: MINT_IMG.coinReverse,
    dotX: 50,
    dotY: 65,
  },
];

const VI: MintDiscoverContent = {
  variant: '1',
  mainImage: MINT_IMG.coinReverse,
  mainAlt: 'Jack Pine Gold Coin — reverse',
  tabs: VI_TABS,
};

const EN: MintDiscoverContent = {
  variant: '2',
  mainImage: MINT_IMG.coinObverse,
  mainAlt: 'Jack Pine Gold Coin — obverse',
  tabs: EN_TABS,
};

/** Layers folders — 1 group / hotspot. */
export const mintDiscoverTabElements = (
  tabs: MintDiscoverTab[]
): LayerElement[] => {
  const list = tabs.length > 0 ? tabs : VI_TABS;
  return list.flatMap((t, i) => {
    const groupId = `tab${i}`;
    const groupLabel = t.label?.trim() || `Hotspot ${i + 1}`;
    return [
      {
        key: `tabs[${i}].label`,
        label: 'tiêu đề',
        groupId,
        groupLabel,
        icon: Type,
        fieldType: 'text' as const,
      },
      {
        key: `tabs[${i}].desc`,
        label: 'mô tả',
        groupId,
        icon: Type,
        fieldType: 'textarea' as const,
      },
      {
        key: `tabs[${i}].img`,
        label: 'ảnh drawer',
        groupId,
        icon: ImageIcon,
        fieldType: 'image' as const,
      },
    ];
  });
};

export const mintDiscoverDef: BlockDef<MintDiscoverContent> = {
  type: 'mint_discover',
  meta: {
    type: 'mint_discover',
    label: 'Mint · Discover',
    accent: '#a16207',
    adminLabel: 'Mint Discover',
    gradient: 'from-amber-600 to-yellow-800',
    defaultName: 'Mint Discover',
    aiLabelVi:
      'section khám phá chi tiết coin: sticky scroll-sequence + hotspot + drawer',
    aiLabelEn:
      'coin detail discover: sticky scroll-sequence + hotspots + drawer',
  },
  component: dynamic(() =>
    import('../../MintDiscover').then(m => m.MintDiscover)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'variant', label: 'Theme variant', icon: Layers },
    {
      key: 'mainImage',
      label: 'Ảnh coin',
      icon: ImageIcon,
      fieldType: 'image',
    },
    { key: 'mainAlt', label: 'Alt ảnh', icon: Type, fieldType: 'text' },
    { key: 'cardSurface', label: 'Thẻ info (nền)', icon: Layers },
    ...mintDiscoverTabElements(VI_TABS),
    {
      key: 'tabs',
      label: 'Hotspot / chi tiết',
      icon: ListChecks,
    },
  ],
};
