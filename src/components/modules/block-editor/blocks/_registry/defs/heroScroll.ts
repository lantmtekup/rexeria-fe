/**
 * BlockDef cho `hero_scroll` — hero scroll-reveal cinematic: 4 ảnh (m1-m4)
 * xếp chồng, mỗi ảnh fullscreen rồi thu nhỏ về khung giữa theo scroll; ảnh sau
 * lộ ra khi ảnh trước còn ~40%. Title/subtitle + 4 ảnh đều content editable.
 * Default trỏ URL S3 (uploaded 2026-07-10) thay vì asset local —
 * src/assets/images/hero_scroll/*.png vẫn giữ làm fallback cuối cùng trong
 * HeroScroll.tsx cho block cũ chưa có field.
 */
import { Image as ImageIcon, Type } from 'lucide-react';

import { HeroScroll } from '../../HeroScroll';
import type { HeroScrollContent } from '../../../types';
import type { BlockDef } from '../types';

const CDN = 'https://d10zufojjcedud.cloudfront.net/uploads';
const DEFAULT_IMAGES: Pick<
  HeroScrollContent,
  'image1Url' | 'image2Url' | 'image3Url' | 'image4Url'
> = {
  image1Url: `${CDN}/371d88e2-d80d-43b2-bf26-d18b89741b5d/hero_scroll_m2.png`,
  image2Url: `${CDN}/5c152dc9-d73a-4bab-a29c-9731c354234f/hero_scroll_m1.png`,
  image3Url: `${CDN}/090c7d77-8e14-444a-a1de-dedbfa8ce75a/hero_scroll_m3.png`,
  image4Url: `${CDN}/c8b1fadc-72b0-403b-a69f-d1119a50d86d/hero_scroll_m4.png`,
};

const VI: HeroScrollContent = {
  title: 'John Maxwell',
  subtitle: 'GRAPHIC DESIGNER',
  ...DEFAULT_IMAGES,
};
const EN: HeroScrollContent = {
  title: 'John Maxwell',
  subtitle: 'GRAPHIC DESIGNER',
  ...DEFAULT_IMAGES,
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
