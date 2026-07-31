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
import { Image as ImageIcon, ListChecks, Pilcrow, Type } from 'lucide-react';

import dynamic from 'next/dynamic';
import type { LayerElement } from '../../../LayersPanel';
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

/** 2 panel = 2 mảng ảnh độc lập; key trùng field content. */
export const FRAMER_PUREVISUALS_PANEL_KEYS = [
  'leftImageUrl',
  'rightImageUrl',
] as const;

export type FramerPurevisualsPanelKey =
  (typeof FRAMER_PUREVISUALS_PANEL_KEYS)[number];

export const FRAMER_PUREVISUALS_PANEL_LABEL: Record<
  FramerPurevisualsPanelKey,
  string
> = {
  leftImageUrl: 'Ảnh panel trái',
  rightImageUrl: 'Ảnh panel phải',
};

export function isFramerPurevisualsPanelKey(
  key: string
): key is FramerPurevisualsPanelKey {
  return (FRAMER_PUREVISUALS_PANEL_KEYS as readonly string[]).includes(key);
}

/** `leftImageUrl[2]` → { panel, index }; null nếu không phải slot ảnh panel. */
export function parseFramerPurevisualsPanelImageKey(
  key: string
): { panel: FramerPurevisualsPanelKey; index: number } | null {
  const m = key.match(/^(leftImageUrl|rightImageUrl)\[(\d+)\]$/);
  if (!m) return null;
  return { panel: m[1] as FramerPurevisualsPanelKey, index: Number(m[2]) };
}

/**
 * Content cũ lưu 1 string (trước khi panel thành carousel) → normalize về
 * `string[]`. Dùng chung block / toolbar / Lớp để 3 nơi không lệch nhau.
 *
 * GIỮ NGUYÊN index của mảng gốc (phần tử rỗng/không hợp lệ → `''`, không bị
 * lọc bỏ) — key layer `leftImageUrl[2]` ghi thẳng vào index 2 của content, lọc
 * ở đây sẽ làm lệch index và sửa nhầm ảnh khác. Chỗ render tự `.filter(Boolean)`.
 */
export function resolveFramerPurevisualsPanelImages(
  content: Partial<FramerPurevisualsHeroContent> | null | undefined,
  panel: FramerPurevisualsPanelKey
): string[] {
  const raw = content?.[panel];
  if (Array.isArray(raw)) {
    return raw.map(src => (typeof src === 'string' ? src : ''));
  }
  return typeof raw === 'string' && raw ? [raw] : [];
}

/** URL seed khi bấm "Thêm ảnh" (ảnh đầu của panel tương ứng). */
export const FRAMER_PUREVISUALS_NEW_IMAGE: Record<
  FramerPurevisualsPanelKey,
  string
> = {
  leftImageUrl: RECON_LEFT_IMAGES[0],
  rightImageUrl: RECON_RIGHT_IMAGES[0],
};

/**
 * `groupId` PHẢI khác key content: LayersPanel render node folder với
 * `key={groupId}` cạnh row "Thêm / quản lý ảnh" (`key='leftImageUrl'`) — trùng
 * là React báo duplicate key.
 */
const FRAMER_PUREVISUALS_PANEL_GROUP_ID: Record<
  FramerPurevisualsPanelKey,
  string
> = {
  leftImageUrl: 'pvhLeftImages',
  rightImageUrl: 'pvhRightImages',
};

/** 1 layer / ảnh, gom vào 1 folder collapsible trong panel Lớp. */
export const framerPurevisualsPanelImageElements = (
  panel: FramerPurevisualsPanelKey,
  images: string[]
): LayerElement[] =>
  images.map((_, i) => ({
    key: `${panel}[${i}]`,
    label: `Ảnh ${i + 1}`,
    groupId: FRAMER_PUREVISUALS_PANEL_GROUP_ID[panel],
    ...(i === 0 ? { groupLabel: FRAMER_PUREVISUALS_PANEL_LABEL[panel] } : {}),
    icon: ImageIcon,
    fieldType: 'image' as const,
  }));

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
    // dynamic để webpack tách chunk per-block (audit FE 2026-07-04 P1).
    component: dynamic(() =>
      import('../../FramerPurevisualsHero').then(m => m.FramerPurevisualsHero)
    ),
    defaultContent: { vi: VI, en: EN },
    elements: [
      // KHÔNG đặt `fieldType: 'image'` — 2 key này là mảng carousel; fieldType
      // image làm resolveKind trả 'image' và ImageControls ghi 1 URL đè cả mảng.
      {
        key: 'leftImageUrl',
        label: 'Thêm / quản lý ảnh trái',
        icon: ListChecks,
      },
      {
        key: 'rightImageUrl',
        label: 'Thêm / quản lý ảnh phải',
        icon: ListChecks,
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
