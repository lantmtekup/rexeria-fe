/**
 * Preset nội dung 3 section showcase của 212 West 72nd — DATA THUẦN (không
 * React/next) để script seed và toolbar dùng chung. Port từ
 * apps/212-west/app/data/showcase.ts.
 *
 * 3 preset ↔ 3 BlockType dùng chung component `West72Showcase`
 * (`west72_showcase` = Kitchens, `_landmark`, `_sanctuary`) để mỗi section hiện
 * thành 1 mục riêng trong dialog Thêm block.
 */
import type { West72ShowcaseContent, West72ShowcaseHotspot } from '../types';

export const WEST72_SHOWCASE_TYPES = [
  'west72_showcase',
  'west72_showcase_landmark',
  'west72_showcase_sanctuary',
] as const;

export type West72ShowcaseType = (typeof WEST72_SHOWCASE_TYPES)[number];

/** Mọi nhánh editor keyed theo blockType của showcase phải dùng hàm này. */
export const isWest72ShowcaseType = (
  type: string | undefined | null
): type is West72ShowcaseType =>
  (WEST72_SHOWCASE_TYPES as readonly string[]).includes(type ?? '');

const KITCHEN_HOTSPOTS: West72ShowcaseHotspot[] = [
  {
    label: 'Miele Dishwasher',
    desc: 'Fully-integrated dishwasher; two dishwashers in select residences',
    dotX: 44.3,
    dotY: 37,
    labelSide: 'bottom',
  },
  {
    label: 'Custom Cabinetry',
    desc: 'Custom white matte lacquer millwork cabinetry with polished nickel pulls. Select residences include full-height pantries',
    dotX: 61.9,
    dotY: 22.3,
    labelSide: 'bottom',
  },
  {
    label: 'Blanco Sink',
    desc: 'Stainless steel Blanco sink with Insinkerator garbage disposal and polished nickel faucet',
    dotX: 50.5,
    dotY: 49.4,
    labelSide: 'bottom',
  },
  {
    label: 'Miele Speed Oven',
    desc: 'Miele speed oven in brilliant white',
    dotX: 58.5,
    dotY: 45.7,
    labelSide: 'top',
  },
  {
    label: 'Miele Oven & Cooktop',
    desc: 'Miele gas cooktop and oven in Brilliant White; two ovens in select residences',
    dotX: 69.9,
    dotY: 44.4,
    labelSide: 'bottom',
  },
  {
    label: 'Quartzite',
    desc: 'Quartzite slab backsplash and countertops, featuring waterfall edge; honed finish',
    dotX: 82.7,
    dotY: 53.9,
    labelSide: 'bottom',
  },
  {
    label: 'Wine Refrigerator',
    desc: 'Select residences feature wine refrigerators',
    dotX: 90.5,
    dotY: 48.7,
    labelSide: 'bottom',
  },
  {
    label: 'Miele Refrigerator',
    desc: 'Integrated Miele refrigerator with custom cabinet front panel',
    dotX: 91.8,
    dotY: 17.5,
    labelSide: 'bottom',
  },
];

/** dotY đã quy đổi từ khung 12/7 sang khung full màn 1440×900 (×0.933). */
const SANCTUARY_HOTSPOTS: West72ShowcaseHotspot[] = [
  {
    label: 'Fluted-Glass Shower',
    desc: 'Ribbed glass encloses the generous shower clad in Venus White marble walls and a marble mosaic patterned floor; Select residences include a recessed niche.',
    dotX: 23.1,
    dotY: 36.1,
    labelSide: 'bottom',
  },
  {
    label: 'Soaking Tub',
    desc: 'Kohler under-mount soaking tub surrounded in honed Venus White marble',
    dotX: 16.3,
    dotY: 76.3,
    labelSide: 'bottom',
  },
  {
    label: 'Honed Marble',
    desc: 'Venus White marble floors and walls with honed finish',
    dotX: 41.1,
    dotY: 77,
    labelSide: 'bottom',
  },
  {
    label: 'Double Vanity',
    desc: 'Vanity by CetraRuddy clad in leathered textile, with deep drawers and custom polished nickel pulls, with a Pure White Caesarstone vanity deck.',
    dotX: 59.1,
    dotY: 71,
    labelSide: 'bottom',
  },
  {
    label: 'Kohler Water Closet',
    desc: '',
    dotX: 58.2,
    dotY: 65.8,
    labelSide: 'top',
  },
  {
    label: 'Original Design by CetraRuddy',
    desc: 'Mirrors, medicine cabinets, and light fixtures by CetraRuddy',
    dotX: 57,
    dotY: 37.9,
    labelSide: 'bottom',
  },
];

export type West72ShowcasePresetId = 'landmark' | 'kitchens' | 'sanctuary';

export const WEST72_SHOWCASE_PRESET_LABELS: Record<
  West72ShowcasePresetId,
  string
> = {
  landmark: 'Landmark Views',
  kitchens: 'Custom-Designed Kitchens',
  sanctuary: 'Your Private Sanctuary',
};

/** 3 section của apps/212-west data/showcase.ts, thứ tự trên trang. */
export const WEST72_SHOWCASE_PRESETS: Record<
  West72ShowcasePresetId,
  West72ShowcaseContent
> = {
  landmark: {
    chip: 'LOCATION VIEW',
    title: 'Landmark\nViews',
    desc: 'Windows with high-performance, sound-attenuating glass welcome abundant light while both buffering city noise and protecting against glare, ultraviolet exposure, and solar heat gain.',
    imageUrl: '/212-west/designed-for-new-yorkers.jpg',
    imageAlt:
      'Dining room at 212 West 72nd looking out over neighbouring landmark buildings',
    cardAnchor: 'bottom-right',
    revealMode: 'split',
    textAlign: 'left',
    fullHeight: true,
    hotspots: [],
  },
  kitchens: {
    chip: 'Kitchens',
    title: 'Custom-Designed\nKitchens',
    desc: 'Subtle details that speak to CetraRuddy’s talent for designing uniquely harmonious interiors include careful alignment of the horizontal and vertical lines of cabinetry and countertops. Cabinets and drawers are fully optimized for storage.',
    imageUrl: '/212-west/background-custom-designed-kitchens.png',
    imageAlt:
      'Custom-designed kitchen with Miele appliances and quartzite tops',
    cardAnchor: 'top-left',
    revealMode: 'combined',
    textAlign: 'left',
    fullHeight: true,
    hotspots: KITCHEN_HOTSPOTS,
  },
  sanctuary: {
    chip: 'bathroom',
    title: 'Your Private\nSanctuary',
    desc: 'Vanities feature polished nickel accents and large, deep drawers clad in a leathered textile. Medicine cabinets offering abundant storage are framed by a lighted shadow box, and sconces accented by handmade crystal shades cast a romantic light.',
    imageUrl: '/212-west/background-your-private-sancturary.jpg',
    imageAlt:
      'Primary bathroom with honed marble, double vanity and soaking tub',
    cardAnchor: 'top-right',
    // App gốc KHÔNG khai `reveal` cho section này (ảnh + thẻ tĩnh, chỉ hotspot
    // zoom). Host bật 'combined' theo yêu cầu — đây là điểm cố ý lệch app duy
    // nhất; đổi lại bằng control "Bố cục thẻ / reveal" trên canvas.
    revealMode: 'combined',
    textAlign: 'right',
    fullHeight: true,
    hotspots: SANCTUARY_HOTSPOTS,
  },
};

/** Bản sao độc lập (mảng hotspot không dùng chung giữa các block). */
export const west72ShowcasePreset = (
  id: West72ShowcasePresetId
): West72ShowcaseContent => structuredClone(WEST72_SHOWCASE_PRESETS[id]);
