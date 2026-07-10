/**
 * BlockDef cho `hero_scroll` — hero scroll-reveal cinematic: 4 ảnh (m1-m4)
 * xếp chồng, mỗi ảnh fullscreen rồi thu nhỏ về khung giữa theo scroll; ảnh sau
 * lộ ra khi ảnh trước còn ~40%. Title/subtitle + 4 ảnh đều content editable.
 */
import { Image as ImageIcon, Type } from 'lucide-react';

import { HERO_SCROLL_IMAGES } from '@/assets/images/hero_scroll';

import { HeroScroll } from '../../HeroScroll';
import type { HeroScrollContent } from '../../../types';
import type { BlockDef } from '../types';

const VI: HeroScrollContent = {
  title: 'John Maxwell',
  subtitle: 'GRAPHIC DESIGNER',
  image1Url: HERO_SCROLL_IMAGES[0],
  image2Url: HERO_SCROLL_IMAGES[1],
  image3Url: HERO_SCROLL_IMAGES[2],
  image4Url: HERO_SCROLL_IMAGES[3],
};
const EN: HeroScrollContent = {
  title: 'John Maxwell',
  subtitle: 'GRAPHIC DESIGNER',
  image1Url: HERO_SCROLL_IMAGES[0],
  image2Url: HERO_SCROLL_IMAGES[1],
  image3Url: HERO_SCROLL_IMAGES[2],
  image4Url: HERO_SCROLL_IMAGES[3],
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
    { key: 'image1Url', label: 'Ảnh 1', icon: ImageIcon, fieldType: 'image' },
    { key: 'image2Url', label: 'Ảnh 2', icon: ImageIcon, fieldType: 'image' },
    { key: 'image3Url', label: 'Ảnh 3', icon: ImageIcon, fieldType: 'image' },
    { key: 'image4Url', label: 'Ảnh 4', icon: ImageIcon, fieldType: 'image' },
  ],
};
