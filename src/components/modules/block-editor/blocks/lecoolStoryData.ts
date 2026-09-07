/**
 * Hằng số + normalizer cho block `lecool_story`.
 *
 * Content do author (hoặc AI) sửa nên mọi mảng đều có thể thiếu / rỗng / sai
 * kiểu. Canvas, LayersPanel và ElementToolbar phải đọc CÙNG một normalizer,
 * nếu không số slot trong panel Lớp sẽ lệch với số node trên canvas.
 */
import type * as React from 'react';

import type {
  LecoolStoryAction,
  LecoolStoryCard,
  LecoolStoryColor,
  LecoolStoryContent,
  LecoolStoryDetailRow,
  LecoolStorySpec,
} from '../types';

/**
 * Props mọi panel con nhận từ block cha. Panel KHÔNG tự đọc `styles` /
 * `positions` — cha đã gộp sẵn thành `styleOf` để một key chỉ có một nguồn.
 */
export interface LecoolStoryPanelProps {
  content: LecoolStoryContent;
  styleOf: (key: string) => React.CSSProperties | undefined;
  activeKey?: string | null;
  /** Canvas editor: layout phẳng, bỏ sticky/scrub/zoom, không nhận click. */
  isCanvas: boolean;
  /** Container ≥ 896px (@4xl) — layout 2 cột, thay cho `lg:` của apps. */
  isDesktop: boolean;
}

/** Khung Figma của 2 panel ảnh — mọi toạ độ hotspot quy chiếu theo hộp này. */
export const PANE_W = 1086;
export const PANE_H = 840;

export const CROWN_W = 159;
export const CROWN_H = 118;

const ITEM_H = 26;
const ITEM_GAP = 32;
/** Chiều cao khối menu: vương miện + 3 nhãn + 2 khoảng cách = 260. */
export const MENU_STACK_H = CROWN_H + ITEM_H * 3 + ITEM_GAP * 2;

/** Bề rộng rail menu ở desktop. */
export const RAIL_W = 354;

export const DEFAULT_CROWN = '/lecool/hero-emblem.png';
export const DEFAULT_DETAILS_IMAGE = '/lecool/story/details-bag.jpg';

/**
 * Vị trí vương miện + 3 nhãn khi mục `active` đang mở: vương miện chen vào
 * NGAY TRÊN nhãn đang chọn, các nhãn dưới nó bị đẩy xuống.
 */
export function menuLayout(active: number, count: number) {
  let y = 0;
  let crownTop = 0;
  const itemTop: number[] = [];

  for (let i = 0; i < count; i += 1) {
    if (i === active) {
      crownTop = y;
      y += CROWN_H;
    }
    itemTop.push(y);
    y += ITEM_H;
    if (i < count - 1) y += ITEM_GAP;
  }

  return { crownTop, itemTop };
}

/* ── Default content ─────────────────────────────────────────────────────── */

export const DEFAULT_MENU_LABELS = ['Design', 'Details', 'Products'];

export const DEFAULT_DESIGN_PARAGRAPHS = [
  'Extending the world of the Cool Box, it softens the structure entirely: supple Sellier Calf leather, freer movement, and a silhouette designed to follow the body rather than argue with it.',
  'The signature strap and emblematic D remain, though with a noticeably lighter state of mind.',
];

export const DEFAULT_DESIGN_CARDS: LecoolStoryCard[] = [
  {
    imageUrl: '/lecool/story/design-rain.jpg',
    caption: 'Le Cool Move - Rain',
  },
  {
    imageUrl: '/lecool/story/design-morning-dew.jpg',
    caption: 'Le Cool Move - Morning Dew',
  },
];

export const DEFAULT_DETAIL_ROWS: LecoolStoryDetailRow[] = [
  {
    label: 'Sellier grained Calf leather',
    thumbUrl: '/lecool/story/details-thumb-1.webp',
    x: 449,
    y: 312,
  },
  {
    label: 'Soft and silky goatskin lining',
    thumbUrl: '/lecool/story/details-thumb-2.webp',
    x: 589,
    y: 217,
  },
  {
    label: 'Hidden zip closure and D-shaped buckle',
    thumbUrl: '/lecool/story/details-thumb-3.webp',
    x: 747,
    y: 349,
  },
  {
    label: '1 interior flat pocket',
    thumbUrl: '/lecool/story/details-thumb-4.webp',
    x: 527,
    y: 537,
  },
  {
    label: 'Removable and adjustable leather shoulder strap',
    thumbUrl: '/lecool/story/details-thumb-5.webp',
    x: 746,
    y: 536,
  },
  {
    label: 'Palladium metal hardware',
    thumbUrl: '/lecool/story/details-thumb-hardware.jpg',
    x: 979,
    y: 571,
  },
];

export const DEFAULT_PRODUCT_IMAGES = [
  '/lecool/story/product-1.jpg',
  '/lecool/story/product-2.jpg',
  '/lecool/story/product-3.jpg',
  '/lecool/story/product-4.jpg',
  '/lecool/story/product-5.jpg',
  '/lecool/story/product-6.jpg',
];

export const DEFAULT_PRODUCT_COLORS: LecoolStoryColor[] = [
  { name: 'Rain', from: '#999A97', to: '#343433' },
  { name: 'Sand', from: '#7D745D', to: '#E3D3A9' },
  { name: 'Lilac', from: '#BAB7C8', to: '#5B5A62' },
  { name: 'Noir', from: '#000000', to: '#666666' },
  { name: 'Cacao', from: '#8C6C54', to: '#261D17' },
];

export const DEFAULT_PRODUCT_SPECS: LecoolStorySpec[] = [
  {
    icon: 'ruler',
    label: 'Dimensions',
    value: 'W 26.5 / H 15.5 / D 11 cm (in)',
  },
  { icon: 'bag', label: 'Sizes', value: 'MM' },
];

export const DEFAULT_PRODUCT_ACTIONS: LecoolStoryAction[] = [
  {
    icon: 'bag',
    title: 'Check availability in store',
    sub: 'See if this item is available near you',
  },
  {
    icon: 'phone',
    title: 'Contact us',
    sub: 'Our client advisors are here to help',
  },
  {
    icon: 'calendar',
    title: 'Book an appointment',
    sub: 'Schedule a private viewing',
  },
  { icon: 'pin', title: 'Find a boutique', sub: 'Locate a store near you' },
];

/* ── Normalizer ──────────────────────────────────────────────────────────── */

const strings = (raw: unknown, fallback: string[]): string[] => {
  if (typeof raw === 'string') return raw.trim() ? [raw] : fallback;
  if (!Array.isArray(raw) || raw.length === 0) return fallback;
  return raw.map(v => (typeof v === 'string' ? v : ''));
};

const objects = <T>(raw: unknown, fallback: T[]): T[] => {
  if (!Array.isArray(raw) || raw.length === 0) return fallback;
  return raw.map(v => (v && typeof v === 'object' ? (v as T) : ({} as T)));
};

export const resolveMenuLabels = (c: LecoolStoryContent): string[] =>
  strings(c.menuLabels, DEFAULT_MENU_LABELS);

export const resolveDesignParagraphs = (c: LecoolStoryContent): string[] =>
  strings(c.designParagraphs, DEFAULT_DESIGN_PARAGRAPHS);

export const resolveDesignCards = (c: LecoolStoryContent): LecoolStoryCard[] =>
  objects(c.designCards, DEFAULT_DESIGN_CARDS);

export const resolveDetailRows = (
  c: LecoolStoryContent
): LecoolStoryDetailRow[] => objects(c.detailRows, DEFAULT_DETAIL_ROWS);

export const resolveProductImages = (c: LecoolStoryContent): string[] =>
  strings(c.productImages, DEFAULT_PRODUCT_IMAGES);

export const resolveProductColors = (
  c: LecoolStoryContent
): LecoolStoryColor[] => objects(c.productColors, DEFAULT_PRODUCT_COLORS);

export const resolveProductSpecs = (c: LecoolStoryContent): LecoolStorySpec[] =>
  objects(c.productSpecs, DEFAULT_PRODUCT_SPECS);

export const resolveProductActions = (
  c: LecoolStoryContent
): LecoolStoryAction[] => objects(c.productActions, DEFAULT_PRODUCT_ACTIONS);

/**
 * Toạ độ stage khi zoom vào hotspot `i`: kéo hotspot về giữa khung rồi kẹp lại
 * để không lộ mép ảnh. Trả về % (xPercent/yPercent của GSAP).
 */
export function stagePlacement(
  row: LecoolStoryDetailRow | undefined,
  zoomed: boolean,
  zoom: number,
  hotspot: number
) {
  const k = zoomed ? zoom : 1;
  if (!zoomed || !row) return { k, x: 0, y: 0 };

  const clamp = (v: number) => Math.min(0, Math.max(1 - k, v));
  return {
    k,
    x: clamp(0.5 - (k * ((row.x ?? 0) + hotspot / 2)) / PANE_W) * 100,
    y: clamp(0.5 - (k * ((row.y ?? 0) + hotspot / 2)) / PANE_H) * 100,
  };
}
