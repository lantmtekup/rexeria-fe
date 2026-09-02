/**
 * Data mặc định + resolver cho `westly_residences` — tách khỏi module block để
 * LayersPanel/def/factory import mà không kéo cả component vào bundle
 * (giữ tác dụng của dynamic() trong registry — precedent pnjHeroFrames).
 *
 * Toạ độ hotspot + specs đọc thẳng từ chữ in trên bản vẽ (port nguyên từ
 * apps/the-westly FinalResidences.tsx).
 */
import type { WestlyResidenceItem, WestlyResidencesContent } from '../types';

const PENTHOUSE_B_HOTSPOTS: WestlyResidenceItem['hotspots'] = [
  {
    id: 'primary-bedroom',
    name: 'Primary Bedroom',
    x: 9,
    y: 30,
    specs: [
      { label: 'Dimension', value: '16’1" x 14’9"' },
      { label: 'Bed', value: 'King bed' },
      { label: 'Level', value: 'Main level' },
      { label: 'Closet', value: 'Two walk-ins' },
    ],
  },
  {
    id: 'bedroom-2',
    name: 'Bedroom',
    x: 18.3,
    y: 28,
    specs: [
      { label: 'Dimension', value: '12’4" x 10’0"' },
      { label: 'Bed', value: 'Queen bed' },
      { label: 'Level', value: 'Main level' },
      { label: 'Closet', value: 'Walk-in' },
    ],
  },
  {
    id: 'bedroom-3',
    name: 'Bedroom',
    x: 25.7,
    y: 28,
    specs: [
      { label: 'Dimension', value: '11’9" x 9’10"' },
      { label: 'Bed', value: 'Queen bed' },
      { label: 'Level', value: 'Main level' },
      { label: 'Bath', value: 'En suite' },
    ],
  },
  {
    id: 'bedroom-4',
    name: 'Bedroom',
    x: 33.5,
    y: 28,
    specs: [
      { label: 'Dimension', value: '12’8" x 10’5"' },
      { label: 'Bed', value: 'Queen bed' },
      { label: 'Level', value: 'Main level' },
      { label: 'Bath', value: 'En suite' },
    ],
  },
  {
    id: 'living-dining',
    name: 'Living / Dining Room',
    x: 49.5,
    y: 30,
    specs: [
      { label: 'Dimension', value: '16’9" x 34’9"' },
      { label: 'Feature', value: 'Fireplace' },
      { label: 'Level', value: 'Main level' },
      { label: 'Ceiling', value: '11 feet' },
    ],
  },
  {
    id: 'laundry',
    name: 'Laundry',
    x: 34.8,
    y: 40.5,
    specs: [
      { label: 'Feature', value: 'W / DW / D' },
      { label: 'Level', value: 'Main level' },
    ],
  },
  {
    id: 'foyer',
    name: 'Foyer',
    x: 47.5,
    y: 47,
    specs: [
      { label: 'Access', value: 'Private landing' },
      { label: 'Level', value: 'Main level' },
    ],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    x: 58.8,
    y: 60,
    specs: [
      { label: 'Dimension', value: '19’10" x 9’5"' },
      { label: 'Feature', value: 'Pantry' },
      { label: 'Level', value: 'Main level' },
      { label: 'Layout', value: 'Island' },
    ],
  },
  {
    id: 'primary-bath',
    name: 'Primary Bath',
    x: 6,
    y: 58,
    specs: [
      { label: 'Feature', value: 'Soaking tub' },
      { label: 'Vanity', value: 'Double' },
      { label: 'Level', value: 'Main level' },
      { label: 'Shower', value: 'Separate' },
    ],
  },
  {
    id: 'wic-north',
    name: 'Walk-in Closet',
    x: 16.5,
    y: 50.5,
    specs: [
      { label: 'Serves', value: 'Bedroom 2' },
      { label: 'Level', value: 'Main level' },
    ],
  },
  {
    id: 'wic-primary',
    name: 'Walk-in Closet',
    x: 15,
    y: 75.5,
    specs: [
      { label: 'Serves', value: 'Primary suite' },
      { label: 'Level', value: 'Main level' },
    ],
  },
  {
    id: 'terrace',
    name: 'Private Terrace',
    x: 81,
    y: 32,
    specs: [
      { label: 'Dimension', value: '24’9" x 43’2"' },
      { label: 'Level', value: 'Rooftop' },
      { label: 'Access', value: 'Interior stair' },
      { label: 'Exposure', value: 'Open sky' },
    ],
  },
  {
    id: 'outdoor-kitchen',
    name: 'Outdoor Kitchen',
    x: 74,
    y: 49,
    specs: [
      { label: 'Feature', value: 'Built-in grill' },
      { label: 'Level', value: 'Rooftop' },
    ],
  },
];

const A15_HOTSPOTS: WestlyResidenceItem['hotspots'] = [
  {
    id: 'primary-bedroom',
    name: 'Primary Bedroom',
    x: 14.6,
    y: 42,
    specs: [
      { label: 'Dimension', value: '15’0" x 16’1"' },
      { label: 'Bed', value: 'King bed' },
      { label: 'Bath', value: 'En suite' },
      { label: 'Closet', value: 'Walk-in' },
    ],
  },
  {
    id: 'bedroom-2',
    name: 'Bedroom',
    x: 27.5,
    y: 41,
    specs: [
      { label: 'Dimension', value: '11’7" x 11’1"' },
      { label: 'Bed', value: 'Queen bed' },
      { label: 'Closet', value: 'Reach-in' },
    ],
  },
  {
    id: 'bedroom-3',
    name: 'Bedroom',
    x: 37.6,
    y: 40,
    specs: [
      { label: 'Dimension', value: '11’1" x 10’11"' },
      { label: 'Bed', value: 'Queen bed' },
      { label: 'Bath', value: 'Shared' },
    ],
  },
  {
    id: 'bedroom-4',
    name: 'Bedroom',
    x: 49,
    y: 40,
    specs: [
      { label: 'Dimension', value: '10’6" x 10’11"' },
      { label: 'Bed', value: 'Queen bed' },
      { label: 'Bath', value: 'Shared' },
    ],
  },
  {
    id: 'bedroom-5',
    name: 'Bedroom',
    x: 59,
    y: 40,
    specs: [
      { label: 'Dimension', value: '11’3" x 11’2"' },
      { label: 'Bed', value: 'Queen bed' },
      { label: 'Bath', value: 'En suite' },
    ],
  },
  {
    id: 'living-room',
    name: 'Living Room',
    x: 84.4,
    y: 47,
    specs: [
      { label: 'Dimension', value: '19’11" x 25’0"' },
      { label: 'Exposure', value: 'Corner' },
      { label: 'Access', value: 'Terrace' },
    ],
  },
  {
    id: 'dining-room',
    name: 'Dining Room',
    x: 74,
    y: 22,
    specs: [
      { label: 'Dimension', value: '12’7" x 20’2"' },
      { label: 'Access', value: 'Terrace' },
    ],
  },
  {
    id: 'terrace-north',
    name: 'Terrace',
    x: 41,
    y: 21.5,
    specs: [
      { label: 'Dimension', value: '10’6" x 47’11"' },
      { label: 'Runs along', value: 'Bedrooms' },
    ],
  },
  {
    id: 'terrace-corner',
    name: 'Terrace',
    x: 90,
    y: 21.5,
    specs: [{ label: 'Dimension', value: '11’10" x 11’9"' }],
  },
  {
    id: 'terrace-kitchen',
    name: 'Terrace',
    x: 88.5,
    y: 79,
    specs: [
      { label: 'Dimension', value: '25’6" x 13’0"' },
      { label: 'Feature', value: 'Built-in grill' },
    ],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    x: 76.7,
    y: 78,
    specs: [
      { label: 'Dimension', value: '23’8" x 9’4"' },
      { label: 'Feature', value: 'Pantry' },
      { label: 'Appliances', value: 'Frz · Ref · Oven' },
    ],
  },
  {
    id: 'foyer',
    name: 'Foyer',
    x: 65.4,
    y: 55,
    specs: [{ label: 'Access', value: 'Private landing' }],
  },
  {
    id: 'primary-bath',
    name: 'Primary Bath',
    x: 12,
    y: 55,
    specs: [
      { label: 'Feature', value: 'Soaking tub' },
      { label: 'Vanity', value: 'Double' },
    ],
  },
  {
    id: 'wic',
    name: 'Walk-in Closet',
    x: 25,
    y: 64.5,
    specs: [{ label: 'Serves', value: 'Primary suite' }],
  },
  {
    id: 'laundry',
    name: 'Laundry',
    x: 44,
    y: 67,
    specs: [{ label: 'Feature', value: 'Two W / D' }],
  },
];

const B14_HOTSPOTS: WestlyResidenceItem['hotspots'] = [
  {
    id: 'bedroom-a',
    name: 'Bedroom',
    x: 14.5,
    y: 27,
    specs: [
      { label: 'Dimension', value: '10’10" x 10’7"' },
      { label: 'Bed', value: 'Queen bed' },
      { label: 'Bath', value: 'Shared' },
      { label: 'Closet', value: 'Reach-in' },
    ],
  },
  {
    id: 'bedroom-b',
    name: 'Bedroom',
    x: 34,
    y: 26.5,
    specs: [
      { label: 'Dimension', value: '10’1" x 11’6"' },
      { label: 'Bed', value: 'Queen bed' },
      { label: 'Bath', value: 'Shared' },
      { label: 'Closet', value: 'Reach-in' },
    ],
  },
  {
    id: 'primary-bedroom',
    name: 'Primary Bedroom',
    x: 54,
    y: 28,
    specs: [
      { label: 'Dimension', value: '16’0" x 14’0"' },
      { label: 'Bed', value: 'King bed' },
      { label: 'Bath', value: 'En suite' },
      { label: 'Closet', value: 'Walk-in' },
    ],
  },
  {
    id: 'living-dining',
    name: 'Living / Dining Room',
    x: 78,
    y: 40,
    specs: [
      { label: 'Dimension', value: '14’8" x 26’11"' },
      { label: 'Exposure', value: 'North' },
      { label: 'Windows', value: 'Full height' },
    ],
  },
  {
    id: 'primary-bath',
    name: 'Primary Bath',
    x: 57,
    y: 50,
    specs: [
      { label: 'Vanity', value: 'Double' },
      { label: 'Feature', value: 'Soaking tub' },
      { label: 'Shower', value: 'Separate' },
    ],
  },
  {
    id: 'wic',
    name: 'Walk-in Closet',
    x: 36,
    y: 55,
    specs: [{ label: 'Serves', value: 'Primary suite' }],
  },
  {
    id: 'laundry',
    name: 'Laundry',
    x: 32,
    y: 74.5,
    specs: [{ label: 'Feature', value: 'W / D' }],
  },
  {
    id: 'kitchen',
    name: 'Kitchen',
    x: 73.5,
    y: 78,
    specs: [
      { label: 'Dimension', value: '14’8" x 9’6"' },
      { label: 'Feature', value: 'Pot filler' },
      { label: 'Appliances', value: 'DW · Ref · Oven' },
    ],
  },
  {
    id: 'foyer',
    name: 'Foyer',
    x: 41.5,
    y: 86,
    specs: [{ label: 'Access', value: 'Private landing' }],
  },
];

export const WESTLY_DEFAULT_RESIDENCES: WestlyResidenceItem[] = [
  {
    id: 'penthouse-b',
    title: 'Penthouse B',
    planUrl: '/the-westly/s4-new.png',
    planAlt: 'Penthouse B floor plan — main level and rooftop',
    planRatio: '1944 / 730',
    hotspots: PENTHOUSE_B_HOTSPOTS,
    details: {
      bedBath: '4 / 3.5',
      intExt: '3,059 / 1,079',
      price: '$11,500,000',
      monthlyCc: '$4,411',
      reTax: '$7,889',
      status: 'AVAILABLE',
      exposure: 'N,S,E',
    },
    listingUrl: '',
    floorPlanUrl: '',
  },
  {
    id: '15a',
    title: '15A',
    planUrl: '/the-westly/s4-15a.png',
    planAlt: '15A floor plan',
    planRatio: '1562 / 990',
    hotspots: A15_HOTSPOTS,
    details: {
      bedBath: '5 / 4.5',
      intExt: '3,444 / 992',
      price: '$11,995,000',
      monthlyCc: '$4,728',
      reTax: '$8,457',
      status: 'AVAILABLE',
      exposure: 'N,S,E',
    },
    listingUrl: '',
    floorPlanUrl: '',
  },
  {
    id: '14b',
    title: '14B',
    planUrl: '/the-westly/s4-14b.webp',
    planAlt: '14B floor plan',
    planRatio: '1011 / 754',
    hotspots: B14_HOTSPOTS,
    details: {
      bedBath: '3 / 2.5',
      intExt: '2,122',
      price: '$3,995,000',
      monthlyCc: '$2,262',
      reTax: '$4,369',
      status: 'AVAILABLE',
      exposure: 'N',
    },
    listingUrl: '',
    floorPlanUrl: '',
  },
];

/** Danh sách căn sau chuẩn hoá — rỗng thì rơi về bộ mặc định. */
export function resolveWestlyResidences(
  content: WestlyResidencesContent | null | undefined
): WestlyResidenceItem[] {
  const list = content?.residences;
  if (!Array.isArray(list) || list.length === 0) {
    return WESTLY_DEFAULT_RESIDENCES;
  }
  return list;
}

/** '1944 / 730' → 2.663 (fallback 2 khi thiếu/hỏng). */
export function westlyPlanRatio(item: WestlyResidenceItem): number {
  const [w, h] = (item.planRatio ?? '').split('/').map(Number);
  if (!w || !h || Number.isNaN(w) || Number.isNaN(h)) return 2;
  return w / h;
}
