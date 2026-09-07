/**
 * BlockDef cho `lecool_showcase` — track ảnh chạy ngang trong khối dính đỉnh,
 * cột giữa cố định cross-fade emblem + caption theo mép card.
 * Port từ apps/ecommerce-landing ShowcaseSection.tsx. Path A registry.
 *
 * Mọi field đều nằm trong `cards[]` (dài tuỳ nội dung) nên `elements[]` để
 * trống — slot expand trong LayersPanel.elementsForType.
 */
import dynamic from 'next/dynamic';

import type { LecoolShowcaseContent } from '../../../types';
import { DEFAULT_SHOWCASE_CARDS } from '../../lecoolShowcaseData';
import type { BlockDef } from '../types';

const VI: LecoolShowcaseContent = {
  cards: DEFAULT_SHOWCASE_CARDS.map(card => ({
    ...card,
    images: card.images?.map(image => ({ ...image })),
    captionLines: card.captionLines ? [...card.captionLines] : undefined,
  })),
};

const EN: LecoolShowcaseContent = { ...VI };

export const lecoolShowcaseDef: BlockDef<LecoolShowcaseContent> = {
  type: 'lecool_showcase',
  meta: {
    type: 'lecool_showcase',
    label: 'Le Cool Move · Showcase',
    accent: '#B68D45',
    adminLabel: 'Le Cool Move Showcase',
    gradient: 'from-neutral-300 to-amber-700',
    defaultName: 'Le Cool Move Showcase',
    aiLabelVi:
      'showcase Le Cool Move: khối dính đỉnh, track 2 ảnh chạy ngang theo scroll, cột giữa cố định đổi emblem + caption khi mép card đi qua',
    aiLabelEn:
      'Le Cool Move showcase: sticky stage where a two-image track scrolls sideways while the fixed centre column cross-fades its emblem and caption at each card seam',
  },
  component: dynamic(() =>
    import('../../LecoolShowcase').then(m => m.LecoolShowcase)
  ),
  defaultContent: { vi: VI, en: EN },
  // cards[i].* expand in LayersPanel.elementsForType(lecool_showcase)
  elements: [],
};
