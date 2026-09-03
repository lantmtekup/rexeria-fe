export const GOLD = '#B68D45';
export const PAPER = '#F5F5F5';
export const INK = '#1D1D1B';

export const PANE_W = 1086;
export const PANE_H = 840;

export const STORY_SECTIONS = [
  { id: 'design', label: 'Design' },
  { id: 'details', label: 'Details' },
  { id: 'products', label: 'Products' },
] as const;

export const CROWN_W = 159;
export const CROWN_H = 118;
const ITEM_H = 26;
const ITEM_GAP = 32;
export const MENU_STACK_H = CROWN_H + ITEM_H * 3 + ITEM_GAP * 2; // 260

export function menuLayout(active: number) {
  let y = 0;
  let crownTop = 0;
  const itemTop: number[] = [];

  for (let i = 0; i < STORY_SECTIONS.length; i += 1) {
    if (i === active) {
      crownTop = y;
      y += CROWN_H;
    }
    itemTop.push(y);
    y += ITEM_H;
    if (i < STORY_SECTIONS.length - 1) y += ITEM_GAP;
  }

  return { crownTop, itemTop };
}

/* ── Panel 1 — Design (#2315:1833) ─────────────────────────────────────────── */

export const DESIGN_HEADING = {
  gold: 'Le Cool Move',
  rest: ' was designed accordingly',
} as const;

export const DESIGN_BODY = [
  'Extending the world of the Cool Box, it softens the structure entirely: supple Sellier Calf leather, freer movement, and a silhouette designed to follow the body rather than argue with it.',
  'The signature strap and emblematic D remain, though with a noticeably lighter state of mind.',
] as const;

export const DESIGN_CARDS = {
  rain: { src: '/story/design-rain.jpg', caption: 'Le Cool Move - Rain' },
  morningDew: {
    src: '/story/design-morning-dew.jpg',
    caption: 'Le Cool Move - Morning Dew',
  },
} as const;

export const DESIGN_BANNER = {
  heading: 'As you move, the bag moves with you',
  sub: 'The rest is movement, colour, and excellent timing.',
  src: '/story/design-banner.jpg',
} as const;

/* ── Panel 2 — Details (#2315:1963) ────────────────────────────────────────── */

export const DETAILS_IMAGE = '/story/details-bag.jpg';

/**
 * 6 hotspot 32x32. `x`/`y` là toạ độ Figma trong khung 1086x840 → component đổi sang %
 * của "stage" (hộp ảnh đã tính theo contain) để luôn dính đúng vị trí trên chiếc túi.
 */
export const DETAILS_ROWS = [
  {
    label: 'Sellier grained Calf leather',
    thumb: '/story/details-thumb-1.webp',
    w: 21,
    h: 24,
    x: 449,
    y: 312,
  },
  {
    label: 'Soft and silky goatskin lining',
    thumb: '/story/details-thumb-2.webp',
    w: 21,
    h: 24,
    x: 589,
    y: 217,
  },
  {
    label: 'Hidden zip closure and D-shaped buckle',
    thumb: '/story/details-thumb-3.webp',
    w: 26,
    h: 16,
    x: 747,
    y: 349,
  },
  {
    label: '1 interior flat pocket',
    thumb: '/story/details-thumb-4.webp',
    w: 22,
    h: 24,
    x: 527,
    y: 537,
  },
  {
    label: 'Removable and adjustable leather shoulder strap',
    thumb: '/story/details-thumb-5.webp',
    w: 24,
    h: 25,
    x: 746,
    y: 536,
  },
  {
    label: 'Palladium metal hardware',
    thumb: '/story/details-thumb-hardware.jpg',
    w: 15,
    h: 32,
    x: 979,
    y: 571,
  },
] as const;

/* ── Panel 3 — Products (#2315:1851) ───────────────────────────────────────── */

export const PRODUCT_IMAGES = [
  '/story/product-1.jpg',
  '/story/product-2.jpg',
  '/story/product-3.jpg',
  '/story/product-4.jpg',
  '/story/product-5.jpg',
  '/story/product-6.jpg',
] as const;

export const PRODUCT_NAME = 'Cool Move';

export const PRODUCT_COLORS = [
  { name: 'Rain', from: '#999A97', to: '#343433' },
  { name: 'Sand', from: '#7D745D', to: '#E3D3A9' },
  { name: 'Lilac', from: '#BAB7C8', to: '#5B5A62' },
  { name: 'Noir', from: '#000000', to: '#666666' },
  { name: 'Cacao', from: '#8C6C54', to: '#261D17' },
] as const;

export const PRODUCT_SPECS = [
  {
    icon: 'ruler',
    label: 'Dimensions',
    value: 'W 26.5 / H 15.5 / D 11 cm (in)',
  },
  { icon: 'bag', label: 'Sizes', value: 'MM' },
] as const;

export const PRODUCT_ACTIONS = [
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
] as const;

export type SpecIcon = (typeof PRODUCT_SPECS)[number]['icon'];
export type ActionIcon = (typeof PRODUCT_ACTIONS)[number]['icon'];
