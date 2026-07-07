/**
 * BlockDef cho `scroll_mattis` — scroll reveal "Box Mode" 3 slide (ảnh, video,
 * ảnh). Slide active thu nhỏ + mờ, slide kế zoom in thay thế theo scroll.
 */
import { Type } from 'lucide-react';

import { ScrollMattis } from '../../ScrollMattis';
import type { ScrollMattisContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: ScrollMattisContent = { portfolioLabel: 'PORTFOLIO' };
const EN: ScrollMattisContent = { portfolioLabel: 'PORTFOLIO' };

export const scrollMattisDef: BlockDef<ScrollMattisContent> = {
  type: 'scroll_mattis',
  meta: {
    type: 'scroll_mattis',
    label: 'Scroll - Mattis',
    accent: '#171717',
    adminLabel: 'Scroll - Mattis',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Scroll - Mattis',
    aiLabelVi:
      'scroll reveal 3 slide (ảnh, video, ảnh): slide active thu nhỏ + mờ, slide kế zoom in thay thế theo cuộn',
    aiLabelEn:
      'scroll reveal with 3 slides (image, video, image): active slide shrinks and fades while the next zooms in',
  },
  component: ScrollMattis,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'portfolioLabel', label: 'Nhãn góc', icon: Type, fieldType: 'text' },
  ],
};
