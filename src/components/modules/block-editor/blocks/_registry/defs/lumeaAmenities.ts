/** BlockDef `lumea_amenities`. */
import { ListChecks, Sparkles, Type } from 'lucide-react';
import { LumeaAmenities } from '../../LumeaAmenities';
import type { LumeaAmenitiesContent } from '../../../types';
import type { BlockDef } from '../types';
const VI: LumeaAmenitiesContent = {
  eyebrow: 'Elevated',
  title:
    'Exclusive Amenities Designed for a Lifestyle Beyond Your Apartment Walls',
  items: [
    {
      title: 'Sky Lounge',
      description:
        'A members-only lounge on the crown floor with river-to-river views.',
    },
    {
      title: 'Wellness Spa',
      description: 'Indoor pool, hammam, sauna and treatment rooms.',
    },
    {
      title: 'Private Dining',
      description: "Chef's kitchen and dining room for intimate gatherings.",
    },
    {
      title: 'Fitness Studio',
      description: 'State-of-the-art equipment and private training.',
    },
    {
      title: 'Concierge',
      description: '24/7 attended lobby and white-glove service.',
    },
    {
      title: 'Screening Room',
      description: 'A private cinema for residents and their guests.',
    },
  ],
};
const EN: LumeaAmenitiesContent = { ...VI };
export const lumeaAmenitiesDef: BlockDef<LumeaAmenitiesContent> = {
  type: 'lumea_amenities',
  meta: {
    type: 'lumea_amenities',
    label: 'Amenities - Dark Grid',
    accent: '#a68a5b',
    adminLabel: 'Amenities - Dark Grid',
    gradient: 'from-stone-800 to-neutral-900',
    defaultName: 'Amenities - Dark Grid',
    aiLabelVi:
      'lưới tiện ích nền nâu đậm: heading serif + danh sách tiêu đề/mô tả',
    aiLabelEn: 'dark amenity grid: serif heading + title/description list',
  },
  component: LumeaAmenities,
  defaultContent: { vi: VI, en: EN },
  elements: [
    { key: 'eyebrow', label: 'Eyebrow', icon: Sparkles, fieldType: 'text' },
    { key: 'title', label: 'Tiêu đề', icon: Type, fieldType: 'text' },
    { key: 'items', label: 'Tiện ích', icon: ListChecks },
  ],
};
