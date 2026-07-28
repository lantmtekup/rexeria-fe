/**
 * BlockDef `linea_portfolio` — portfolio heading + 3-column vertical ticker.
 * Port từ 360-admin-cms linea-portfolio (Path A registry).
 */
import { Image as ImageIcon, ListChecks, Type } from 'lucide-react';
import dynamic from 'next/dynamic';

import type { LayerElement } from '../../../LayersPanel';
import type { LineaPortfolioContent, LineaPortfolioItem } from '../../../types';
import type { BlockDef } from '../types';

export const LINEA_IMG = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=70`;

export const LINEA_PORTFOLIO_DEFAULT_IMG = LINEA_IMG(
  '1517245386807-bb43f82c33c4'
);

const DEFAULT_ITEMS: LineaPortfolioItem[] = [
  { img: LINEA_IMG('1517245386807-bb43f82c33c4') },
  { img: LINEA_IMG('1487014679447-9f8336841d58') },
  { img: LINEA_IMG('1486312338219-ce68d2c6f44d') },
  { img: LINEA_IMG('1498050108023-c5249f4df085') },
  { img: LINEA_IMG('1467232004584-a241de8bcf5d') },
  { img: LINEA_IMG('1531403009284-440f080d1e12') },
  { img: LINEA_IMG('1460925895917-afdab827c52f') },
  { img: LINEA_IMG('1551434678-e076c223a692') },
  { img: LINEA_IMG('1556761175-5973dc0f32e7') },
];

const VI: LineaPortfolioContent = {
  eyebrow: 'Works',
  headingPre: 'Collaboration that',
  headingAccent: 'moved',
  headingPost: 'the needle.',
  bgColor: '#ffffff',
  textColor: '#121212',
  items: DEFAULT_ITEMS,
};

const EN: LineaPortfolioContent = { ...VI };

/** Layers folders — 1 group / image slot. */
export const lineaPortfolioItemElements = (
  items: LineaPortfolioItem[]
): LayerElement[] => {
  const list = items.length > 0 ? items : DEFAULT_ITEMS;
  return list.map((item, i) => {
    const groupId = `img${i}`;
    const groupLabel = `Ảnh ${i + 1}`;
    return {
      key: `items[${i}].img`,
      label: 'Ảnh',
      groupId,
      groupLabel,
      icon: ImageIcon,
      fieldType: 'image' as const,
    };
  });
};

export const lineaPortfolioHeadingElements: LayerElement[] = [
  { key: 'eyebrow', label: 'Eyebrow', icon: Type, fieldType: 'text' },
  {
    key: 'headingPre',
    label: 'Tiêu đề (trước)',
    icon: Type,
    fieldType: 'text',
    groupId: 'heading',
    groupLabel: 'Tiêu đề',
  },
  {
    key: 'headingAccent',
    label: 'Tiêu đề (nhấn)',
    icon: Type,
    fieldType: 'text',
    groupId: 'heading',
  },
  {
    key: 'headingPost',
    label: 'Tiêu đề (sau)',
    icon: Type,
    fieldType: 'text',
    groupId: 'heading',
  },
];

export const lineaPortfolioDef: BlockDef<LineaPortfolioContent> = {
  type: 'linea_portfolio',
  meta: {
    type: 'linea_portfolio',
    category: 'portfolio',
    style: 'minimal',
    tags: ['linea', 'portfolio'],
    status: 'ready',
    responsive: true,
    updatedAt: '2026-07-28',
    label: 'Linea · Portfolio',
    accent: '#121212',
    adminLabel: 'Linea Portfolio',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Portfolio',
    aiLabelVi: 'portfolio: heading + lưới 9 ảnh ticker 3 cột cuộn ngược chiều',
    aiLabelEn: 'portfolio heading + 9-image 3-column scrolling ticker',
  },
  component: dynamic(() =>
    import('../../LineaPortfolio').then(m => m.LineaPortfolio)
  ),
  defaultContent: { vi: VI, en: EN },
  elements: [
    ...lineaPortfolioHeadingElements,
    ...lineaPortfolioItemElements(DEFAULT_ITEMS),
    {
      key: 'items',
      label: 'Thêm / quản lý ảnh',
      icon: ListChecks,
    },
  ],
};
