/**
 * BlockDef cho `hero_scroll` — hero scroll-reveal cinematic: 4 ảnh (m1-m4)
 * xếp chồng, mỗi ảnh fullscreen rồi thu nhỏ về khung giữa theo scroll; ảnh sau
 * lộ ra khi ảnh trước còn ~40%. Ảnh bake tĩnh từ assets; chỉ title/subtitle
 * là content editable.
 */
import { Type } from 'lucide-react';

import { HeroScroll } from '../../HeroScroll';
import type { HeroScrollContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: HeroScrollContent = {
  title: 'John Maxwell',
  subtitle: 'GRAPHIC DESIGNER',
};
const EN: HeroScrollContent = {
  title: 'John Maxwell',
  subtitle: 'GRAPHIC DESIGNER',
};

export const heroScrollDef: BlockDef<HeroScrollContent> = {
  type: 'hero_scroll',
  meta: {
    type: 'hero_scroll',
    label: 'Hero Scroll',
    accent: '#171717',
    adminLabel: 'Hero Scroll',
    gradient: 'from-neutral-700 to-neutral-900',
    defaultName: 'Hero Scroll',
    aiLabelVi: 'hero scroll-reveal cinematic: 4 ảnh thu nhỏ về giữa theo cuộn',
    aiLabelEn:
      'cinematic scroll-reveal hero: 4 images shrink to center on scroll',
  },
  component: HeroScroll,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'subtitle', label: 'Phụ đề', icon: Type, fieldType: 'text' },
  ],
};
