import scrollMattisM1 from './m1.jpg';
import scrollMattisM2 from './m2.webp';

export const SCROLL_MATTIS_BG_M1 = scrollMattisM1.src;
export const SCROLL_MATTIS_BG_M2 = scrollMattisM2.src;

export const SCROLL_MATTIS_VIDEO =
  'https://framerusercontent.com/assets/Upkc3M9FymIbhcQFUfu8txagv8.mp4';

export type ScrollMattisMediaKind = 'image' | 'video';

export interface ScrollMattisSlide {
  index: number;
  kind: ScrollMattisMediaKind;
  src: string;
  poster?: string;
  title: string;
  categories: [string, string];
  year: string;
  bgWord: string;
}

/** 3 slide theo index (01 → 02 → 03); slide giữa là video. */
export const SCROLL_MATTIS_ITEMS: ScrollMattisSlide[] = [
  {
    index: 1,
    kind: 'image',
    src: SCROLL_MATTIS_BG_M1,
    title: 'Box mode',
    categories: ['BRANDING', 'DEVELOPMENT'],
    year: '2026',
    bgWord: 'BOX MODE',
  },
  {
    index: 2,
    kind: 'video',
    src: SCROLL_MATTIS_VIDEO,
    title: 'Nomad Stays',
    categories: ['FILM', 'EDITORIAL'],
    year: '2026',
    bgWord: 'NOMAD STAYS',
  },
  {
    index: 3,
    kind: 'image',
    src: SCROLL_MATTIS_BG_M2,
    title: 'We run brand',
    categories: ['BRANDING', 'IDENTITY'],
    year: '2026',
    bgWord: 'WE RUN BRAND',
  },
];
