/**
 * BlockDef cho `framer_purevisuals_hero` — port từ framer-recon
 * `recon-purevisuals-hero` (selector `[data-framer-name="Hero Section"]`,
 * URL https://purevisuals.framer.website/).
 *
 * Animation spec được port sang GSAP R1–R6:
 *  - A — Intro: panels fade-in (400ms) → converge + fade-out (1200ms),
 *    tổng ~1.6s.
 *  - B — Scroll: pinned scrub 2 panel tách ra (xPercent 0 → ∓50, ease 'none')
 *    + text rise lockstep (yPercent 100 → 0, opacity + blur).
 *  - E — Reduced motion: panels ẩn, text ở final state.
 *
 * Component: `blocks/FramerPurevisualsHero.tsx`. Renderer tự quản timeline
 * qua `useBlockMotion`, không dùng `BlockMotion` (preset keyframe model).
 */
import { Image as ImageIcon, Pilcrow, Type } from 'lucide-react';

import { FramerPurevisualsHero } from '../../FramerPurevisualsHero';
import type { FramerPurevisualsHeroContent } from '../../../types';
import type { BlockDef } from '../types';

// Ảnh mặc định lấy từ recon assets (img-00…05 trong recon-purevisuals-hero/assets).
// Mảng ảnh cycle cho panel trái — dùng 6 ảnh recon luân phiên mỗi 2 giây.
const RECON_LEFT_IMAGES: string[] = [
  'https://framerusercontent.com/images/47vWLizj8nJWWX1ItmZK8MEspc.png',
  'https://framerusercontent.com/images/HBxgnJ8FM9VWwamRxapfTEQuC0.png',
  'https://framerusercontent.com/images/sDecsdI6g1NtGe3OB8fmMB1Gok.png',
];

// Mảng ảnh cycle cho panel phải — dùng 6 ảnh recon luân phiên mỗi 2 giây.
const RECON_RIGHT_IMAGES: string[] = [
  'https://framerusercontent.com/images/YDcBLDpZXBmQp6m1BDMjM5L5s.png',
  'https://framerusercontent.com/images/l74f4h5ZdL3oqIfpQgSFpe4YPs.png',
  'https://framerusercontent.com/images/u1jYKOqnaDRYWKq9UwqtupJ8EG0.png',
];

const VI: FramerPurevisualsHeroContent = {
  leftImageUrl: RECON_LEFT_IMAGES,
  rightImageUrl: RECON_RIGHT_IMAGES,
  eyebrow: 'Visual creative studio based in NYC',
  heading: 'PureVisuals',
  subheading: 'Blending creativity & strategy for seamless interfaces',
  bgColor: '#ffffff',
  textColor: '#0a0a0a',
};

const EN: FramerPurevisualsHeroContent = {
  ...VI,
};

export const framerPurevisualsHeroDef: BlockDef<FramerPurevisualsHeroContent> =
  {
    type: 'framer_purevisuals_hero',
    meta: {
      type: 'framer_purevisuals_hero',
      label: 'Hero - PureVisuals',
      accent: '#ffffff',
      adminLabel: 'Hero - PureVisuals',
      gradient: 'from-neutral-900 to-neutral-700',
      defaultName: 'Hero - PureVisuals',
      aiLabelVi:
        'block hero PureVisuals (recon spec): 2 flash panel 50/50 đập vào giữa rồi scroll tách ra để lộ heading',
      aiLabelEn:
        'PureVisuals hero (recon spec): two 50/50 flash panels that converge on load and split on scroll to reveal heading',
    },
    component: FramerPurevisualsHero,
    defaultContent: { vi: VI, en: EN },
    elements: [
      {
        key: 'leftImageUrl',
        label: 'Ảnh panel trái',
        icon: ImageIcon,
        fieldType: 'image',
      },
      {
        key: 'rightImageUrl',
        label: 'Ảnh panel phải',
        icon: ImageIcon,
        fieldType: 'image',
      },
      {
        key: 'eyebrow',
        label: 'Eyebrow',
        icon: Type,
        fieldType: 'text',
      },
      {
        key: 'heading',
        label: 'Heading',
        icon: Pilcrow,
        fieldType: 'text',
      },
      {
        key: 'subheading',
        label: 'Subheading',
        icon: Pilcrow,
        fieldType: 'textarea',
      },
    ],
  };
